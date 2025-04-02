import { Link } from "wouter";
import { PlaneTakeoff } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4">
            <PlaneTakeoff className="text-blue-400 h-6 w-6" />
            <span className="font-bold text-xl">Trip Ez</span>
          </div>
          
          <p className="text-gray-400 text-center max-w-md mb-6">
            AI-powered travel itineraries tailored just for you. 
            Let us handle the planning so you can focus on the journey.
          </p>
          
          <div className="flex space-x-6 mb-8">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors duration-150">
              Home
            </Link>
            <a href="/#features" className="text-gray-400 hover:text-white transition-colors duration-150">
              How It Works
            </a>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-4 pt-6 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Trip Ez. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
