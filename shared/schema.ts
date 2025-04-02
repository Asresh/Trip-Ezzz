import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  providerId: text("provider_id"),
  uid: text("uid"),
  stripeCustomerId: text("stripe_customer_id"),
  packageType: text("package_type").default("none"), // none, basic, premium, ultimate
  remainingTrips: integer("remaining_trips").default(0), // starts with 0 trips - requires purchase
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  displayName: true,
  photoURL: true,
  providerId: true,
  uid: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export interface User {
  id: number;
  username: string;
  password: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  providerId: string | null; 
  uid: string | null;
  stripeCustomerId: string | null;
  packageType: string;
  remainingTrips: number | null;
  createdAt?: string;
}

// Trip schema (using JSON fields)
export type Activity = {
  time: string;
  title: string;
  description: string;
  location?: string;
  duration?: string;
  cost?: string;
};

export type DayPlan = {
  day: number;
  date: string;
  title: string;
  activities: Activity[];
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

// Define the trips table in PostgreSQL with jsonb columns for complex data
export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  destination: text("destination").notNull(),
  fromDate: text("from_date").notNull(),
  toDate: text("to_date").notNull(),
  budget: integer("budget").notNull(),
  tripType: text("trip_type").notNull(),
  numberOfTravelers: integer("number_of_travelers").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  overview: text("overview").notNull(),
  days: jsonb("days").notNull(),
  transportationTips: jsonb("transportation_tips").notNull(),
  foodRecommendations: jsonb("food_recommendations").notNull(),
  videoRecommendation: jsonb("video_recommendation"),
});

export const insertTripSchema = createInsertSchema(trips).omit({
  id: true
});

export interface Trip {
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
  days: DayPlan[];
  transportationTips: TransportTip[];
  foodRecommendations: FoodRecommendation[];
  videoRecommendations?: VideoRecommendation[];
}

export type InsertTrip = Omit<Trip, "id">;

export const tripSchema = z.object({
  id: z.number(),
  userId: z.number(),
  destination: z.string(),
  fromDate: z.string(),
  toDate: z.string(),
  budget: z.number(),
  tripType: z.string(),
  numberOfTravelers: z.number(),
  createdAt: z.string(),
  overview: z.string(),
  days: z.array(
    z.object({
      day: z.number(),
      date: z.string(),
      title: z.string(),
      activities: z.array(
        z.object({
          time: z.string(),
          title: z.string(),
          description: z.string(),
          location: z.string().optional(),
          duration: z.string().optional(),
          cost: z.string().optional(),
        })
      ),
    })
  ),
  transportationTips: z.array(
    z.object({
      icon: z.string(),
      title: z.string(),
      description: z.string(),
    })
  ),
  foodRecommendations: z.array(
    z.object({
      type: z.string(),
      name: z.string(),
      description: z.string(),
    })
  ),
  videoRecommendations: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      youtubeUrl: z.string(),
    })
  ).optional(),
});
