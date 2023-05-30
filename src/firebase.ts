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
  REACT_APP_FIREBASE_API_KEY,
  REACT_APP_FIREBASE_AUTH_DOMAIN,
  REACT_APP_FIREBASE_DB_URL,
  REACT_APP_FIREBASE_PROJECT_ID,
  REACT_APP_FIREBASE_BUCKET,
  REACT_APP_FIREBASE_SENDER_ID,
  REACT_APP_FIREBASE_APP_ID,
  REACT_APP_FIREBASE_APPCHECK_DEBUG_TOKEN,
  REACT_APP_FIREBASE_RECAPTCHA_ENTERPRISE_SITE_KEY,
  REACT_APP_FIREBASE_FUNCTIONS_REGION
} = process.env;
global.FIREBASE_APPCHECK_DEBUG_TOKEN =
  REACT_APP_FIREBASE_APPCHECK_DEBUG_TOKEN || false;

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: REACT_APP_FIREBASE_API_KEY,
  authDomain: REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: REACT_APP_FIREBASE_DB_URL,
  projectId: REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: REACT_APP_FIREBASE_BUCKET,
  messagingSenderId: REACT_APP_FIREBASE_SENDER_ID,
  appId: REACT_APP_FIREBASE_APP_ID
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
  REACT_APP_FIREBASE_FUNCTIONS_REGION || DEFAULT_FB_CLOUD_FUNCTIONS_REGION
);

if (REACT_APP_FIREBASE_RECAPTCHA_ENTERPRISE_SITE_KEY !== undefined) {
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(
      REACT_APP_FIREBASE_RECAPTCHA_ENTERPRISE_SITE_KEY
    ),
    isTokenAutoRefreshEnabled: true
  });
}

export { database, auth, functions };
