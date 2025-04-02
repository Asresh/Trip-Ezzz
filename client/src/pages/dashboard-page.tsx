import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { ItineraryType } from "@/components/trip/itinerary-display";

export default function DashboardPage() {
  const { user } = useAuth();
  
  const { 
    data: trips, 
    isLoading: isLoadingTrips, 
    isError: isTripsError,
    error: tripsError
  } = useQuery<ItineraryType[]>({
    queryKey: ["/api/trips"],
    enabled: !!user
  });

  const { 
    data: stats, 
    isLoading: isLoadingStats 
  } = useQuery<{ 
    totalTrips: number; 
    remainingTrips: number | "Unlimited"; 
    packageType: string;
    packageName: string;
  }>({
    queryKey: ["/api/user/stats"],
    enabled: !!user
  });

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.username}!</h1>
            <p className="text-gray-600 mt-2">Manage your travel itineraries and account preferences</p>
          </div>

          {/* Stats Section */}
          <div className="grid gap-6 mb-8 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Trips</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <Skeleton className="h-12 w-12" />
                ) : (
                  <div className="text-3xl font-bold">{stats?.totalTrips || 0}</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Trips Remaining</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <Skeleton className="h-12 w-12" />
                ) : (
                  <div className="text-3xl font-bold">
                    {stats?.packageType === "ultimate" ? 
                      <span className="flex items-center">
                        <span className="text-3xl">∞</span>
                        <span className="text-sm ml-2 text-gray-500">Unlimited</span>
                      </span> : 
                      stats?.remainingTrips
                    }
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Your Package</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <Skeleton className="h-12 w-20" />
                ) : (
                  <div className="space-y-2">
                    <Badge 
                      variant={stats?.packageType !== "none" ? "default" : "outline"} 
                      className={`text-sm ${stats?.packageType === "ultimate" ? "bg-purple-600" : stats?.packageType === "premium" ? "bg-black" : ""}`}
                    >
                      {stats?.packageName}
                    </Badge>
                    <div className="text-sm text-gray-500">
                      {stats?.packageType === "ultimate" 
                        ? "Unlimited itineraries" 
                        : stats?.packageType === "none" 
                          ? "No active package" 
                          : stats?.packageType === "basic" 
                            ? "10 total itineraries" 
                            : "20 total itineraries"}
                    </div>
                  </div>
                )}
              </CardContent>
              {!isLoadingStats && stats?.packageType === "none" && (
                <CardFooter>
                  <Link href="/pricing">
                    <Button size="sm" className="w-full bg-black hover:bg-gray-900 text-white">
                      Purchase Package
                    </Button>
                  </Link>
                </CardFooter>
              )}
            </Card>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="trips" className="space-y-4">
            <TabsList>
              <TabsTrigger value="trips">My Trips</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>

            <TabsContent value="trips" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Your Travel Itineraries</h2>
                <Link href="/trip-input">
                  <Button>
                    <span className="mr-2">+</span> Create New Trip
                  </Button>
                </Link>
              </div>

              {isLoadingTrips ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(3)].map((_, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-full" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-16 w-full mb-3" />
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-16" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : isTripsError ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-red-500">
                      <i className="fas fa-exclamation-circle text-3xl mb-2"></i>
                      <p>{tripsError instanceof Error ? tripsError.message : "Failed to load trips"}</p>
                    </div>
                  </CardContent>
                </Card>
              ) : trips && trips.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {trips.map((trip) => (
                    <Card key={trip.id} className="hover:shadow-md transition-shadow duration-300">
                      <CardHeader>
                        <CardTitle>{trip.destination}</CardTitle>
                        <CardDescription>
                          {formatDate(trip.fromDate)} - {formatDate(trip.toDate)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2 mb-4">
                          <Badge variant="outline">{trip.tripType}</Badge>
                          <Badge variant="outline">${trip.budget}</Badge>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-3">{trip.overview}</p>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2">
                        <Link href={`/itinerary/${trip.id}`}>
                          <Button variant="default">View Itinerary</Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center">
                      <i className="fas fa-suitcase-rolling text-gray-300 text-5xl mb-4"></i>
                      <h3 className="text-xl font-medium text-gray-900 mb-2">No trips yet</h3>
                      <p className="text-gray-600 mb-6">Create your first AI-generated travel itinerary!</p>
                      <Link href="/trip-input">
                        <Button>
                          <span className="mr-2">+</span> Create New Trip
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Username</h4>
                    <p>{user.username}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Your Package</h4>
                    <div className="flex items-center gap-2">
                      {isLoadingStats ? (
                        <Skeleton className="h-6 w-24" />
                      ) : (
                        <>
                          <Badge 
                            variant={stats?.packageType !== "none" ? "default" : "outline"} 
                            className={`text-sm ${stats?.packageType === "ultimate" ? "bg-purple-600" : stats?.packageType === "premium" ? "bg-black" : ""}`}
                          >
                            {stats?.packageName}
                          </Badge>
                          {stats?.packageType !== "none" && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Active
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Itinerary Allowance</h4>
                    <p>{isLoadingStats ? (
                      <Skeleton className="h-4 w-32" />
                    ) : (
                      stats?.packageType === "ultimate" 
                        ? "Unlimited itineraries" 
                        : stats?.packageType === "none" || stats?.packageType === "free"
                          ? `${stats?.remainingTrips} of 3 free itineraries remaining`
                          : stats?.packageType === "basic"
                            ? `${stats?.remainingTrips} of 10 itineraries remaining`
                            : `${stats?.remainingTrips} of 20 itineraries remaining`
                    )}</p>
                  </div>
                  {stats?.packageType && stats?.packageType !== "none" && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Payment Type</h4>
                      <p className="text-sm">One-time purchase (no subscription)</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Change Password</Button>
                  {!isLoadingStats && stats?.packageType === "none" && (
                    <Link href="/pricing">
                      <Button className="bg-black hover:bg-gray-900 text-white">
                        Purchase Package
                      </Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
