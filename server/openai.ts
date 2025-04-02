import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export type TripDetails = {
  destination: string;
  fromDate: string;
  toDate: string;
  budget: number;
  tripType: string;
  numberOfTravelers: number;
  additionalNotes?: string;
};

export type DayPlan = {
  day: number;
  date: string;
  title: string;
  activities: Activity[];
};

export type Activity = {
  time: string;
  title: string;
  description: string;
  location?: string;
  duration?: string;
  cost?: string;
};

export type TransportTip = {
  icon: string;
  title: string;
  description: string;
};

export type FoodRecommendation = {
  type: string;
  name: string;
  description: string;
};

export type VideoRecommendation = {
  title: string;
  description: string;
  youtubeUrl: string;
};

export type GeneratedItinerary = {
  overview: string;
  days: DayPlan[];
  transportationTips: TransportTip[];
  foodRecommendations: FoodRecommendation[];
  videoRecommendations?: VideoRecommendation[];
};

export async function generateItinerary(tripDetails: TripDetails): Promise<GeneratedItinerary> {
  const numDays = getNumberOfDays(tripDetails.fromDate, tripDetails.toDate);
  
  const prompt = `
Create a detailed travel itinerary for a trip to ${tripDetails.destination}.
The trip is from ${tripDetails.fromDate} to ${tripDetails.toDate} (${numDays} days).
The budget is $${tripDetails.budget}.
The trip type is "${tripDetails.tripType}".
Number of travelers: ${tripDetails.numberOfTravelers || 2}.
Additional notes: ${tripDetails.additionalNotes || "None"}

Make sure to customize the trip experience based on the number of travelers (${tripDetails.numberOfTravelers || 2}) and mention this in the overview.

IMPORTANT REQUIREMENTS:
1. For EACH day in the itinerary, you MUST include exactly ONE Morning activity, ONE Afternoon activity, and ONE Evening activity. No more, no less.
2. The overview should include 2-3 interesting and UNIQUE facts about ${tripDetails.destination} that most tourists don't know - these should be specific to this destination and NOT generic travel facts.
3. Each activity description should contain specific details relevant to ${tripDetails.destination} - avoid generic descriptions.
4. Make sure transportation tips are practical and specifically relevant to ${tripDetails.destination}.
5. Include local food specialties that are authentic to ${tripDetails.destination} in the food recommendations.

Please provide a response in JSON format with the following structure:
{
  "overview": "A paragraph overview of the trip that includes 2-3 unique and interesting facts about the destination...",
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "title": "Day title",
      "activities": [
        {
          "time": "Morning",
          "title": "Activity title",
          "description": "Activity description with specific details about the place",
          "location": "Specific address or location name",
          "duration": "Approximate duration",
          "cost": "Approximate cost"
        },
        {
          "time": "Afternoon",
          "title": "Activity title",
          "description": "Activity description with specific details about the place",
          "location": "Specific address or location name",
          "duration": "Approximate duration",
          "cost": "Approximate cost"
        },
        {
          "time": "Evening",
          "title": "Activity title",
          "description": "Activity description with specific details about the place",
          "location": "Specific address or location name",
          "duration": "Approximate duration",
          "cost": "Approximate cost"
        }
      ]
    }
  ],
  "transportationTips": [
    {
      "icon": "fas fa-subway/fas fa-train/fas fa-walking",
      "title": "Tip title",
      "description": "Transportation tip description specific to ${tripDetails.destination}"
    }
  ],
  "foodRecommendations": [
    {
      "type": "food/drink",
      "name": "Food name",
      "description": "Description of the authentic local food/drink and specific places to find it in ${tripDetails.destination}"
    }
  ]
}

Ensure that the activities are appropriate for the ${tripDetails.tripType} trip type and fit within the $${tripDetails.budget} budget.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a travel expert who creates detailed, personalized travel itineraries." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const responseContent = response.choices[0].message.content;
    if (!responseContent) {
      throw new Error("No response content from OpenAI");
    }

    const itinerary = JSON.parse(responseContent) as GeneratedItinerary;
    // Generate YouTube video recommendations for the destination
    const videoRecommendations = await generateYouTubeRecommendations(tripDetails.destination, tripDetails.tripType);
    
    // Add the video recommendations to the itinerary
    return {
      ...itinerary,
      videoRecommendations
    };
  } catch (error) {
    console.error("Error generating itinerary with OpenAI:", error);
    throw new Error("Failed to generate itinerary. Please try again later.");
  }
}

// Function to generate multiple YouTube video recommendations for the destination
async function generateYouTubeRecommendations(destination: string, tripType: string): Promise<VideoRecommendation[]> {
  const prompt = `
I need recommendations for authentic, high-quality YouTube travel videos about ${destination} that fit with a ${tripType} style trip.

Please provide 3 YouTube video recommendations that meet these criteria:
1. Must be from REAL, popular, and well-known travel YouTubers like Rick Steves, Mark Wiens, Drew Binsky, Kara and Nate, or similar
2. Must be focused specifically on ${destination}
3. Must be comprehensive travel guides or vlogs that actually exist
4. Should be engaging and have good production quality
5. Must have specific titles that match actual existing videos
6. Must have REAL YouTube video IDs that actually exist (the portion after v= in YouTube URLs)
7. Each recommendation should cover unique aspects of ${destination}

IMPORTANT: DO NOT MAKE UP VIDEOS. ONLY recommend videos from channels you are 100% certain exist 
with real YouTube URLs. If you're not sure about specific video URLs, use the channel name + destination
in the YouTube URL format.

Return the recommendations in this JSON format:
{
  "recommendations": [
    {
      "title": "The exact title of a real YouTube video",
      "description": "A brief 1-2 sentence description of what the video covers and why it's useful for ${tripType} travelers",
      "youtubeUrl": "https://www.youtube.com/watch?v=videoID" 
    },
    {
      "title": "The exact title of a real YouTube video",
      "description": "A brief 1-2 sentence description of what the video covers and why it's useful for ${tripType} travelers",
      "youtubeUrl": "https://www.youtube.com/watch?v=videoID"
    },
    {
      "title": "The exact title of a real YouTube video",
      "description": "A brief 1-2 sentence description of what the video covers and why it's useful for ${tripType} travelers",
      "youtubeUrl": "https://www.youtube.com/watch?v=videoID"
    }
  ]
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are a travel expert who provides recommendations for authentic travel content from real travel YouTubers. You only recommend videos that actually exist with valid YouTube URLs." 
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const responseContent = response.choices[0].message.content;
    if (!responseContent) {
      throw new Error("No response content from OpenAI");
    }

    const result = JSON.parse(responseContent);
    if (result.recommendations && Array.isArray(result.recommendations)) {
      // Use search URLs instead of direct video URLs to ensure they always work
      const processed = result.recommendations.map((rec: VideoRecommendation) => {
        // Extract the video title and create a search URL instead
        return {
          title: rec.title,
          description: rec.description,
          youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(rec.title)}`
        };
      });
      return processed as VideoRecommendation[];
    } else {
      throw new Error("Invalid response format from OpenAI");
    }
  } catch (error) {
    console.error("Error generating video recommendations:", error);
    
    // Return search URLs instead of direct video links to ensure they always work
    return [
      {
        title: `${destination} Travel Guide`,
        description: `Comprehensive travel guide covering the best attractions, activities, and tips for ${tripType} travelers visiting ${destination}.`,
        youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${destination} travel guide ${tripType}`)}`
      },
      {
        title: `Best Places to Visit in ${destination}`,
        description: `A curated list of must-visit locations in ${destination} perfect for ${tripType} travelers looking for authentic experiences.`,
        youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`best places to visit in ${destination}`)}`
      },
      {
        title: `${destination} Food Guide`,
        description: `Delicious local cuisine and dining experiences in ${destination} that every ${tripType} traveler should try.`,
        youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${destination} food guide`)}`
      }
    ];
  }
}

function getNumberOfDays(fromDate: string, toDate: string): number {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const diffTime = Math.abs(to.getTime() - from.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Include both start and end date
}

// Function to regenerate a specific activity based on time period (Morning, Afternoon, Evening)
export async function regenerateActivityForTime(trip: any, dayIndex: number, timeOfDay: string): Promise<any> {
  if (!trip.days[dayIndex]) {
    throw new Error(`Day ${dayIndex + 1} not found in itinerary`);
  }

  const day = trip.days[dayIndex];
  
  // Filter activities by the specified time period
  const existingActivities = day.activities.filter(
    (activity: Activity) => activity.time.toLowerCase() !== timeOfDay.toLowerCase()
  );
  
  // Create a prompt to generate a new activity
  const prompt = `
I need a new ${timeOfDay} activity for day ${dayIndex + 1} (${day.date}) of a trip to ${trip.destination}.

Trip details:
- Destination: ${trip.destination}
- Trip type: ${trip.tripType}
- Budget: $${trip.budget}
- Number of travelers: ${trip.numberOfTravelers || 2}

Current day plan title: "${day.title}"

IMPORTANT REQUIREMENTS:
1. Please create a new ${timeOfDay} activity that fits with the theme of the day and the overall trip.
2. The activity should be DIFFERENT from the previous one but maintain the style and spirit of the trip.
3. Include specific details about the location that are unique to ${trip.destination} - avoid generic descriptions.
4. Include at least one interesting or lesser-known fact about the activity or location.
5. Provide specific location details rather than generic descriptions.

Return only a single JSON object with this structure:
{
  "time": "${timeOfDay}",
  "title": "Activity title",
  "description": "Activity description with specific details and an interesting fact about the place",
  "location": "Specific address or location name in ${trip.destination}",
  "duration": "Approximate duration",
  "cost": "Approximate cost"
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are a travel expert who creates personalized travel activities that fit within an existing itinerary." 
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const responseContent = response.choices[0].message.content;
    if (!responseContent) {
      throw new Error("No response content from OpenAI");
    }

    const newActivity = JSON.parse(responseContent) as Activity;
    
    // Add the new activity to the day's existing activities
    const updatedActivities = [...existingActivities, newActivity];
    
    // Sort activities by time of day (Morning, Afternoon, Evening)
    const timeOrder = {
      "Morning": 0,
      "Afternoon": 1,
      "Evening": 2
    };
    
    updatedActivities.sort((a, b) => {
      const aOrder = timeOrder[a.time as keyof typeof timeOrder] || 0;
      const bOrder = timeOrder[b.time as keyof typeof timeOrder] || 0;
      return aOrder - bOrder;
    });
    
    // Create a new trip with the updated activity
    const updatedTrip = {
      ...trip,
      days: [
        ...trip.days.slice(0, dayIndex),
        {
          ...day,
          activities: updatedActivities
        },
        ...trip.days.slice(dayIndex + 1)
      ]
    };
    
    return updatedTrip;
  } catch (error) {
    console.error("Error regenerating activity with OpenAI:", error);
    throw new Error("Failed to regenerate activity. Please try again later.");
  }
}
