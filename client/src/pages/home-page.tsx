import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect, useRef } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Sparkles, Check, Globe, Navigation, CalendarDays, 
  DollarSign, Users, PlaneTakeoff, LogIn, Star, 
  MapPin, Clock, Coffee, DownloadCloud, Compass, 
  Zap, Award, LucideIcon
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const tripTypeOptions = [
  { value: "adventure", label: "Adventure" },
  { value: "family", label: "Family" },
  { value: "relaxing", label: "Relaxing" },
  { value: "romantic", label: "Romantic" },
  { value: "backpacking", label: "Backpacking" },
  { value: "cultural", label: "Cultural" },
  { value: "foodie", label: "Foodie" },
  { value: "luxury", label: "Luxury" }
];

const formSchema = z.object({
  destination: z.string().min(2, "Destination is required"),
  fromDate: z.string().min(1, "Start date is required"),
  toDate: z.string().min(1, "End date is required"),
  budget: z.coerce.number().min(100, "Budget must be at least $100"),
  tripType: z.string().min(1, "Trip type is required"),
  numberOfTravelers: z.coerce.number().min(1, "At least 1 traveler is required").max(20, "Maximum 20 travelers allowed"),
  additionalNotes: z.string().optional()
}).refine(data => {
  return new Date(data.fromDate) <= new Date(data.toDate);
}, {
  message: "Start date must be before or equal to end date",
  path: ["fromDate"]
});

type FormValues = z.infer<typeof formSchema>;

// Travel facts to show during loading
const travelFacts = [
  "The shortest commercial flight in the world is between the Scottish islands of Westray and Papa Westray, with a flight time of about 2 minutes.",
  "Japan has more than 6,800 islands.",
  "France is the most visited country in the world with over 89 million tourists annually.",
  "The Great Wall of China is not visible from space with the naked eye, contrary to popular belief.",
  "Singapore's Changi Airport has the world's tallest indoor waterfall at 130 feet high.",
  "About 30% of the world's population has never been on an airplane.",
  "San Francisco's famous Golden Gate Bridge is actually red-orange, not golden.",
  "The world's largest hotel is in Saudi Arabia with over 10,000 rooms.",
  "The shortest international bridge is between Spain and Portugal, measuring just 10.5 feet long.",
  "Australia is the only continent without an active volcano.",
  "The Netherlands sends Canada 20,000 tulip bulbs annually as thanks for sheltering the Dutch royal family during WWII.",
  "Vatican City is the smallest country in the world, covering just 0.2 square miles.",
  "More than half of the world's beaches are in Australia.",
  "Alaska has more coastline than all the other U.S. states combined.",
  "The blue whale's heart is so big that a small child could swim through its arteries."
];

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentFact, setCurrentFact] = useState(0);
  const [tripData, setTripData] = useState<FormValues | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  // Cycle through travel facts every 5 seconds during loading
  useEffect(() => {
    if (!isLoading) return;
    
    const interval = setInterval(() => {
      setCurrentFact(prev => (prev + 1) % travelFacts.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isLoading]);

  // Mouse parallax effect for background
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const { left, top, width, height } = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;
        setMousePosition({ x, y });
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Helper function to format date as YYYY-MM-DD for input[type="date"]
  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Get today's date and 7 days from now
  const today = new Date();
  const oneWeekFromNow = new Date(today);
  oneWeekFromNow.setDate(today.getDate() + 7);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: "",
      fromDate: formatDateForInput(today),
      toDate: formatDateForInput(oneWeekFromNow),
      budget: 500,
      tripType: "adventure",
      numberOfTravelers: 1,
      additionalNotes: ""
    }
  });

  const generateItinerary = async () => {
    if (!tripData) return;
    
    try {
      setIsLoading(true);
      
      // Generate itinerary directly (free)
      const result = await apiRequest("POST", "/api/generate-itinerary", tripData);
      const generatedTrip = await result.json();
      
      // Redirect to the itinerary page
      if (generatedTrip.id) {
        window.location.href = `/itinerary/${generatedTrip.id}`;
      } else {
        throw new Error("Failed to generate itinerary");
      }
    } catch (error) {
      toast({
        title: "Generation error",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    // Save the form data for itinerary generation
    setTripData(data);
    
    // Start generation immediately
    await generateItinerary();
  };

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section with Form and Video Background */}
        <section 
          ref={heroRef}
          className="relative py-16 md:py-24 overflow-hidden"
          style={{
            background: "linear-gradient(to bottom, rgba(30, 64, 175, 0.05), rgba(255, 255, 255, 0.9))"
          }}
        >
          {/* Video Background */}
          <div className="absolute inset-0 w-full h-full z-0 opacity-10">
            <video 
              autoPlay 
              muted 
              loop 
              className="w-full h-full object-cover"
              style={{
                transform: `translate(${mousePosition.x * -20}px, ${mousePosition.y * -20}px)`,
                transition: 'transform 0.2s ease-out'
              }}
            >
              <source src="https://assets.mixkit.co/videos/preview/mixkit-traveling-through-the-desert-of-dubai-32807-large.mp4" type="video/mp4" />
            </video>
          </div>
          
          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              {/* Left Column - Marketing Copy */}
              <div 
                className="lg:w-1/2 space-y-7"
              >
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 hover:scale-105 transition-transform duration-300">
                  <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                  AI-Powered Travel Planning
                </div>
                
                <h1 
                  className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight leading-tight"
                  style={{
                    transform: `translate(${mousePosition.x * 10}px, ${mousePosition.y * 10}px)`,
                    transition: 'transform 0.3s ease-out'
                  }}
                >
                  The Ultimate <span className="text-blue-600">AI-Generated</span> Travel Itinerary
                </h1>
                
                <p className="text-xl text-gray-600 max-w-2xl">
                  Experience the future of travel planning with our cutting-edge AI technology.
                  Receive a comprehensive, personalized itinerary tailored exactly 
                  to your preferences, budget, and travel style - completely free.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start hover:translate-x-1 transition-transform duration-300">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-gray-700">Detailed daily activities tailored to your preferences</p>
                  </div>
                  <div className="flex items-start hover:translate-x-1 transition-transform duration-300">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-gray-700">Local food recommendations and transportation tips</p>
                  </div>
                  <div className="flex items-start hover:translate-x-1 transition-transform duration-300">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-gray-700">Customizable itinerary you can access anywhere</p>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Trip Input Form */}
              <div className="lg:w-1/2 w-full">
                <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm transition-all duration-300 hover:shadow-blue-100/20">
                  <CardContent className="p-6">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-4">
                          <div>
                            <FormField
                              control={form.control}
                              name="destination"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center">
                                    <Globe className="h-4 w-4 mr-2" />
                                    Destination
                                  </FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="e.g., Paris, Tokyo, New York" 
                                      className="hover:border-blue-400 transition-colors duration-300"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="fromDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center">
                                    <CalendarDays className="h-4 w-4 mr-2" />
                                    From Date
                                  </FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="date" 
                                      className="hover:border-blue-400 transition-colors duration-300"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="toDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center">
                                    <CalendarDays className="h-4 w-4 mr-2" />
                                    To Date
                                  </FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="date" 
                                      className="hover:border-blue-400 transition-colors duration-300"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="budget"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center">
                                    <DollarSign className="h-4 w-4 mr-2" />
                                    Budget (USD)
                                  </FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500">$</span>
                                      </div>
                                      <Input 
                                        type="number" 
                                        placeholder="e.g., 1000" 
                                        className="pl-8 hover:border-blue-400 transition-colors duration-300"
                                        min={100}
                                        {...field}
                                        value={field.value || ''}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="tripType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center">
                                    <Navigation className="h-4 w-4 mr-2" />
                                    Trip Type
                                  </FormLabel>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="hover:border-blue-400 transition-colors duration-300">
                                        <SelectValue placeholder="Select trip type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {tripTypeOptions.map((option) => (
                                        <SelectItem 
                                          key={option.value} 
                                          value={option.value}
                                          className="hover:bg-blue-50 transition-colors duration-300"
                                        >
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={form.control}
                            name="numberOfTravelers"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center">
                                  <Users className="h-4 w-4 mr-2" />
                                  Number of Travelers
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="e.g., 2" 
                                    min={1}
                                    max={20}
                                    className="hover:border-blue-400 transition-colors duration-300"
                                    {...field}
                                    value={field.value || 1}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="additionalNotes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Additional Notes (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Tell us more about your preferences, interests, or any specific requirements..." 
                                    rows={3}
                                    className="hover:border-blue-400 transition-colors duration-300"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        {user ? (
                          <Button 
                            type="submit"
                            className="w-full py-6 text-lg font-medium bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] transition-all duration-300"
                          >
                            <PlaneTakeoff className="mr-2 h-5 w-5" />
                            Generate Free Itinerary
                          </Button>
                        ) : (
                          <>
                            <div className="flex flex-col space-y-3">
                              <Link href="/auth">
                                <Button 
                                  type="button"
                                  className="w-full py-6 text-lg font-medium bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center"
                                >
                                  <LogIn className="h-5 w-5 mr-2" />
                                  Sign In to Generate Itinerary
                                </Button>
                              </Link>
                              
                              <p className="text-center text-gray-500 text-sm">
                                Don't have an account yet? 
                                <Link href="/auth" className="text-blue-600 ml-1 hover:underline">
                                  Register for free
                                </Link>
                              </p>
                            </div>
                          </>
                        )}
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                Our AI-powered platform creates personalized travel itineraries in just a few steps
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 text-center hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Enter Your Trip Details</h3>
                <p className="text-gray-600">Fill in your destination, dates, budget, and preferences to help our AI understand what you're looking for.</p>
              </div>
              
              <div className="p-6 text-center hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Click Generate Button</h3>
                <p className="text-gray-600">Get your personalized travel itinerary instantly - no payment required.</p>
              </div>
              
              <div className="p-6 text-center hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Get Your Custom Itinerary</h3>
                <p className="text-gray-600">Receive a detailed day-by-day plan with activities, food recommendations, and local transportation tips.</p>
              </div>
            </div>
            
            {/* Pricing CTA */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 mb-4">
                <Star className="h-4 w-4 mr-2" />
                Premium Features
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Need More Itineraries?</h3>
              <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                Upgrade to one of our affordable packages for additional itineraries, premium features, and unlimited trip planning.
              </p>
              <Link href="/pricing-page">
                <Button className="px-8 py-6 text-lg bg-blue-600 hover:bg-blue-700 transition-colors">
                  View Pricing Plans
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Login CTA Section */}
        {!user && (
          <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
            <div className="container mx-auto px-4 md:px-6 text-center">
              <h2 className="text-3xl font-bold mb-6">Ready to Plan Your Dream Vacation?</h2>
              <p className="text-xl max-w-3xl mx-auto mb-8">
                Create a free account today to start generating personalized travel itineraries.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Link href="/auth">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent text-white border-white hover:bg-white hover:text-blue-700">
                    Create Free Account
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
      
      {/* Loading Modal with Travel Facts */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
            <div className="flex flex-col items-center">
              <div className="animate-spin w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mb-6"></div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Creating your perfect itinerary...</h3>
              <p className="text-gray-600 mb-6">Our AI is crafting a personalized travel plan just for you.</p>
              
              <div className="bg-gray-50 p-4 rounded-md border mb-6 w-full">
                <h4 className="text-sm uppercase font-semibold text-gray-500 mb-2">Did you know?</h4>
                <p className="text-gray-700 italic">{travelFacts[currentFact]}</p>
              </div>
              
              <p className="text-sm text-gray-500">This typically takes 20-30 seconds.</p>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}