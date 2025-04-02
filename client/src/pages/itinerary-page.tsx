import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ItineraryDisplay, { ItineraryType } from "@/components/trip/itinerary-display";
import LoadingIndicator from "@/components/trip/loading-indicator";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function ItineraryPage() {
  const { id } = useParams();

  const { data: itinerary, isLoading, error } = useQuery<ItineraryType>({
    queryKey: [`/api/trips/${id}`],
    enabled: !!id,
    // Set staleTime to prevent refetching when navigating back
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Add this to maintain the data in cache when component unmounts
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <LoadingIndicator />
          ) : error ? (
            <Card className="max-w-lg mx-auto">
              <CardContent className="pt-6">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {error instanceof Error ? error.message : "Failed to load itinerary"}
                  </AlertDescription>
                </Alert>
                <div className="mt-4 flex justify-center">
                  <Link href="/dashboard">
                    <Button className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 shadow-sm">
                      Go to Dashboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : itinerary ? (
            <ItineraryDisplay itinerary={itinerary} />
          ) : (
            <Card className="max-w-lg mx-auto">
              <CardContent className="pt-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Not Found</AlertTitle>
                  <AlertDescription>
                    The itinerary you're looking for does not exist.
                  </AlertDescription>
                </Alert>
                <div className="mt-4 flex justify-center">
                  <Link href="/">
                    <Button className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 shadow-sm">
                      Go to Home
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
