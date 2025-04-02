import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export type ActivityType = {
  time: string;
  title: string;
  description: string;
  location?: string;
  duration?: string;
  cost?: string;
};

export type DayPlanType = {
  day: number;
  date: string;
  title: string;
  activities: Array<ActivityType>;
};

export type TransportTipType = {
  icon: string;
  title: string;
  description: string;
};

export type FoodRecommendationType = {
  type: string;
  name: string;
  description: string;
};

export type VideoRecommendationType = {
  title: string;
  description: string;
  youtubeUrl: string;
};

export type ItineraryType = {
  id: number;
  userId: number;
  destination: string;
  fromDate: string;
  toDate: string;
  budget: number;
  tripType: string;
  numberOfTravelers: number;
  createdAt: string;
  overview: string;
  days: Array<DayPlanType>;
  transportationTips: Array<TransportTipType>;
  foodRecommendations: Array<FoodRecommendationType>;
  videoRecommendations?: VideoRecommendationType[];
};

type RegeneratingActivityState = {
  dayIndex: number;
  time: string;
} | null;

type ItineraryDisplayProps = {
  itinerary: ItineraryType;
};

export default function ItineraryDisplay({ itinerary }: ItineraryDisplayProps) {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [isSharing, setIsSharing] = useState(false);
  const [regeneratingActivity, setRegeneratingActivity] = useState<{
    dayIndex: number;
    time: string;
  } | null>(null);
  
  // Validate each day has morning, afternoon, and evening activities
  const validateDayActivities = (day: DayPlanType): { isValid: boolean, missingPeriods: string[] } => {
    const periods = ['Morning', 'Afternoon', 'Evening'];
    const existingPeriods = new Set(day.activities.map(activity => activity.time));
    
    // Check which periods are missing
    const missingPeriods: string[] = [];
    periods.forEach(period => {
      if (!existingPeriods.has(period)) {
        missingPeriods.push(period);
      }
    });
    
    return {
      isValid: missingPeriods.length === 0,
      missingPeriods
    };
  };



  const handleShareItinerary = async () => {
    setIsSharing(true);
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied!",
        description: "Itinerary link copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "There was an error sharing your itinerary",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleRegenerateActivity = async (dayIndex: number, time: string) => {
    setRegeneratingActivity({ dayIndex, time });
    
    try {
      // Create data object to send to API
      const data = {
        tripId: itinerary.id,
        dayIndex,
        time,
      };
      
      const response = await apiRequest("POST", "/api/regenerate-activity", data);
      const updatedItinerary = await response.json();
      
      // Update the itinerary in the UI
      // This assumes the API returns the full updated itinerary
      queryClient.setQueryData([`/api/trips/${itinerary.id}`], updatedItinerary);
      
      toast({
        title: "Activity Regenerated",
        description: `The ${time.toLowerCase()} activities for Day ${dayIndex + 1} have been regenerated.`
      });
    } catch (error) {
      toast({
        title: "Regeneration Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    } finally {
      setRegeneratingActivity(null);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-primary-500 px-4 sm:px-6 py-4">
        <h2 className="text-xl font-bold text-black text-center">
          {itinerary.destination} {itinerary.tripType.charAt(0).toUpperCase() + itinerary.tripType.slice(1)} Trip
        </h2>
      </div>
      
      <div className="p-6">
        <div className="mb-8 border-b border-gray-200 pb-4">
          <div className="text-center mb-4">
            <div className="text-sm text-gray-500 mb-1">Destination</div>
            <h3 className="text-2xl font-bold text-gray-900">{itinerary.destination}</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <div className="text-center px-2 sm:px-4 py-2 bg-gray-100 rounded-md">
              <div className="text-xs text-gray-500">Dates</div>
              <div className="text-sm sm:text-base font-medium">
                {formatDate(itinerary.fromDate)} - {formatDate(itinerary.toDate)}
              </div>
            </div>
            <div className="text-center px-2 sm:px-4 py-2 bg-gray-100 rounded-md">
              <div className="text-xs text-gray-500">Budget</div>
              <div className="text-sm sm:text-base font-medium">${itinerary.budget}</div>
            </div>
            <div className="text-center px-2 sm:px-4 py-2 bg-gray-100 rounded-md">
              <div className="text-xs text-gray-500">Trip Type</div>
              <div className="text-sm sm:text-base font-medium capitalize">{itinerary.tripType}</div>
            </div>
            <div className="text-center px-2 sm:px-4 py-2 bg-blue-100 rounded-md border border-blue-200">
              <div className="text-xs text-blue-600">Travelers</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <div className="text-sm sm:text-base font-medium text-blue-700">{itinerary.numberOfTravelers}</div>
                <div className="flex -space-x-2 overflow-hidden">
                  {Array.from({ length: Math.min(itinerary.numberOfTravelers, 3) }).map((_, i) => (
                    <div 
                      key={i} 
                      className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-blue-500 flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  ))}
                  {itinerary.numberOfTravelers > 3 && (
                    <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-blue-700 flex items-center justify-center">
                      <span className="text-xs text-white font-bold">+{itinerary.numberOfTravelers - 3}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-xs text-blue-700 mt-1">
                {itinerary.numberOfTravelers === 1 ? 'Solo Traveler' : 'Group Trip'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Itinerary Overview */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Trip Overview</h4>
          <p className="text-gray-700">{itinerary.overview}</p>
        </div>
        
        {/* Day by Day Itinerary */}
        {itinerary.days.map((day, index) => {
          // Validate if the day has all required time periods
          const { isValid, missingPeriods } = validateDayActivities(day);
          
          return (
            <div key={index} className="mb-8 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-300">
              <h4 className="text-lg font-bold text-primary-600 mb-4">
                Day {day.day}: {day.title}
              </h4>
              
              {!isValid && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-100 rounded-md">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="text-sm text-yellow-700 font-medium">Missing time periods: {missingPeriods.join(', ')}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {missingPeriods.map(period => (
                          <Button
                            key={period}
                            variant="outline"
                            size="sm"
                            className="text-xs bg-white border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                            onClick={() => handleRegenerateActivity(index, period)}
                            disabled={regeneratingActivity?.dayIndex === index && regeneratingActivity?.time === period}
                          >
                            {regeneratingActivity?.dayIndex === index && regeneratingActivity?.time === period ? (
                              <>
                                <div className="animate-spin h-3 w-3 border-2 border-yellow-500 border-t-transparent rounded-full mr-1" />
                                Generating {period}...
                              </>
                            ) : (
                              <>
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Generate {period} Activity
                              </>
                            )}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-6">
                {day.activities.map((activity, activityIndex) => {
                  const timeColors = {
                    Morning: { bg: "bg-amber-100", text: "text-amber-800" },
                    Afternoon: { bg: "bg-blue-100", text: "text-blue-800" },
                    Evening: { bg: "bg-indigo-100", text: "text-indigo-800" },
                    Night: { bg: "bg-purple-100", text: "text-purple-800" },
                  };
                  
                  const timeColor = timeColors[activity.time as keyof typeof timeColors] || 
                                  { bg: "bg-gray-100", text: "text-gray-800" };
                  
                  return (
                    <div key={activityIndex} className="mb-6 border-l-4 border-gray-200 pl-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                        <div className="flex flex-col sm:flex-row sm:items-center mb-2 sm:mb-0">
                          <span className={`inline-block text-sm py-1 px-2 ${timeColor.bg} ${timeColor.text} rounded mb-2 sm:mb-0 sm:mr-2`}>
                            {activity.time}
                          </span>
                          <h5 className="font-medium text-gray-900">{activity.title}</h5>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs self-start h-7 px-2 text-gray-500 hover:text-primary-500"
                          onClick={() => handleRegenerateActivity(index, activity.time)}
                          disabled={regeneratingActivity?.dayIndex === index && regeneratingActivity?.time === activity.time}
                        >
                          {regeneratingActivity?.dayIndex === index && regeneratingActivity?.time === activity.time ? (
                            <div className="animate-spin h-3 w-3 border-2 border-primary-500 border-t-transparent rounded-full mr-1" />
                          ) : (
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          )}
                          Regenerate
                        </Button>
                      </div>
                      <div className="mt-2">
                        <p className="text-gray-700 mb-2">{activity.description}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                          {activity.location && (
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg> 
                              {activity.location}
                            </div>
                          )}
                          {activity.duration && (
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {activity.duration}
                            </div>
                          )}
                          {activity.cost && (
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {activity.cost}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        
        {/* Transportation Information */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center sm:text-left">Transportation Tips</h4>
          <div className="p-4 bg-blue-50 rounded-lg">
            <ul className="space-y-4">
              {itinerary.transportationTips.map((tip, index) => (
                <li key={index} className="flex flex-col sm:flex-row sm:items-start">
                  <svg className="w-5 h-5 text-blue-500 mb-2 sm:mb-0 sm:mt-1 sm:mr-2 self-center sm:self-start" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <div className="text-center sm:text-left">
                    <span className="font-medium block sm:inline">{tip.title}:</span> {tip.description}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Food Recommendations */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center sm:text-left">Must-Try Food & Drinks</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {itinerary.foodRecommendations.map((food, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-800 mb-2 sm:mb-0 sm:mr-3">
                  {food.type === "drink" ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  )}
                </div>
                <div>
                  <h5 className="font-medium mb-1">{food.name}</h5>
                  <p className="text-sm text-gray-600">{food.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Video Recommendation */}
        {itinerary.videoRecommendations && itinerary.videoRecommendations.length > 0 && (
          <div className="mt-8 mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center sm:text-left">
              Top Video Guides for {itinerary.destination}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {itinerary.videoRecommendations.map((video, index) => (
                <div key={index} className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4 border border-red-200 h-full flex flex-col">
                  <h5 className="font-medium text-base mb-2 flex-grow">{video.title}</h5>
                  <p className="text-gray-700 text-sm mb-3">{video.description}</p>
                  <a 
                    href={video.youtubeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-red-600 hover:text-red-800 text-sm font-medium mt-auto"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.861-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M10,15.464V8.536L16,12L10,15.464z"/>
                    </svg>
                    Watch on YouTube
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-gray-50 px-4 sm:px-6 py-4 text-center">
        <span className="text-sm text-gray-500">Generated on {formatDate(itinerary.createdAt)}</span>
      </div>
    </div>
  );
}
