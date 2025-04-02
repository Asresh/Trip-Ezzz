import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithRedirect, 
  signInWithPopup,
  getRedirectResult, 
  Auth 
} from "firebase/auth";
import { apiRequest, queryClient } from "./queryClient";

// Function to check if the Firebase API key is available
function validateFirebaseConfig(): boolean {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;
  
  // Enhanced logging for better debugging
  if (!apiKey) console.warn("Missing Firebase API key");
  if (!projectId) console.warn("Missing Firebase Project ID");
  if (!appId) console.warn("Missing Firebase App ID");
  
  return Boolean(apiKey && projectId && appId);
}

// Firebase configuration - updated with all necessary fields
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: "000000000000", // This is a placeholder, not used in our app
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase (only once)
let app: FirebaseApp | null = null;
let auth: Auth | null = null;

// Check if configuration is valid before initializing
const isConfigValid = validateFirebaseConfig();

if (isConfigValid) {
  try {
    // Check if Firebase app is already initialized
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      console.log("Firebase app initialized successfully");
    } else {
      app = getApps()[0];
      console.log("Using existing Firebase app instance");
    }
    
    // Get auth instance
    auth = getAuth(app);
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    app = null;
    auth = null;
  }
} else {
  console.error(
    "Firebase configuration is invalid. Please ensure you have set the following environment variables:\n" +
    "- VITE_FIREBASE_API_KEY\n" +
    "- VITE_FIREBASE_PROJECT_ID\n" +
    "- VITE_FIREBASE_APP_ID\n\n" +
    "You also need to enable Google Authentication in the Firebase console."
  );
}

// Export the initialized app and auth
export { app, auth };

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Configure Google Auth Provider scopes (requested permissions)
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Define the return type for Google redirect result
export interface GoogleRedirectResult {
  success: boolean;
  redirectToDashboard: boolean;
}

/**
 * Handles the Google sign-in redirect result
 * This is called when a user is redirected back from the Google sign-in page
 * @returns Object with success status and redirect flag
 */
export const handleGoogleRedirectResult = async (): Promise<GoogleRedirectResult> => {
  // Return failure immediately if Firebase is not properly initialized
  if (!auth) {
    console.error("Firebase auth is not initialized, can't handle redirect result");
    return { success: false, redirectToDashboard: false };
  }
  
  try {
    const result = await getRedirectResult(auth);
    
    if (!result) {
      console.log("No redirect result found");
      return { success: false, redirectToDashboard: false }; // No redirect result
    }
    
    console.log("Successfully received Google sign-in redirect result");
    
    // Get Google user info
    const user = result.user;
    const userData = {
      username: user.email?.split('@')[0] || user.displayName || 'user',
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      providerId: 'google.com', // Must match Firebase provider ID
      uid: user.uid
    };
    
    console.log("Attempting to authenticate with backend with data:", {
      username: userData.username,
      email: userData.email,
      hasDisplayName: !!userData.displayName,
      hasPhoto: !!userData.photoURL,
      providerId: userData.providerId
    });
    
    try {
      // Register with our backend with more robust error handling
      const response = await apiRequest("POST", "/api/google-auth", userData);
      
      console.log("Backend response status:", response.status);
      
      // Parse the user response
      let userResponse;
      try {
        userResponse = await response.json();
        console.log("Successfully parsed user response from backend");
      } catch (jsonError) {
        console.error("Failed to parse response as JSON:", jsonError);
        throw new Error("The server returned an invalid response format. Expected JSON but received something else.");
      }
      
      console.log("Successfully authenticated with Google");
      
      // Update the React Query cache with the authenticated user
      if (userResponse && userResponse.id) {
        // Update the auth state in React Query
        queryClient.setQueryData(["/api/user"], userResponse);
        console.log("Updated user data in React Query cache");
        return { 
          success: true, 
          redirectToDashboard: true
        };
      } else {
        console.error("Invalid user response from backend:", userResponse);
        throw new Error("Received an incomplete user object from the server.");
      }
    } catch (backendError) {
      console.error("Backend authentication error:", backendError);
      if (backendError instanceof Error) {
        throw new Error(`Google authentication failed: ${backendError.message}`);
      } else {
        throw new Error("Google authentication failed due to an unexpected error.");
      }
    }
  } catch (error) {
    console.error("Error handling Google sign-in redirect:", error);
    return { success: false, redirectToDashboard: false };
  }
};

/**
 * Initiates Google sign-in via popup
 * This will show a popup window for Google sign-in
 */
export const signInWithGoogle = async (): Promise<void> => {
  // Throw early if Firebase is not properly initialized
  if (!auth) {
    console.error("Firebase auth is not initialized");
    throw new Error("Firebase authentication is not properly configured. Please check your environment variables and Firebase console settings.");
  }
  
  try {
    console.log("Initiating Google sign-in popup");
    const result = await signInWithPopup(auth, googleProvider);
    
    // Process the result directly
    if (result && result.user) {
      console.log("Successfully signed in with Google popup");
      
      // Get Google user info
      const user = result.user;
      const userData = {
        username: user.email?.split('@')[0] || user.displayName || 'user',
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        providerId: 'google.com',
        uid: user.uid
      };
      
      console.log("Sending Google auth data to backend:", {
        username: userData.username,
        email: userData.email,
        hasDisplayName: !!userData.displayName,
        hasPhoto: !!userData.photoURL,
        providerId: userData.providerId
      });
      
      try {
        // Register with our backend with more robust error handling
        const response = await apiRequest("POST", "/api/google-auth", userData);
        
        console.log("Backend response status:", response.status);
        
        // Parse the user response
        let userResponse;
        try {
          userResponse = await response.json();
          console.log("Successfully parsed user response from backend");
        } catch (jsonError) {
          console.error("Failed to parse response as JSON:", jsonError);
          throw new Error("The server returned an invalid response format. Expected JSON but received something else.");
        }
        
        // Update the React Query cache with the authenticated user
        if (userResponse && userResponse.id) {
          queryClient.setQueryData(["/api/user"], userResponse);
          console.log("Updated user data in React Query cache");
          
          // Redirect to dashboard (use the correct route name)
          window.location.href = '/dashboard';
        } else {
          console.error("Invalid user response from backend:", userResponse);
          throw new Error("Received an incomplete user object from the server.");
        }
      } catch (backendError) {
        console.error("Backend authentication error:", backendError);
        // Add more context to the error
        if (backendError instanceof Error) {
          throw new Error(`Google authentication failed: ${backendError.message}`);
        } else {
          throw new Error("Google authentication failed due to an unexpected error.");
        }
      }
    } else {
      console.error("Invalid Google sign-in result:", result);
      throw new Error("Failed to retrieve user information from Google.");
    }
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

/**
 * Signs out the user from both Firebase and our backend
 */
export const signOut = async (): Promise<void> => {
  if (!auth) {
    console.warn("Firebase auth is not initialized, only logging out from backend");
    try {
      await apiRequest("POST", "/api/logout");
    } catch (error) {
      console.error("Error signing out from backend:", error);
    }
    return;
  }
  
  try {
    console.log("Signing out from Firebase");
    await auth.signOut();
    
    console.log("Signing out from backend");
    await apiRequest("POST", "/api/logout");
    
    console.log("Successfully signed out");
  } catch (error) {
    console.error("Error signing out:", error);
  }
};