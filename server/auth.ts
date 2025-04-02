import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "trip-ezzz-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      console.log("Register request received:", { username: req.body.username });
      
      // Check if username exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        console.log("Registration failed: Username already exists");
        return res.status(400).json({ error: "Username already exists" });
      }

      // Create the user with hashed password
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });
      
      console.log("User created successfully:", { id: user.id, username: user.username });

      // Log the user in
      req.login(user, (err) => {
        if (err) {
          console.error("Login error after registration:", err);
          return res.status(500).json({ error: "Registration successful but login failed", message: err.message });
        }
        
        console.log("User logged in after registration");
        res.status(201).json(user);
      });
    } catch (error) {
      console.error("Registration error:", error);
      
      if (error instanceof Error) {
        res.status(500).json({ 
          error: "Registration failed", 
          message: error.message 
        });
      } else {
        res.status(500).json({ 
          error: "Registration failed", 
          message: "An unexpected error occurred" 
        });
      }
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log("Login attempt for username:", req.body.username);
    
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message: string } | undefined) => {
      if (err) {
        console.error("Login authentication error:", err);
        return res.status(500).json({ 
          error: "Authentication error", 
          message: err.message 
        });
      }
      
      if (!user) {
        console.log("Login failed: Invalid credentials");
        return res.status(401).json({ 
          error: "Invalid credentials", 
          message: info?.message || "The username or password you entered is incorrect" 
        });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("Session login error:", loginErr);
          return res.status(500).json({ 
            error: "Login error", 
            message: loginErr.message 
          });
        }
        
        console.log("Login successful for:", user.username);
        res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(200).json({ message: "Not logged in" });
    }
    
    const username = req.user?.username;
    console.log("Logout request for user:", username);
    
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ 
          error: "Logout failed", 
          message: err.message 
        });
      }
      
      console.log("Logout successful for:", username);
      res.status(200).json({ message: "Successfully logged out" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
  
  // Handle Google Authentication
  app.post("/api/google-auth", async (req, res, next) => {
    try {
      const { username, email, displayName, photoURL, providerId, uid } = req.body;
      
      // Log the request for debugging
      console.log("Google Auth Request:", { 
        username, 
        email, 
        hasDisplayName: !!displayName,
        hasPhotoURL: !!photoURL,
        providerId, 
        uidLength: uid?.length
      });
      
      // Validate required fields
      if (!providerId || !uid) {
        console.error("Missing required provider information", { providerId, uid });
        return res.status(400).json({ error: "Missing provider ID or user ID" });
      }
      
      // First try to find user by provider ID and UID
      let user = await storage.getUserByProviderId(providerId, uid);
      console.log("User by provider lookup result:", !!user);
      
      // If not found, try to find by username
      if (!user && username) {
        user = await storage.getUserByUsername(username);
        console.log("User by username lookup result:", !!user);
      }
      
      // Create the user if it doesn't exist
      if (!user) {
        console.log("Creating new user with Google credentials");
        // Generate random password for OAuth users
        const randomPassword = randomBytes(16).toString('hex');
        const hashedPassword = await hashPassword(randomPassword);
        
        // Make sure we have a valid username
        const validUsername = username || email?.split('@')[0] || 'user' + Date.now();
        
        user = await storage.createUser({
          username: validUsername,
          password: hashedPassword,
          email,
          displayName,
          photoURL,
          providerId,
          uid
        });
      } else if (!user.providerId || !user.uid) {
        // If user exists but doesn't have provider info, update it
        console.log("Updating existing user with Google credentials");
        // This handles the case where a user registered with email/password
        // and then later signs in with Google using the same email
        user = await storage.updateUserGoogle(user.id, providerId, uid, photoURL, displayName);
      } else {
        console.log("Using existing Google-linked user");
      }
      
      // Log in the user
      req.login(user, (err) => {
        if (err) {
          console.error("Error during login:", err);
          return res.status(500).json({ error: "Login failed", message: err.message });
        }
        
        // Return the user object as JSON
        console.log("Google auth successful, returning user:", {
          id: user.id,
          username: user.username,
          hasProvider: !!user.providerId
        });
        
        res.status(200).json(user);
      });
    } catch (error) {
      console.error("Google auth error:", error);
      
      // Format error response
      if (error instanceof Error) {
        res.status(500).json({ 
          error: "Google authentication failed", 
          message: error.message 
        });
      } else {
        res.status(500).json({ 
          error: "Google authentication failed", 
          message: "An unexpected error occurred" 
        });
      }
    }
  });

  app.get("/api/user/stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const userId = req.user!.id;
      const totalTrips = await storage.countTripsByUserId(userId);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Format the remaining trips for display
      const remainingTrips = user.remainingTrips === -1 
        ? "Unlimited" 
        : user.remainingTrips || 0;
      
      // Get package name for display
      let packageName = "No Package";
      if (user.packageType === "basic") packageName = "Basic";
      if (user.packageType === "premium") packageName = "Premium";
      if (user.packageType === "ultimate") packageName = "Ultimate";
      
      res.json({
        totalTrips,
        remainingTrips,
        packageType: user.packageType,
        packageName
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get user stats" });
    }
  });
}
