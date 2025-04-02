export default function FeaturesSection() {
  return (
    <div id="features" className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">How Trip Ezzz Works</h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Create your perfect travel experience in three simple steps
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="relative p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center text-xl font-bold">1</div>
              <div className="h-14 w-14 text-primary-500 mx-auto mb-4">
                <i className="fas fa-map-marked-alt text-5xl"></i>
              </div>
              <h3 className="text-xl font-medium text-gray-900 text-center">Enter Your Details</h3>
              <p className="mt-4 text-gray-500 text-center">
                Tell us about your destination, dates, budget, and preferences for your dream trip.
              </p>
            </div>

            <div className="relative p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center text-xl font-bold">2</div>
              <div className="h-14 w-14 text-primary-500 mx-auto mb-4">
                <i className="fas fa-robot text-5xl"></i>
              </div>
              <h3 className="text-xl font-medium text-gray-900 text-center">AI Generates Itinerary</h3>
              <p className="mt-4 text-gray-500 text-center">
                Our AI analyzes thousands of possibilities to create your personalized travel plan.
              </p>
            </div>

            <div className="relative p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center text-xl font-bold">3</div>
              <div className="h-14 w-14 text-primary-500 mx-auto mb-4">
                <i className="fas fa-suitcase text-5xl"></i>
              </div>
              <h3 className="text-xl font-medium text-gray-900 text-center">Enjoy Your Journey</h3>
              <p className="mt-4 text-gray-500 text-center">
                Download your detailed itinerary, share with friends, or modify it to your liking.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Enhanced Features</h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Discover what makes our travel planner special
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="text-blue-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-center mb-2">Full Day Planning</h3>
              <p className="text-gray-700 text-center text-sm">
                Every day includes Morning, Afternoon, and Evening activities customized to your preferences.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="text-red-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-center mb-2">Video Recommendations</h3>
              <p className="text-gray-700 text-center text-sm">
                Each itinerary now includes multiple YouTube video guides about your destination.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="text-green-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-center mb-2">Activity Regeneration</h3>
              <p className="text-gray-700 text-center text-sm">
                Don't like a suggested activity? Simply regenerate it with a click while keeping the rest of your plan.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="text-purple-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-center mb-2">Group-Friendly</h3>
              <p className="text-gray-700 text-center text-sm">
                Perfect for solo travelers, couples, families, or large groups with customized recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
