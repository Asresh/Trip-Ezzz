import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import UsageLimitModal from "@/components/auth/usage-limit-modal";
import { useLocation } from "wouter";

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

export default function TripInputForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showUsageLimitModal, setShowUsageLimitModal] = useState(false);
  const [userRemainingTrips, setUserRemainingTrips] = useState(0);
  const [currentFact, setCurrentFact] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Reset loading state when component mounts and cleanup when unmounting
  useEffect(() => {
    // Reset loading state when component mounts
    setIsLoading(false);
    
    // Reset loading state when component unmounts (in case user navigates away during loading)
    return () => {
      setIsLoading(false);
    };
  }, []);

  // Cycle through travel facts every 5 seconds during loading
  useEffect(() => {
    if (!isLoading) return;
    
    const interval = setInterval(() => {
      setCurrentFact(prev => (prev + 1) % travelFacts.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isLoading]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: "",
      fromDate: "",
      toDate: "",
      budget: undefined,
      tripType: "",
      numberOfTravelers: 2,
      additionalNotes: ""
    }
  });

  // Check if user has a package before form submission
  useEffect(() => {
    if (user) {
      const checkUserPackage = async () => {
        try {
          const res = await apiRequest("GET", "/api/user/stats");
          const stats = await res.json();
          
          // If user has no trips remaining (no package), show modal right away
          if (stats.remainingTrips === 0) {
            setUserRemainingTrips(0);
            setShowUsageLimitModal(true);
          }
        } catch (error) {
          console.error("Failed to check user package", error);
        }
      };
      
      checkUserPackage();
    }
  }, [user]);

  // Track submission state to prevent double submissions
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    
    // Prevent double submissions
    if (isSubmitting) return;
    
    setIsSubmitting(true);

    // Check for active package first
    try {
      const statsRes = await apiRequest("GET", "/api/user/stats");
      const stats = await statsRes.json();
      
      // If user has no trips remaining or doesn't have a package
      if (stats.remainingTrips === 0 || stats.packageType === "none") {
        setUserRemainingTrips(0);
        setShowUsageLimitModal(true);
        setIsSubmitting(false);
        return;
      }
      
      // If user has a valid package, proceed with itinerary generation
      setIsLoading(true);
      
      // Use the authenticated itinerary generation endpoint
      const result = await apiRequest("POST", "/api/generate-authenticated-itinerary", data);
      const json = await result.json();

      if (json.limitReached) {
        // Get the remaining trips from the response or from user stats
        if (json.remainingTrips !== undefined) {
          setUserRemainingTrips(json.remainingTrips);
        }
        setShowUsageLimitModal(true);
        setIsLoading(false);
        setIsSubmitting(false);
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["/api/trips"] });
      toast({
        title: "Itinerary created!",
        description: "Your personalized trip itinerary has been generated."
      });
      
      // Reset loading state before navigation
      setIsLoading(false);
      setIsSubmitting(false);
      
      // Navigate to the itinerary page
      setLocation(`/itinerary/${json.id}`);
    } catch (error) {
      toast({
        title: "Failed to generate itinerary",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-white border-b">
          <h2 className="text-xl font-bold text-gray-700">Create Your Perfect Trip</h2>
        </div>
        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destination</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Paris, Tokyo, New York" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="fromDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
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
                      <FormLabel>To Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget (USD)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500">$</span>
                          </div>
                          <Input 
                            type="number" 
                            placeholder="e.g., 1000" 
                            className="pl-8"
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
                      <FormLabel>Trip Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select trip type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tripTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="numberOfTravelers"
                  render={({ field }) => {
                    const updateValue = (newValue: number) => {
                      // Keep value within min-max limits
                      const clampedValue = Math.min(Math.max(newValue, 1), 20);
                      field.onChange(clampedValue);
                    };

                    const increment = () => updateValue(Number(field.value) + 1);
                    const decrement = () => updateValue(Number(field.value) - 1);
                    
                    return (
                      <FormItem>
                        <FormLabel>Number of Travelers</FormLabel>
                        <div className="flex flex-col space-y-2">
                          <FormControl>
                            <div className="flex flex-col space-y-3">
                              <div className="flex items-center">
                                <div className="relative flex-1 mr-2">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                    </svg>
                                  </div>
                                  <Input 
                                    type="number" 
                                    placeholder="e.g., 2" 
                                    min={1}
                                    max={20}
                                    {...field}
                                    value={field.value || 2}
                                    onChange={(e) => updateValue(Number(e.target.value))}
                                    className="pl-10"
                                    onFocus={(e) => e.target.select()}
                                    onInput={(e) => {
                                      // Get current value
                                      const value = e.currentTarget.value;
                                      
                                      // Replace any non-digit characters
                                      const cleanValue = value.replace(/[^\d]/g, '');
                                      
                                      // Update if the value changed
                                      if (value !== cleanValue) {
                                        e.currentTarget.value = cleanValue;
                                      }
                                      
                                      // Update the form value
                                      if (cleanValue) {
                                        updateValue(Number(cleanValue));
                                      }
                                    }}
                                  />
                                </div>
                                <div className="flex border rounded-md">
                                  <button 
                                    type="button"
                                    onClick={decrement}
                                    disabled={Number(field.value) <= 1}
                                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 disabled:opacity-50 rounded-l-md"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                    </svg>
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={increment}
                                    disabled={Number(field.value) >= 20}
                                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 disabled:opacity-50 rounded-r-md"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                              
                              <div className="text-xs text-gray-500">
                                <span className="font-medium">Tip:</span> Directly type a number between 1-20 or use the controls
                              </div>
                            </div>
                          </FormControl>
                          
                          <div className="flex flex-wrap gap-2 mt-2">
                            {[1, 2, 4, 6, 8].map((value) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() => updateValue(value)}
                                className={`px-3 py-1 text-sm rounded-full border focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 ${
                                  Number(field.value) === value 
                                    ? 'bg-primary-100 border-primary-300 text-primary-700' 
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {value === 1 ? '1 (Solo)' : `${value}`}
                              </button>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">We'll tailor your itinerary for this group size.</p>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="additionalNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us more about your preferences, interests, or any specific requirements..." 
                            rows={4}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="mr-4 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 shadow-sm"
                  onClick={() => setLocation("/")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 shadow-sm font-medium px-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span>Generating...</span>
                      <svg className="animate-spin ml-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </>
                  ) : (
                    <>
                      <span>Generate Itinerary</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
      
      {/* Loading Modal with Travel Facts */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
            <div className="flex flex-col items-center">
              <div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full mb-6"></div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Creating your perfect itinerary...</h3>
              <p className="text-gray-600 mb-6">Our AI is crafting a personalized travel plan just for you.</p>
              
              <div className="bg-gray-50 p-4 rounded-md border mb-6 w-full">
                <h4 className="text-sm uppercase font-semibold text-gray-500 mb-2">Did you know?</h4>
                <p className="text-gray-700 italic">{travelFacts[currentFact]}</p>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-primary h-2 rounded-full animate-pulse"></div>
              </div>
              <p className="text-sm text-gray-500">This may take a few moments</p>
            </div>
          </div>
        </div>
      )}
      
      {showUsageLimitModal && (
        <UsageLimitModal 
          onClose={() => setShowUsageLimitModal(false)} 
          remainingTrips={userRemainingTrips} 
        />
      )}
    </>
  );
}
