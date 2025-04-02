import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { PlaneTakeoff, LogIn, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <PlaneTakeoff className="text-blue-600 h-6 w-6" />
              <span className="font-bold text-xl">Trip Ez</span>
            </Link>
          </div>
          <nav className="hidden md:flex space-x-8 items-center">
            <Link href="/" className={`${location === '/' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'} font-medium`}>
              Home
            </Link>
            <a href="/#features" className="text-gray-700 hover:text-blue-600 font-medium">
              How It Works
            </a>
            <Link href="/pricing" className={`${location === '/pricing' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'} font-medium`}>
              Pricing
            </Link>
            
            {user ? (
              <>
                <Link href="/dashboard" className={`${location === '/dashboard' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'} font-medium`}>
                  Dashboard
                </Link>
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                  onClick={handleLogout}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <Link href="/auth">
                <Button variant="default" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            )}
          </nav>
          <div className="md:hidden flex items-center">
            {!mobileMenuOpen && user && (
              <Link href="/dashboard" className="mr-4">
                <User className="h-5 w-5 text-blue-600" />
              </Link>
            )}
            {!mobileMenuOpen && !user && (
              <Link href="/auth" className="mr-4">
                <Button size="sm" variant="default" className="flex items-center gap-1">
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
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
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden bg-white border-t border-gray-200`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link 
            href="/" 
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <a 
            href="/#features" 
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
            onClick={() => setMobileMenuOpen(false)}
          >
            How It Works
          </a>
          <Link 
            href="/pricing" 
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
            onClick={() => setMobileMenuOpen(false)}
          >
            Pricing
          </Link>
          {user ? (
            <>
              <Link 
                href="/dashboard" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button 
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                onClick={handleLogout}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link 
              href="/auth" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In / Register
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
