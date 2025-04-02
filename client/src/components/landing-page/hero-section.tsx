import { Link } from "wouter";

export default function HeroSection() {
  return (
    <div className="bg-gradient-to-br from-primary-50 to-blue-100 pt-16 pb-20 md:pt-24 md:pb-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Plan your perfect trip in seconds using 
              <span className="text-primary-500"> AI</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-700 max-w-xl mx-auto md:mx-0">
              Save hours of research with AI-crafted travel plans perfectly matched to your style, budget, and schedule. Our itineraries include hidden gems that even locals recommend.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link href="/create-trip" className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-150 ease-in-out">
                Create Your Itinerary
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              <a href="#features" className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-150 ease-in-out">
                Learn More
              </a>
            </div>
            <p className="mt-4 text-sm text-gray-600 font-medium">
              <i className="fas fa-bolt text-secondary-500 mr-1"></i> Start creating in under 60 seconds
              <span className="mx-2">•</span>
              <i className="fas fa-gift text-secondary-500 mr-1"></i> 3 free professional itineraries
            </p>
          </div>
          <div className="w-full md:w-1/2 mt-8 md:mt-0">
            <img 
              src="https://images.unsplash.com/photo-1530789253388-582c481c54b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=500&q=80" 
              alt="Travel planning with AI" 
              className="rounded-lg shadow-xl max-w-full h-auto" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
