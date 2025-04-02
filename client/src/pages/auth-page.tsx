import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "@/components/auth/login-form";
import SignupForm from "@/components/auth/signup-form";
import { useAuth } from "@/hooks/use-auth";
import { InfoIcon } from "lucide-react";

export default function AuthPage(): JSX.Element {
  const [isLogin, setIsLogin] = useState(true);
  const { user } = useAuth();
  const [_, navigate] = useLocation();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow flex">
        <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 p-4">
            <Card className="w-full max-w-md mx-auto">
              <CardHeader className="bg-primary-500 py-4">
                <CardTitle className="text-xl text-center text-black">
                  {isLogin ? "Log In to Trip Ez" : "Create an Account"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {isLogin ? (
                  <LoginForm onSwitchToSignup={() => setIsLogin(false)} />
                ) : (
                  <SignupForm onSwitchToLogin={() => setIsLogin(true)} />
                )}

              </CardContent>
            </Card>
          </div>
          <div className="w-full md:w-1/2 p-4 mt-8 md:mt-0">
            <div className="max-w-lg mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {isLogin 
                  ? "Welcome back to Trip Ez!" 
                  : "Join Trip Ez Today!"}
              </h2>
              <div className="space-y-6 text-gray-600">
                <p className="text-lg">
                  Plan your perfect trips with our AI-powered itinerary generator. No more spending hours researching and planning!
                </p>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <i className="fas fa-check-circle text-secondary-500 mt-1"></i>
                    </div>
                    <p className="ml-3">
                      <span className="font-medium text-gray-900">Personalized itineraries</span> tailored to your preferences, budget, and timeline
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <i className="fas fa-check-circle text-secondary-500 mt-1"></i>
                    </div>
                    <p className="ml-3">
                      <span className="font-medium text-gray-900">3 free trip plans</span> to get you started on your journey
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <i className="fas fa-check-circle text-secondary-500 mt-1"></i>
                    </div>
                    <p className="ml-3">
                      <span className="font-medium text-gray-900">Download and share</span> your itineraries with friends and family
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">What our travelers say</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg italic text-gray-700">
                  "Trip Ez saved me hours of planning for my trip to Japan. The AI suggested places I never would have discovered on my own!"
                  <div className="mt-2 font-medium text-gray-900 not-italic">— Sarah K.</div>
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