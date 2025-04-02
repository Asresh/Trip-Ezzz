import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateItinerary, regenerateActivityForTime } from "./openai";
import { 
  createCheckoutSession, 
  createPaymentIntent, 
  handleWebhook,
  createPackagePaymentIntent,
  verifyPaymentIntent
} from "./stripe";
import { setupAuth } from "./auth";

// Session ID to Trip ID mapping (since we don't have user accounts)
const sessionTrips = new Map<string, number[]>();

// Pending trip details awaiting payment
const pendingTrips = new Map<string, any>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // Simple session middleware for non-authenticated routes
  app.use((req, res, next) => {
    // Create a simple session ID if not exists
    if (!req.headers['x-session-id']) {
      req.headers['x-session-id'] = Math.random().toString(36).substring(2, 15);
    }
    next();
  });

  // Get trip by ID - no authorization required
  app.get("/api/trips/:id", async (req, res) => {
    try {
      const tripId = parseInt(req.params.id);
      const trip = await storage.getTripById(tripId);
      
      if (!trip) {
        return res.status(404).json({ error: "Trip not found" });
      }
      
      res.json(trip);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trip" });
    }
  });

  // Generate itinerary directly (no payment)
  app.post("/api/generate-itinerary", async (req, res) => {
    try {
      const tripDetails = req.body;
      
      // Generate itinerary with OpenAI
      const itinerary = await generateItinerary(tripDetails);
      
      // Create a dummy user ID (1 for all trips in this demo)
      const userId = 1;
      
      // Save to database
      const trip = await storage.createTrip({
        userId,
        destination: tripDetails.destination,
        fromDate: tripDetails.fromDate,
        toDate: tripDetails.toDate,
        budget: tripDetails.budget,
        tripType: tripDetails.tripType,
        numberOfTravelers: tripDetails.numberOfTravelers || 2,
        overview: itinerary.overview,
        days: itinerary.days,
        transportationTips: itinerary.transportationTips,
        foodRecommendations: itinerary.foodRecommendations,
        videoRecommendations: itinerary.videoRecommendations,
        createdAt: new Date().toISOString()
      });
      
      // Store session ID to trip ID mapping
      const sessionId = req.headers['x-session-id'] as string;
      if (sessionId) {
        if (!sessionTrips.has(sessionId)) {
          sessionTrips.set(sessionId, []);
        }
        sessionTrips.get(sessionId)?.push(trip.id);
      }
      
      res.status(201).json(trip);
    } catch (error) {
      console.error("Error generating itinerary:", error);
      res.status(500).json({ error: "Failed to generate itinerary" });
    }
  });

  // Direct payment intent for client-side processing
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const tripDetails = req.body;
      
      // Store trip details with session ID temporarily
      const sessionId = req.headers['x-session-id'] as string;
      if (sessionId) {
        pendingTrips.set(sessionId, tripDetails);
      }
      
      // Create payment intent
      const paymentIntent = await createPaymentIntent();
      
      res.json(paymentIntent);
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ error: "Failed to create payment intent" });
    }
  });

  // Payment success webhook or callback
  app.post("/api/payment-success", async (req, res) => {
    try {
      const { sessionId, paymentIntentId } = req.body;
      
      // Get the stored trip details
      let tripDetails;
      const reqSessionId = req.headers['x-session-id'] as string;
      
      if (reqSessionId && pendingTrips.has(reqSessionId)) {
        tripDetails = pendingTrips.get(reqSessionId);
        pendingTrips.delete(reqSessionId);
      } else if (sessionId) {
        // Try to look up by provided session ID if available
        tripDetails = pendingTrips.get(sessionId);
        pendingTrips.delete(sessionId);
      }
      
      if (!tripDetails) {
        return res.status(400).json({ error: "No pending trip details found" });
      }
      
      // Generate itinerary with OpenAI
      const itinerary = await generateItinerary(tripDetails);
      
      // Create a dummy user ID (1 for all trips in this demo)
      const userId = 1;
      
      // Save to database
      const trip = await storage.createTrip({
        userId,
        destination: tripDetails.destination,
        fromDate: tripDetails.fromDate,
        toDate: tripDetails.toDate,
        budget: tripDetails.budget,
        tripType: tripDetails.tripType,
        numberOfTravelers: tripDetails.numberOfTravelers || 2,
        overview: itinerary.overview,
        days: itinerary.days,
        transportationTips: itinerary.transportationTips,
        foodRecommendations: itinerary.foodRecommendations,
        videoRecommendations: itinerary.videoRecommendations,
        createdAt: new Date().toISOString()
      });
      
      // Store session ID to trip ID mapping
      if (reqSessionId) {
        if (!sessionTrips.has(reqSessionId)) {
          sessionTrips.set(reqSessionId, []);
        }
        sessionTrips.get(reqSessionId)?.push(trip.id);
      }
      
      res.status(201).json(trip);
    } catch (error) {
      console.error("Error processing payment success:", error);
      res.status(500).json({ error: "Failed to process payment" });
    }
  });

  // Webhook handler for Stripe events
  app.post("/api/webhook", async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"] as string;
    
    try {
      const result = await handleWebhook(req.body, signature);
      res.json(result);
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(400).json({ error: "Webhook error" });
    }
  });

  // Regenerate a specific part of the itinerary
  app.post("/api/regenerate-activity", async (req, res) => {
    try {
      const { tripId, dayIndex, time } = req.body;
      
      // Get the trip
      const trip = await storage.getTripById(parseInt(tripId));
      
      if (!trip) {
        return res.status(404).json({ error: "Trip not found" });
      }
      
      // Regenerate activity for the specified time
      const updatedTrip = await regenerateActivityForTime(trip, dayIndex, time);
      
      // Update trip in the database
      const savedTrip = await storage.updateTrip(updatedTrip);
      
      res.json(savedTrip);
    } catch (error) {
      console.error("Error regenerating activity:", error);
      res.status(500).json({ error: "Failed to regenerate activity" });
    }
  });

  // Create a payment intent for package purchase
  app.post("/api/purchase-package", async (req, res) => {
    try {
      // Ensure user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      const { packageType } = req.body;
      
      if (!packageType || !['basic', 'premium', 'ultimate'].includes(packageType)) {
        return res.status(400).json({ error: "Invalid package type" });
      }
      
      // Create a payment intent
      const paymentIntent = await createPackagePaymentIntent(packageType as 'basic' | 'premium' | 'ultimate');
      
      res.json(paymentIntent);
    } catch (error) {
      console.error("Error creating payment intent for package:", error);
      res.status(500).json({ error: "Failed to create payment intent for package" });
    }
  });
  
  // Confirm package purchase after payment is complete
  app.post("/api/confirm-package-purchase", async (req, res) => {
    try {
      // Ensure user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      const { packageType, paymentIntentId } = req.body;
      
      if (!packageType || !['basic', 'premium', 'ultimate'].includes(packageType)) {
        return res.status(400).json({ error: "Invalid package type" });
      }
      
      if (!paymentIntentId) {
        return res.status(400).json({ error: "Missing payment intent ID" });
      }
      
      // Verify the payment was successful
      const verification = await verifyPaymentIntent(paymentIntentId);
      
      if (!verification.successful) {
        return res.status(400).json({ error: "Payment verification failed" });
      }
      
      // Determine how many trips to add
      let tripsToAdd = 0;
      if (packageType === 'basic') {
        tripsToAdd = 10;
      } else if (packageType === 'premium') {
        tripsToAdd = 20;
      } else if (packageType === 'ultimate') {
        tripsToAdd = -1; // -1 indicates unlimited trips
      }
      
      // Update the user's package
      const updatedUser = await storage.updateUserPackage(req.user!.id, packageType, tripsToAdd);
      
      res.json({
        success: true,
        packageType,
        user: updatedUser
      });
    } catch (error) {
      console.error("Error confirming package purchase:", error);
      res.status(500).json({ error: "Failed to confirm package purchase" });
    }
  });
  
  // Check if user has remaining trips and if not, return the usage limit and options
  app.get("/api/check-trip-limit", async (req, res) => {
    try {
      // Ensure user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      const user = await storage.getUser(req.user!.id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Unlimited trips
      if (user.remainingTrips === -1) {
        return res.json({ canCreateTrip: true, remainingTrips: "unlimited" });
      }
      
      // No trips left
      if (user.remainingTrips === 0) {
        return res.json({ 
          canCreateTrip: false, 
          remainingTrips: 0,
          message: "You've used all your trip credits. Please purchase a package to continue."
        });
      }
      
      // Has trips left
      return res.json({ 
        canCreateTrip: true, 
        remainingTrips: user.remainingTrips,
        packageType: user.packageType
      });
    } catch (error) {
      console.error("Error checking trip limit:", error);
      res.status(500).json({ error: "Failed to check trip limit" });
    }
  });
  
  // Generate itinerary with authentication and usage tracking
  app.post("/api/generate-authenticated-itinerary", async (req, res) => {
    try {
      // Ensure user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      const user = await storage.getUser(req.user!.id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Check if user has trips remaining (unless they have unlimited)
      const remainingTrips = user.remainingTrips === null ? 0 : user.remainingTrips;
      if (remainingTrips !== -1 && remainingTrips <= 0) {
        return res.status(403).json({ 
          error: "No trip credits remaining",
          message: "You've used all your trip credits. Please purchase a package to continue."
        });
      }
      
      const tripDetails = req.body;
      
      // Generate itinerary with OpenAI
      const itinerary = await generateItinerary(tripDetails);
      
      // Save to database
      const trip = await storage.createTrip({
        userId: user.id,
        destination: tripDetails.destination,
        fromDate: tripDetails.fromDate,
        toDate: tripDetails.toDate,
        budget: tripDetails.budget,
        tripType: tripDetails.tripType,
        numberOfTravelers: tripDetails.numberOfTravelers || 2,
        overview: itinerary.overview,
        days: itinerary.days,
        transportationTips: itinerary.transportationTips,
        foodRecommendations: itinerary.foodRecommendations,
        videoRecommendations: itinerary.videoRecommendations,
        createdAt: new Date().toISOString()
      });
      
      // Decrement the user's remaining trips (if not unlimited)
      if (remainingTrips !== -1) {
        const updatedUser = await storage.decrementRemainingTrips(user.id);
        console.log(`Decremented trips for user ${user.id}. Now has ${updatedUser.remainingTrips} trips remaining.`);
      }
      
      res.status(201).json(trip);
    } catch (error) {
      console.error("Error generating authenticated itinerary:", error);
      res.status(500).json({ error: "Failed to generate itinerary" });
    }
  });

  // Get user's trips
  app.get("/api/trips", async (req, res) => {
    try {
      // Ensure user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      const trips = await storage.getTripsByUserId(req.user!.id);
      res.json(trips);
    } catch (error) {
      console.error("Error fetching user trips:", error);
      res.status(500).json({ error: "Failed to fetch trips" });
    }
  });
  
  // Get user stats
  app.get("/api/user/stats", async (req, res) => {
    try {
      // Ensure user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      const user = await storage.getUser(req.user!.id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Count the user's trips
      const totalTrips = await storage.countTripsByUserId(user.id);
      
      // Determine package name based on type
      let packageName = "Free Plan";
      if (user.packageType === "basic") {
        packageName = "Basic Plan";
      } else if (user.packageType === "premium") {
        packageName = "Premium Plan";
      } else if (user.packageType === "ultimate") {
        packageName = "Ultimate Plan";
      }
      
      // For display purposes:
      // - If user has unlimited trips (ultimate plan), return "Unlimited" string
      // - Otherwise return the number of remaining trips 
      // - Default to 3 for new users (free plan)
      const remainingTrips = user.remainingTrips === -1 ? 
        "Unlimited" : 
        (user.remainingTrips !== null ? user.remainingTrips : 3);
      
      res.json({
        totalTrips,
        remainingTrips,
        packageType: user.packageType || "free", // Default to "free" instead of "none"
        packageName
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ error: "Failed to fetch user stats" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
