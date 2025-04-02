import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useLocation } from "wouter";
import { Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type UsageLimitModalProps = {
  onClose: () => void;
  remainingTrips?: number | string;
};

export default function UsageLimitModal({ onClose, remainingTrips = 0 }: UsageLimitModalProps) {
  const [loading, setLoading] = useState(false);
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  // Handle different displays for remaining trips
  const formatRemainingTrips = () => {
    if (remainingTrips === -1 || remainingTrips === "Unlimited") {
      return "You have unlimited itineraries available!";
    } else if (remainingTrips === 0) {
      return "You've used all your available itineraries.";
    } else if (remainingTrips === 1) {
      return "You have 1 itinerary remaining.";
    } else {
      return `You have ${remainingTrips} itineraries remaining.`;
    }
  };
  
  // Helper function to check if trips are unlimited
  const hasUnlimitedTrips = () => {
    return remainingTrips === -1 || remainingTrips === "Unlimited";
  };
  
  // Helper function to check if trips are depleted
  const hasNoTripsLeft = () => {
    return remainingTrips === 0;
  };

  const handleViewPackages = () => {
    navigate("/");
    onClose();
    
    // Use setTimeout to ensure navigation completes before scrolling
    setTimeout(() => {
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleDirectPurchase = (packageType: string) => {
    setLoading(true);
    navigate(`/subscribe?package=${packageType}`);
    onClose();
  };

  const packages = [
    {
      name: "Basic",
      type: "basic",
      price: "$14.99",
      accent: "bg-blue-50 border-blue-200",
      buttonClass: "bg-blue-600 hover:bg-blue-700 text-white",
      features: ["10 complete itineraries", "Regenerate activities", "One-time payment"]
    },
    {
      name: "Premium",
      type: "premium",
      price: "$24.99",
      accent: "bg-gray-50 border-black",
      buttonClass: "bg-black hover:bg-gray-900 text-white",
      popular: true,
      features: ["20 complete itineraries", "Activity regeneration", "Priority support"]
    },
    {
      name: "Ultimate",
      type: "ultimate",
      price: "$49.99",
      accent: "bg-purple-50 border-purple-200",
      buttonClass: "bg-purple-600 hover:bg-purple-700 text-white",
      features: ["Unlimited itineraries", "All premium features", "Future updates"]
    }
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg px-0 pb-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl font-bold text-center">Unlock More Travel Experiences</DialogTitle>
        </DialogHeader>
        
        <div className="px-6 text-center">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-8 h-8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          
          <h4 className="text-xl font-bold text-gray-900 mb-2">
            {hasNoTripsLeft() ? "Purchase required to generate itineraries" : "Package limit reached"}
          </h4>
          <p className="text-gray-600 mb-3 max-w-md mx-auto">
            {formatRemainingTrips()}
          </p>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {hasNoTripsLeft()
              ? "To start creating amazing AI-powered itineraries for your travel plans, please purchase one of our packages below."
              : hasUnlimitedTrips()
                ? "Enjoy creating as many itineraries as you want with your Ultimate plan!"
                : "Upgrade to continue creating more amazing itineraries when you run out."}
          </p>
        </div>
          
        <div className="grid gap-4 pb-4 px-6">
          {packages.map((pkg, index) => (
            <div key={index} className={`border rounded-lg p-4 text-left relative ${pkg.accent}`}>
              {pkg.popular && (
                <div className="absolute -top-3 -right-3 bg-black text-white text-xs font-bold px-3 py-1 rounded-full">
                  POPULAR
                </div>
              )}
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-bold text-lg">{pkg.name}</h3>
                <span className="font-bold text-lg">{pkg.price}</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">One-time payment, not a subscription</p>
              <ul className="text-sm space-y-2 mb-4">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className={`w-full ${pkg.buttonClass}`}
                onClick={() => handleDirectPurchase(pkg.type)}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : `Get ${pkg.name}`}
              </Button>
            </div>
          ))}
        </div>
          
        <div className="bg-gray-50 p-4 text-center border-t">
          <div className="mb-4 flex flex-col space-y-3">
            <Button
              variant="outline"
              onClick={handleViewPackages}
              disabled={loading}
              className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700"
            >
              View All Packages
            </Button>
            <button 
              className="text-gray-500 hover:text-gray-700 text-sm"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
          
          <div className="text-xs text-gray-500">
            All packages are one-time payments. No subscriptions or hidden fees.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
