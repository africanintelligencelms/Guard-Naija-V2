import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { UserRole, UserProfile } from "../types";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  role: UserRole | null;
  login: (
    email: string,
    password: string,
    expectedRole?: UserRole
  ) => Promise<void>;
  signup: (
    email: string,
    password: string,
    role: UserRole,
    additionalData?: Partial<UserProfile>
  ) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
          } else {
            console.log("No profile found for user, clearing profile state");
            setUserProfile(null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setUserProfile(null);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (
    email: string,
    password: string,
    role: UserRole,
    additionalData?: Partial<UserProfile>
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const newUser = userCredential.user;

      // Create user profile in Firestore
      const profile: UserProfile = {
        uid: newUser.uid,
        email: newUser.email!,
        role,
        createdAt: Date.now(),
        lastLogin: Date.now(),
        isActive: true,
        ...additionalData,
      };

      await setDoc(doc(db, "users", newUser.uid), profile);
      setUserProfile(profile);
    } catch (error: any) {
      console.error("Signup error:", error);
      throw new Error(error.message || "Failed to create account");
    }
  };

  const login = async (
    email: string,
    password: string,
    expectedRole?: UserRole
  ) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const loggedInUser = userCredential.user;

      // Fetch and update user profile
      const userDoc = await getDoc(doc(db, "users", loggedInUser.uid));
      if (userDoc.exists()) {
        const profile = userDoc.data() as UserProfile;

        // Validate role if expectedRole is provided
        if (expectedRole && profile.role !== expectedRole) {
          await signOut(auth);
          const roleNames = {
            citizen: "Citizen",
            agency: "Agency",
            admin: "Admin",
          };
          throw new Error(
            `This account is registered as ${
              roleNames[profile.role]
            }. Please use the ${roleNames[profile.role]} login portal.`
          );
        }

        // Update last login
        await setDoc(doc(db, "users", loggedInUser.uid), {
          ...profile,
          lastLogin: Date.now(),
        });

        setUserProfile(profile);
      } else {
        // Sign out if profile doesn't exist
        await signOut(auth);
        throw new Error(
          "User profile not found in database. Please contact support."
        );
      }
    } catch (error: any) {
      console.error("Login error:", error);

      // Provide user-friendly error messages
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        throw new Error("Incorrect email or password. Please try again.");
      } else if (error.code === "auth/invalid-email") {
        throw new Error("Invalid email address format.");
      } else if (error.code === "auth/too-many-requests") {
        throw new Error(
          "Too many failed login attempts. Please try again later."
        );
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("Failed to login. Please try again.");
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        role: userProfile?.role || null,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

// Export UserRole for backward compatibility
export type { UserRole };
