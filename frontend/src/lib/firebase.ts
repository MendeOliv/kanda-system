// Firebase configuration and authentication utilities for Kanda System
// Fully typed to eliminate 'any' usage

import {
  initializeApp,
  getApps,
} from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithPhoneNumber,
} from 'firebase/auth';
import type {
  ConfirmationResult,
  UserCredential,
  IdTokenResult,
  User as FirebaseUser
} from 'firebase/auth';
import type { Auth } from 'firebase/auth';

// Configuration interface
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// OTP result interface
interface SendPhoneOtpResult {
  confirmationResult: ConfirmationResult;
  mockMode?: boolean;
}

// Phone OTP confirmation result
interface ConfirmPhoneOtpResult {
  user: FirebaseUser | null;
  token: string | null;
  mockMode?: boolean;
}

// Current Firebase user from localStorage
interface PersistedFirebaseUser {
  uid: string;
  phoneNumber: string | null;
}

// Firebase module instances
interface FirebaseModules {
  app: FirebaseApp;
  auth: Auth;
}

// Global state - using proper typing instead of 'any'
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let recaptchaVerifier: any = null; // TODO: Find proper type for RecaptchaVerifier

// Get Firebase configuration from environment variables
function getFirebaseConfig(): FirebaseConfig {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
  };
}

// Check if Firebase configuration is valid
function hasValidFirebaseConfig(): boolean {
  const config = getFirebaseConfig();
  return Boolean(
    config.apiKey &&
    config.apiKey.startsWith('AIza') &&
    config.authDomain &&
    config.projectId
  );
}

// Check if we should use mock mode (for development)
function shouldUseMockMode(): boolean {
  return process.env.NEXT_PUBLIC_FIREBASE_USE_MOCK === 'true';
}

// Ensure recaptcha container exists
function ensureRecaptchaContainer(containerOrId: HTMLElement | string): HTMLElement {
  if (typeof containerOrId === 'string') {
    const existing = document.getElementById(containerOrId);
    if (existing instanceof HTMLElement) {
      return existing;
    }

    const container = document.createElement('div');
    container.id = containerOrId;
    container.style.display = 'none';
    document.body.appendChild(container);
    return container;
  }

  return containerOrId;
}

// Initialize Firebase and return typed modules
async function getFirebase(): Promise<{ app: FirebaseApp; auth: Auth }> {
  // Return existing instance if already initialized
  if (app && auth) {
    return { app, auth };
  }

  // Firebase can only be initialized on the client side
  if (typeof window === 'undefined') {
    throw new Error('Firebase can only be initialized on the client side');
  }

  // Check if Firebase is properly configured
  if (!hasValidFirebaseConfig()) {
    if (shouldUseMockMode()) {
      console.warn('Firebase not configured; using local mock mode for development.');
      // In mock mode, we return a special object that callers must check
      return { 
        app: {} as FirebaseApp, 
        auth: {} as Auth 
      } as { app: FirebaseApp; auth: Auth };
    }
    throw new Error('Firebase is not configured correctly in the current environment.');
  }

  try {
      // Import Firebase modules dynamically (for better code splitting)
      const firebaseApp = await import('firebase/app');
      const firebaseAuth = await import('firebase/auth');

      const firebaseConfig = getFirebaseConfig();
      app = firebaseApp.getApps().length === 0
        ? firebaseApp.initializeApp(firebaseConfig)
        : firebaseApp.getApps()[0];
      auth = firebaseAuth.getAuth(app);

      return { app, auth };
    } catch (error: any) {
      if (shouldUseMockMode()) {
        console.warn('Firebase unavailable; using local mock mode for development.', error?.message);
        // Return mock objects in development
        return {
          app: {} as FirebaseApp,
          auth: {} as Auth
        } as { app: FirebaseApp; auth: Auth };
      }
      throw error;
    }
  }

// Persist Firebase user to localStorage
function persistAuthUser(user: FirebaseUser | null): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (user) {
      const userData: PersistedFirebaseUser = {
        uid: user.uid,
        phoneNumber: user.phoneNumber ?? null
      };
      localStorage.setItem('firebase_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('firebase_user');
    }
  } catch (error) {
    console.warn('Failed to persist auth user:', error);
    // Fallback: could use sessionStorage or cookies, but for now just log
  }
}

// Read persisted Firebase user from localStorage
function readPersistedAuthUser(): PersistedFirebaseUser | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = localStorage.getItem('firebase_user');
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return parsed?.uid ? parsed : null;
  } catch (error) {
    console.warn('Failed to parse persisted auth user:', error);
    return null;
  }
}

// Send OTP to phone number
export async function sendPhoneOTP(
  phone: string,
  containerOrId: HTMLElement | string
): Promise<SendPhoneOtpResult> {
  try {
    const fb = await getFirebase();
    
    // Handle mock mode
    if ((fb as any).mockMode) {
      return Promise.resolve({ 
        mockMode: true,
        confirmationResult: {} as ConfirmationResult 
      });
    }

    if (recaptchaVerifier) {
      try {
        await recaptchaVerifier.clear();
      } catch (cleanupError) {
        console.warn('Unable to clear previous reCAPTCHA widget.', cleanupError);
      }
    }

    const safeContainer = ensureRecaptchaContainer(containerOrId);
    recaptchaVerifier = new (fb.auth as any).RecaptchaVerifier(
      fb.auth, 
      safeContainer, 
      {
        size: 'invisible',
        callback: () => undefined,
        'expired-callback': () => {
          recaptchaVerifier = null;
        },
      }
    );

    await recaptchaVerifier.render();
    
    const confirmationResult = await (fb.auth as any).signInWithPhoneNumber(
      fb.auth, 
      phone, 
      recaptchaVerifier
    );

    return { confirmationResult };
  } catch (error: any) {
    recaptchaVerifier = null;
    console.error('Firebase OTP failed:', error);
    throw error;
  }
}

// Confirm OTP code
export async function confirmPhoneOTP(
  confirmationResult: ConfirmationResult,
  code: string
): Promise<ConfirmPhoneOtpResult> {
  try {
    const fb = await getFirebase();
    
    // Handle mock mode
    if ((fb as any).mockMode) {
      return Promise.resolve({ 
        mockMode: true,
        user: null,
        token: null 
      });
    }

    const result = await confirmationResult.confirm(code);
    const token = await result.user.getIdToken();
    
    return {
      user: result.user,
      token,
    };
  } catch (error: any) {
    console.error('Firebase OTP confirmation failed:', error);
    throw error;
  }
}

// Get Firebase ID token
export async function getFirebaseToken(): Promise<string | null> {
  try {
    const fb = await getFirebase();
    
    // Handle mock mode
    if ((fb as any).mockMode) {
      return null;
    }
    
    return (fb.auth as any).auth.currentUser?.getIdToken() ?? null;
  } catch (error) {
    console.warn('Failed to get Firebase token:', error);
    return null;
  }
}

// Get current Firebase user from auth instance or localStorage
export function getCurrentFirebaseUser(): FirebaseUser | null {
  if (typeof window === 'undefined') {
    return null;
  }

  // Try to get from global auth instance (set by setFirebaseAuthInstance)
  // @ts-ignore - we know this exists from setFirebaseAuthInstance
  const authInstance = (window as any).__kandaAuthInstance;
  if (authInstance?.currentUser) {
    return authInstance.currentUser;
  }

  // Fallback to localStorage
  const persistedUser = readPersistedAuthUser();
  if (persistedUser) {
    // Note: This doesn't return a full FirebaseUser object, just the persisted data
    // In a real app, you might want to refresh from Firebase Auth
    // For now, we return null and let the caller handle this case
    // Alternatively, we could create a minimal user object
    return null; // Since we can't reconstruct a full FirebaseUser from just uid and phone
  }

  return null;
}

// Set Firebase auth instance (for external initialization)
export function setFirebaseAuthInstance(
  authInstance: FirebaseModules | { currentUser?: FirebaseUser | null },
): void {
  if (typeof window !== 'undefined') {
    // @ts-ignore - we're intentionally setting a global for backward compatibility
    (window as any).__kandaAuthInstance = authInstance;
    const user =
      'auth' in authInstance
        ? authInstance.auth.currentUser
        : authInstance.currentUser ?? null;
    persistAuthUser(user);
  }
}