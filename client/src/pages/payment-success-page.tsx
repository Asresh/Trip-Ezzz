import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle } from "lucide-react";

export default function PaymentSuccessPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tripId, setTripId] = useState<number | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    async function processPayment() {
      try {
        // Get the session ID from the URL query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');

        if (!sessionId) {
          setError("Missing session information");
          setLoading(false);
          return;
        }

        // Call our backend API to process the successful payment
        const response = await apiRequest("POST", "/api/payment-success", { sessionId });
        const trip = await response.json();

        setTripId(trip.id);
        
        // Success toast
        toast({
          title: "Payment Successful!",
          description: "Your itinerary has been generated successfully.",
          variant: "default",
        });
      } catch (error) {
        console.error("Error processing payment success:", error);
        setError("Failed to process payment. Please contact support.");
        
        // Error toast
        toast({
          title: "Error",
          description: "There was a problem processing your payment.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    processPayment();
  }, [toast]);

  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <Card className="w-full shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Payment Status</CardTitle>
          <CardDescription>
            Processing your payment and generating your itinerary
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            {loading ? (
              <>
                <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
                <p className="text-lg font-medium">Processing your payment...</p>
                <p className="text-sm text-gray-500">
                  This may take a few moments. Please don't close this page.
                </p>
              </>
            ) : error ? (
              <>
                <div className="rounded-full bg-red-100 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-10 w-10 text-red-600"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" x2="9" y1="9" y2="15" />
                    <line x1="9" x2="15" y1="9" y2="15" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-red-700">Payment Error</p>
                <p className="text-center text-gray-600">{error}</p>
              </>
            ) : (
              <>
                <CheckCircle className="h-16 w-16 text-green-500" />
                <p className="text-xl font-medium text-green-700">Payment Successful!</p>
                <p className="text-center text-gray-600">
                  Your itinerary has been generated and is ready to view.
                </p>
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pb-6">
          {!loading && !error && tripId && (
            <Button 
              size="lg" 
              className="mt-4"
              onClick={() => setLocation(`/itinerary/${tripId}`)}
            >
              View Your Itinerary
            </Button>
          )}
          
          {!loading && error && (
            <Button 
              variant="outline" 
              size="lg" 
              className="mt-4"
              onClick={() => setLocation("/")}
            >
              Return to Home
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}