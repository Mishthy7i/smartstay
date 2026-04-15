import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { auth, db } from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const skipAuthUpdateRef = useRef(false);

  // Google Auth Provider
  const googleProvider = new GoogleAuthProvider();

  // Fetch or create user data in Firestore
  const fetchUserData = async (uid, email, name, selectedRole = null) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // User exists, fetch data
        const userData = userDoc.data();
        return {
          role: userData.role || 'student',
          is_onboarded: userData.is_onboarded || false
        };
      } else {
        // New user, create document with selected role or default
        const role = selectedRole || 'student';
        await setDoc(userDocRef, {
          user_id: uid,
          email: email,
          name: name || email?.split('@')[0] || 'User',
          role: role,
          is_onboarded: false,
          created_at: serverTimestamp()
        });
        return {
          role: role,
          is_onboarded: false
        };
      }
    } catch (error) {
      console.error('Error fetching/creating user data:', error);
      return {
        role: 'student',
        is_onboarded: false
      };
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // If user state was just set by loginWithGoogle, skip this update
        if (skipAuthUpdateRef.current) {
          skipAuthUpdateRef.current = false;
          if (isMounted) {
            setLoading(false);
          }
          return;
        }
        
        // User is signed in - fetch user data from Firestore
        const userData = await fetchUserData(
          firebaseUser.uid,
          firebaseUser.email,
          firebaseUser.displayName
        );

        // Only update if component is still mounted
        if (isMounted) {
          setUser({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            photo: firebaseUser.photoURL,
            role: userData.role,
            is_onboarded: userData.is_onboarded
          });
        }
      } else {
        // User is signed out
        if (isMounted) {
          setUser(null);
        }
      }
      if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const loginWithGoogle = async (selectedRole = null, isSignUp = false) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Always check and update Firestore document FIRST
      // This must complete before onAuthStateChanged processes the user
      const userDocRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      let finalRole = selectedRole || 'student';
      let isOnboarded = false;
      
      if (!userDoc.exists()) {
        // New user - only create document if this is a sign-up
        if (!isSignUp) {
          // This shouldn't happen, but if it does, sign out and throw error
          await signOut(auth);
          throw new Error('Account not found. Please sign up first.');
        }
        
        // New user sign-up - create document with selected role or default
        await setDoc(userDocRef, {
          user_id: result.user.uid,
          email: result.user.email,
          name: result.user.displayName || result.user.email?.split('@')[0] || 'User',
          role: finalRole,
          is_onboarded: false,
          created_at: serverTimestamp()
        });
        console.log('Created new user document with role:', finalRole);
      } else {
        // Existing user - NEVER change their role
        const existingData = userDoc.data();
        finalRole = existingData.role || 'student';
        isOnboarded = existingData.is_onboarded || false;
        
        // If this is sign-up but user already exists, sign them out and show error
        if (isSignUp) {
          await signOut(auth);
          throw new Error('An account with this email already exists. Please sign in instead.');
        }
        
        // For sign-in: role is fetched from existing data, selectedRole should be null
        // If somehow selectedRole was passed during sign-in, ignore it (role comes from Firestore)
        // This prevents role switching during sign-in
      }
      
      // Signal to skip the next onAuthStateChanged update since we're setting it manually
      skipAuthUpdateRef.current = true;
      
      // Immediately update local user state with correct role
      // This ensures the role is set correctly before onAuthStateChanged processes
      setUser({
        uid: result.user.uid,
        name: result.user.displayName,
        email: result.user.email,
        photo: result.user.photoURL,
        role: finalRole,
        is_onboarded: isOnboarded
      });
      
      console.log('User state set with role:', finalRole);
      
      return result.user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email, password, displayName, selectedRole = 'student') => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Check if user document already exists (shouldn't happen with new account, but safety check)
      const userDocRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        // User already exists - this shouldn't happen, but if it does, sign out and throw error
        await signOut(auth);
        throw new Error('An account with this email already exists. Please sign in instead.');
      }
      
      // Update display name if provided
      if (displayName) {
        await updateProfile(result.user, {
          displayName: displayName
        });
      }
      
      // Create user document in Firestore with selected role
      await setDoc(userDocRef, {
        user_id: result.user.uid,
        email: email,
        name: displayName || email?.split('@')[0] || 'User',
        role: selectedRole,
        is_onboarded: false,
        created_at: serverTimestamp()
      });
      
      // Set user state immediately
      skipAuthUpdateRef.current = true;
      setUser({
        uid: result.user.uid,
        name: displayName || email?.split('@')[0] || 'User',
        email: email,
        photo: null,
        role: selectedRole,
        is_onboarded: false
      });
      
      return result.user;
    } catch (error) {
      console.error('Error signing up with email:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const completeOnboarding = async (onboardingData = {}) => {
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      const existingData = userDoc.exists() ? userDoc.data() : {};

      // Update user document with onboarding data and mark as onboarded
      await setDoc(userDocRef, {
        ...existingData,
        ...onboardingData,
        is_onboarded: true,
        onboarded_at: serverTimestamp()
      }, { merge: true });

      // Update local user state
      setUser(prev => ({
        ...prev,
        is_onboarded: true
      }));
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      loginWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      logout,
      completeOnboarding
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

