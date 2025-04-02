import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Check } from "lucide-react";

export default function PricingSection() {
  const { user } = useAuth();

  // Define all available packages
  const packages = [
    {
      name: "Basic",
      price: "$14.99",
      duration: "one-time",
      description: "Perfect for your next vacation",
      features: [
        "10 complete itineraries",
        "Sharing via link",
        "Advanced customization",
        "Activity regeneration",
        "Email support"
      ],
      isPopular: false,
      link: "/subscribe?package=basic",
      buttonText: "Buy Package",
      buttonClass: "bg-white hover:bg-gray-50 border border-gray-300"
    },
    {
      name: "Premium",
      price: "$24.99",
      duration: "one-time",
      description: "Best value for frequent travelers",
      features: [
        "20 complete itineraries",
        "Enhanced sharing options",
        "Full customization options",
        "Unlimited regenerations",
        "Priority support"
      ],
      isPopular: true,
      link: "/subscribe?package=premium",
      buttonText: "Buy Package",
      buttonClass: "bg-black hover:bg-gray-900 text-white border border-black"
    },
    {
      name: "Ultimate",
      price: "$49.99",
      duration: "one-time",
      description: "For serious travel enthusiasts",
      features: [
        "Unlimited itineraries",
        "Premium sharing features",
        "Advanced customization",
        "Unlimited regenerations",
        "VIP priority support",
        "Lifetime feature updates"
      ],
      isPopular: false,
      link: "/subscribe?package=ultimate",
      buttonText: "Buy Package",
      buttonClass: "bg-white hover:bg-gray-50 border border-gray-300"
    }
  ];

  return (
    <div id="pricing" className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Expert Travel Planning Made Affordable</h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
            Choose the package that fits your travel style and needs. <span className="font-semibold bg-yellow-50 px-2 py-1 rounded">One-time payment only — no subscriptions ever.</span>
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 justify-center">
          {packages.map((pkg, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-lg ${pkg.isPopular ? 'border-2 border-primary-500 shadow-lg' : 'border border-gray-200 shadow-sm'} p-6 flex flex-col relative`}
            >
              {pkg.isPopular && (
                <div className="absolute top-0 right-0 transform rotate-0 px-3 py-1 bg-black text-white text-sm font-medium rounded-bl-lg rounded-tr-lg shadow-md">
                  BEST VALUE
                </div>
              )}
              <h3 className="text-2xl font-bold text-gray-900">{pkg.name}</h3>
              <div className="mt-4 flex items-baseline text-gray-900">
                <span className="text-4xl font-extrabold tracking-tight">{pkg.price}</span>
                <span className="ml-1 text-lg font-medium">/{pkg.duration}</span>
              </div>
              <p className="mt-5 text-gray-500">{pkg.description}</p>
              <ul className="mt-6 space-y-3 flex-1">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <p className="text-base text-gray-700">{feature}</p>
                  </li>
                ))}
              </ul>
              <Link 
                href={pkg.link} 
                className={`mt-8 block w-full ${pkg.buttonClass} rounded-md py-3 px-6 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-center transition duration-150 ease-in-out`}
              >
                {pkg.buttonText}
              </Link>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center max-w-3xl mx-auto p-8 bg-gray-50 rounded-lg shadow-sm">
          <h3 className="text-2xl font-semibold mb-6">Every Package Includes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
              <div className="text-left">
                <span className="font-medium">AI-powered itinerary creation</span>
                <p className="text-sm text-gray-500 mt-1">Custom plans built by advanced AI for your specific travel needs</p>
              </div>
            </div>
            <div className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
              <div className="text-left">
                <span className="font-medium">Personalized recommendations</span>
                <p className="text-sm text-gray-500 mt-1">Activities and sights tailored to your interests and travel style</p>
              </div>
            </div>
            <div className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
              <div className="text-left">
                <span className="font-medium">Local food & transportation tips</span>
                <p className="text-sm text-gray-500 mt-1">Insider recommendations for dining and getting around like a local</p>
              </div>
            </div>
            <div className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
              <div className="text-left">
                <span className="font-medium">Premium PDF download</span>
                <p className="text-sm text-gray-500 mt-1">Take your itinerary anywhere with beautifully formatted documents</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 italic">All purchases come with a one-time payment. No subscriptions or hidden fees.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
