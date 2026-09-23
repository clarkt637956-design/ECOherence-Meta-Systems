import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDocFromServer,
  addDoc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { SecurityAlert, TelemetryPulse, IncidentReportRecord } from '../types.ts';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore using the configured database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Google Auth Provider configured with Workspace scopes
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleAuthProvider.addScope('https://www.googleapis.com/auth/documents');

// In-memory token cache as mandated by Workspace skill guidelines
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Connection test as mandated by Firebase skill guidelines
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore client appears offline or not provisioned.');
      return false;
    }
    // Any other response indicates server was contacted
    return true;
  }
}

// Authentication state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google (Popup flow)
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleAuthProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      console.warn('No access token in credential, proceeding with user authentication');
    }

    cachedAccessToken = credential?.accessToken || null;
    return {
      user: result.user,
      accessToken: cachedAccessToken || '',
    };
  } catch (error: any) {
    console.error('Google Sign In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// Firestore Real-Time Helpers
export async function persistPulseToFirestore(pulse: TelemetryPulse) {
  try {
    await addDoc(collection(db, 'telemetry'), {
      ...pulse,
      createdAtServer: new Date().toISOString(),
    });
  } catch (err) {
    // Non-blocking in dev or if firestore is provisioning
    console.debug('Firestore pulse write notice:', err);
  }
}

export async function persistAlertToFirestore(alert: SecurityAlert) {
  try {
    await setDoc(doc(db, 'alerts', alert.id), {
      ...alert,
      updatedAtServer: new Date().toISOString(),
    });
  } catch (err) {
    console.debug('Firestore alert write notice:', err);
  }
}

export async function persistReportToFirestore(report: IncidentReportRecord) {
  try {
    await setDoc(doc(db, 'reports', report.id), {
      ...report,
      savedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.debug('Firestore report write notice:', err);
  }
}
