import { useEffect, useState } from "react";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useLocation, useSearch } from "wouter";
import { Check, Loader2 } from "lucide-react";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PackageDetailsCard = ({ packageType }: { packageType: string }) => {
  // Define package details based on the selected package
  const packageDetails = {
    basic: {
      name: "Basic Package",
      price: "$14.99",
      trips: "10 itineraries",
      features: [
        "10 complete AI-generated itineraries",
        "Advanced customization",
        "Regenerate activities",
        "Priority support"
      ]
    },
    premium: {
      name: "Premium Package",
      price: "$24.99",
      trips: "20 itineraries",
      features: [
        "20 complete AI-generated itineraries",
        "Sharing via link",
        "Advanced customization",
        "Regenerate activities",
        "Priority support"
      ]
    },
    ultimate: {
      name: "Ultimate Package",
      price: "$49.99",
      trips: "Unlimited itineraries",
      features: [
        "Unlimited AI-generated itineraries",
        "Sharing via link",
        "Advanced customization",
        "Regenerate activities",
        "Priority support",
        "Future feature updates"
      ]
    }
  };

  // Get the correct package info or default to premium
  const details = packageDetails[packageType as keyof typeof packageDetails] || packageDetails.premium;

  return (
    <div className="space-y-4">
      <Card className="bg-gray-50 border-black">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl">{details.name}</CardTitle>
          <div className="text-3xl font-bold mt-1">{details.price}</div>
          <div className="text-sm text-green-600 font-medium mt-1">One-time payment only</div>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-3 rounded-md mb-4">
            <div className="font-semibold text-gray-900 mb-1">What's included:</div>
            <div className="text-lg font-bold text-primary-600">{details.trips}</div>
          </div>
          
          <div className="space-y-3">
            {details.features.map((feature, index) => (
              <div key={index} className="flex items-start">
                <div className="bg-black rounded-full p-1 mr-3 mt-0.5">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm font-medium">Pay once, use forever</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const search = useSearch();
  const params = new URLSearchParams(search);
  const packageType = params.get("package") || "premium";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard`,
        },
        redirect: "if_required",
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      if (paymentIntent && paymentIntent.status === "succeeded") {
        // Confirm the package purchase on the server
        const confirmResponse = await apiRequest("POST", "/api/confirm-package-purchase", {
          packageType,
          paymentIntentId: paymentIntent.id
        });
        
        if (!confirmResponse.ok) {
          throw new Error("Failed to confirm package purchase");
        }
        
        // Invalidate user query to refresh user data
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
        
        toast({
          title: "Payment Successful",
          description: `Your ${packageType} package has been activated!`,
        });
        
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit"
        className="w-full bg-black hover:bg-gray-900 text-white font-semibold py-6 text-lg"
        disabled={!stripe || isSubmitting}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing Payment...
          </span>
        ) : (
          "Complete Secure Purchase"
        )}
      </Button>
    </form>
  );
};

export default function SubscribePage() {
  const [clientSecret, setClientSecret] = useState("");
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const packageType = params.get("package") || "premium";
  
  // If client secret is passed directly in URL, use it
  const urlClientSecret = params.get("client_secret");

  useEffect(() => {
    // If we already have a client secret from URL, use it
    if (urlClientSecret) {
      setClientSecret(urlClientSecret);
      return;
    }
    
    // Otherwise, initiate a new package purchase
    apiRequest("POST", "/api/purchase-package", { packageType })
      .then((res) => res.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          throw new Error("No client secret received");
        }
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: "Could not initialize payment. Please try again.",
          variant: "destructive",
        });
        setLocation("/pricing");
      });
  }, [packageType, urlClientSecret]);

  const capitalizedPackage = packageType.charAt(0).toUpperCase() + packageType.slice(1);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Complete Your {capitalizedPackage} Package</h1>
              
              <div className="inline-flex items-center justify-center px-4 py-2 bg-green-50 border border-green-200 rounded-full mb-4">
                <span className="text-green-700 font-medium flex items-center">
                  <Check className="h-4 w-4 mr-1.5" /> One-time payment only
                </span>
              </div>
              
              <p className="text-gray-600 max-w-xl mx-auto">
                Your purchase includes lifetime access with no recurring fees or hidden charges. Just pay once and start planning amazing trips.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 mb-8">
              <PackageDetailsCard packageType={packageType} />

              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                  <CardDescription>Enter your payment details below</CardDescription>
                </CardHeader>
                <CardContent>
                  {clientSecret ? (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <PaymentForm />
                    </Elements>
                  ) : (
                    <div className="h-40 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-4 border-t border-gray-100">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-green-600 mr-2 flex-shrink-0">
                        <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                      </svg>
                      <span>Secure payment powered by Stripe</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-green-600 mr-2 flex-shrink-0">
                        <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                        <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                      </svg>
                      <span>Your payment information is not stored</span>
                    </div>
                    <div className="flex items-center font-semibold text-sm text-gray-700 mt-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-green-600 mr-2 flex-shrink-0">
                        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                      </svg>
                      <span>This is a one-time payment with no recurring charges</span>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>

            <div className="mt-16 mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="q1">
                  <AccordionTrigger className="text-left font-medium">
                    How does the one-time payment work?
                  </AccordionTrigger>
                  <AccordionContent>
                    Unlike subscription services, our packages are a single payment that gives you lifetime access to a set number of itineraries. You'll never be charged again, and there are no recurring fees or hidden costs.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="q2">
                  <AccordionTrigger className="text-left font-medium">
                    Can I upgrade my package later?
                  </AccordionTrigger>
                  <AccordionContent>
                    Yes! If you purchase a package and later decide you need more itineraries, you can upgrade to a higher tier package anytime. You'll only pay the difference between your current package and the new one.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="q3">
                  <AccordionTrigger className="text-left font-medium">
                    Is my payment information secure?
                  </AccordionTrigger>
                  <AccordionContent>
                    Absolutely. We use Stripe, a PCI-compliant payment processor trusted by millions of companies worldwide. Your payment information is encrypted and never stored on our servers.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="q4">
                  <AccordionTrigger className="text-left font-medium">
                    What happens after I purchase?
                  </AccordionTrigger>
                  <AccordionContent>
                    After your payment is processed, your account will be immediately credited with the number of itineraries included in your package. You'll be redirected to your dashboard where you can start creating your personalized travel plans right away.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="q5">
                  <AccordionTrigger className="text-left font-medium">
                    Do the itineraries expire?
                  </AccordionTrigger>
                  <AccordionContent>
                    No, your purchased itineraries never expire. You can use them whenever you want, at your own pace, for any future trips you're planning.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            
            <div className="text-center mt-8 mb-6">
              <Button 
                variant="ghost" 
                className="text-gray-600 hover:text-gray-800"
                onClick={() => setLocation("/pricing")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-2">
                  <path fillRule="evenodd" d="M18 10a.75.75 0 01-.75.75H4.66l2.1 1.95a.75.75 0 11-1.02 1.1l-3.5-3.25a.75.75 0 010-1.1l3.5-3.25a.75.75 0 111.02 1.1l-2.1 1.95h12.59A.75.75 0 0118 10z" clipRule="evenodd" />
                </svg>
                Back to Pricing Options
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
