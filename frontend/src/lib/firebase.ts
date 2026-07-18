let app: any = null;
let auth: any = null;

function getFirebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

function hasValidFirebaseConfig() {
  const config = getFirebaseConfig();
  return Boolean(
    config.apiKey &&
      config.apiKey.startsWith("AIza") &&
      config.authDomain &&
      config.projectId
  );
}

function isDevelopmentMode() {
  return process.env.NODE_ENV !== "production";
}

async function getFirebase(): Promise<any> {
  if (app) return { app, auth };

  if (typeof window === "undefined") {
    throw new Error("Firebase can only be initialized on the client side");
  }

  if (!hasValidFirebaseConfig()) {
    if (isDevelopmentMode()) {
      console.warn("Firebase not configured; using local mock mode for development.");
      return { mockMode: true };
    }
    throw new Error("Firebase não está configurado corretamente no ambiente atual.");
  }

  try {
    const mod = await import("firebase/app");
    const authMod = await import("firebase/auth");

    const firebaseConfig = getFirebaseConfig();

    app = mod.getApps().length === 0 ? mod.initializeApp(firebaseConfig) : mod.getApps()[0];
    auth = authMod.getAuth(app);
    return {
      app,
      auth,
      signInWithPhoneNumber: authMod.signInWithPhoneNumber,
      RecaptchaVerifier: authMod.RecaptchaVerifier,
    };
  } catch (error: any) {
    if (isDevelopmentMode()) {
      console.warn("Firebase unavailable; using local mock mode for development.", error?.message);
      return { mockMode: true };
    }
    throw error;
  }
}

export async function sendPhoneOTP(
  phone: string,
  containerOrId: HTMLElement | string
): Promise<any> {
  try {
    const fb = await getFirebase();
    if ((fb as any).mockMode) {
      return Promise.resolve({ mockMode: true, phone });
    }

    const verifier = new (fb as any).RecaptchaVerifier((fb as any).auth, containerOrId, {
      size: "invisible",
    });
    return (fb as any).signInWithPhoneNumber((fb as any).auth, phone, verifier);
  } catch (error: any) {
    if (isDevelopmentMode()) {
      console.warn("Firebase OTP failed; using mock mode for development.", error?.message);
      return Promise.resolve({ mockMode: true, phone });
    }
    throw error;
  }
}

export async function getFirebaseToken(): Promise<string | null> {
  const fb = await getFirebase();
  if ((fb as any).mockMode) {
    return null;
  }
  return (fb as any).auth.currentUser?.getIdToken() || null;
}
