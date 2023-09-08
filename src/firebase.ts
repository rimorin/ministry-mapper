// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { initializeAuth, browserLocalPersistence } from "firebase/auth";
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider
} from "firebase/app-check";
import { getFunctions } from "firebase/functions";
import { DEFAULT_FB_CLOUD_FUNCTIONS_REGION } from "./utils/constants";

declare global {
  // eslint-disable-next-line no-var
  var FIREBASE_APPCHECK_DEBUG_TOKEN: boolean | string | undefined;
}
const {
  VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_DB_URL,
  VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_BUCKET,
  VITE_FIREBASE_SENDER_ID,
  VITE_FIREBASE_APP_ID,
  VITE_FIREBASE_APPCHECK_DEBUG_TOKEN,
  VITE_FIREBASE_RECAPTCHA_ENTERPRISE_SITE_KEY,
  VITE_FIREBASE_FUNCTIONS_REGION
} = import.meta.env;
global.FIREBASE_APPCHECK_DEBUG_TOKEN =
  VITE_FIREBASE_APPCHECK_DEBUG_TOKEN || false;

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: VITE_FIREBASE_API_KEY,
  authDomain: VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: VITE_FIREBASE_DB_URL,
  projectId: VITE_FIREBASE_PROJECT_ID,
  storageBucket: VITE_FIREBASE_BUCKET,
  messagingSenderId: VITE_FIREBASE_SENDER_ID,
  appId: VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = initializeAuth(app, {
  persistence: browserLocalPersistence
  // No popupRedirectResolver defined
});
const functions = getFunctions(
  app,
  VITE_FIREBASE_FUNCTIONS_REGION || DEFAULT_FB_CLOUD_FUNCTIONS_REGION
);

if (VITE_FIREBASE_RECAPTCHA_ENTERPRISE_SITE_KEY !== undefined) {
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(
      VITE_FIREBASE_RECAPTCHA_ENTERPRISE_SITE_KEY
    ),
    isTokenAutoRefreshEnabled: true
  });
}

export { database, auth, functions };
