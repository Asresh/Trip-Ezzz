import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import PricingSection from "@/components/landing-page/pricing-section";

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gradient-to-br from-primary-50 to-blue-100 py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">Unlock Your Perfect Travel Experience</h1>
            <div className="flex justify-center mb-6">
              <div className="inline-block bg-white px-4 py-2 rounded-full shadow-sm">
                <span className="text-gray-900 font-semibold">One-time payment</span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-gray-900 font-semibold">No subscriptions</span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-gray-900 font-semibold">Lifetime access</span>
              </div>
            </div>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Choose the package that fits your travel style. All packages include detailed day-by-day itineraries with activities, food recommendations, and transportation tips.
            </p>
          </div>
        </div>
        <PricingSection />
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">How do the free itineraries work?</h3>
                  <p className="text-gray-600">
                    Start exploring right away! Every new user gets 3 free AI-generated travel itineraries. Try our service with no commitment and only purchase a package when you're convinced of its value. Your free itineraries have all the same features as paid ones.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Is this really a one-time payment?</h3>
                  <p className="text-gray-600">
                    <strong>Yes, absolutely!</strong> Each package is a one-time purchase, not a subscription. Pay once and enjoy your itineraries forever — no monthly fees, no surprise charges, no expiration dates. We believe in transparent pricing with no hidden costs.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Which package is right for me?</h3>
                  <p className="text-gray-600">
                    <strong>Basic ($14.99):</strong> Perfect if you have 1-2 trips planned this year.<br/>
                    <strong>Premium ($24.99):</strong> Our best value for frequent travelers with multiple trips.<br/>
                    <strong>Ultimate ($49.99):</strong> Ideal for travel enthusiasts who want unlimited itineraries and lifetime updates.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">How detailed are the itineraries?</h3>
                  <p className="text-gray-600">
                    Each itinerary includes a complete day-by-day plan with morning, afternoon, and evening activities tailored to your preferences. You'll get specific recommendations for attractions, restaurants, transportation options, and local tips — everything you need for a perfectly planned trip with no research required.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">What if I don't like an activity suggestion?</h3>
                  <p className="text-gray-600">
                    No problem! You can regenerate specific activities (morning, afternoon, or evening) with a single click until you're completely satisfied with your itinerary. Our AI will create new suggestions based on your preferences and travel style.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
