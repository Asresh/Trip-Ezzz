import { 
  type User, 
  type InsertUser, 
  type Trip, 
  type InsertTrip,
  type DayPlan,
  type Activity,
  type TransportTip,
  type FoodRecommendation
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

// Create a memory store for sessions
const MemoryStore = createMemoryStore(session);

// Define storage interface
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByProviderId(providerId: string, uid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStripeCustomerId(userId: number, customerId: string): Promise<User>;
  updateUserGoogle(
    userId: number, 
    providerId: string, 
    uid: string, 
    photoURL?: string | null,
    displayName?: string | null
  ): Promise<User>;
  updateUserPackage(userId: number, packageType: string, tripsToAdd: number): Promise<User>;
  decrementRemainingTrips(userId: number): Promise<User>;
  
  createTrip(trip: InsertTrip): Promise<Trip>;
  updateTrip(trip: Trip): Promise<Trip>;
  getTripById(id: number): Promise<Trip | undefined>;
  getTripsByUserId(userId: number): Promise<Trip[]>;
  countTripsByUserId(userId: number): Promise<number>;
  
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: User[] = [];
  private trips: Trip[] = [];
  private lastUserId = 0;
  private lastTripId = 0;
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username.toLowerCase() === username.toLowerCase());
  }
  
  async getUserByProviderId(providerId: string, uid: string): Promise<User | undefined> {
    return this.users.find(user => user.providerId === providerId && user.uid === uid);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    this.lastUserId++;
    const newUser: User = {
      id: this.lastUserId,
      ...insertUser,
      createdAt: new Date().toISOString(),
      email: insertUser.email || null,
      displayName: insertUser.displayName || null,
      photoURL: insertUser.photoURL || null,
      providerId: insertUser.providerId || null,
      uid: insertUser.uid || null,
      stripeCustomerId: null,
      remainingTrips: 3, // Give 3 free itineraries to new users
      packageType: "free", // Set to "free" instead of "none"
    };
    
    this.users.push(newUser);
    console.log(`Created new user with ID ${newUser.id} and 3 free itineraries`);
    return newUser;
  }

  async updateUserStripeCustomerId(userId: number, customerId: string): Promise<User> {
    const userIndex = this.users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const updatedUser = {
      ...this.users[userIndex],
      stripeCustomerId: customerId,
    };
    
    this.users[userIndex] = updatedUser;
    return updatedUser;
  }
  
  async updateUserGoogle(
    userId: number, 
    providerId: string, 
    uid: string, 
    photoURL?: string | null,
    displayName?: string | null
  ): Promise<User> {
    const userIndex = this.users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const currentUser = this.users[userIndex];
    const updatedUser = {
      ...currentUser,
      providerId,
      uid,
      photoURL: photoURL || currentUser.photoURL,
      displayName: displayName || currentUser.displayName
    };
    
    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  async updateUserPackage(userId: number, packageType: string, tripsToAdd: number): Promise<User> {
    const userIndex = this.users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const currentUser = this.users[userIndex];
    // If upgrading to "ultimate", set remainingTrips to -1 (unlimited)
    const remainingTrips = tripsToAdd === -1 
      ? -1 
      : (currentUser.remainingTrips || 0) + tripsToAdd;
    
    const updatedUser = {
      ...currentUser,
      packageType,
      remainingTrips
    };
    
    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  async decrementRemainingTrips(userId: number): Promise<User> {
    const userIndex = this.users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const currentUser = this.users[userIndex];
    
    // Don't decrement if user has unlimited trips (remainingTrips === -1)
    if (currentUser.remainingTrips === -1) {
      return currentUser;
    }
    
    // Handle null remainingTrips by treating it as 0
    let currentTrips = 0;
    if (currentUser.remainingTrips !== null && currentUser.remainingTrips !== undefined) {
      currentTrips = currentUser.remainingTrips;
    }
    
    // Ensure we don't go below 0
    const remainingTrips = Math.max(0, currentTrips - 1);
    
    console.log(`Decrementing trips for user ${userId} from ${currentTrips} to ${remainingTrips}`);
    
    const updatedUser = {
      ...currentUser,
      remainingTrips
    };
    
    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  // Trip methods
  async createTrip(insertTrip: InsertTrip): Promise<Trip> {
    this.lastTripId++;
    const newTrip: Trip = {
      id: this.lastTripId,
      ...insertTrip,
      createdAt: new Date().toISOString(),
    };
    
    this.trips.push(newTrip);
    return newTrip;
  }
  
  async updateTrip(trip: Trip): Promise<Trip> {
    const tripIndex = this.trips.findIndex(t => t.id === trip.id);
    if (tripIndex === -1) {
      throw new Error(`Trip with ID ${trip.id} not found`);
    }
    
    this.trips[tripIndex] = trip;
    return trip;
  }

  async getTripById(id: number): Promise<Trip | undefined> {
    return this.trips.find(trip => trip.id === id);
  }

  async getTripsByUserId(userId: number): Promise<Trip[]> {
    return this.trips
      .filter(trip => trip.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async countTripsByUserId(userId: number): Promise<number> {
    return this.trips.filter(trip => trip.userId === userId).length;
  }
}

export const storage = new MemStorage();
