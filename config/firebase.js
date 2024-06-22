const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const admin = require("firebase-admin");
const { initializeApp, getApps, getApp } = require("firebase/app");
const { getAnalytics } = require("firebase/analytics");

const secretManagerClient = new SecretManagerServiceClient();

async function getSecret(secretName) {
  const [version] = await secretManagerClient.accessSecretVersion({
    name: `projects/hay-hair-beauty/secrets/${secretName}/versions/latest`,
  });

  const payload = version.payload.data.toString('utf8');
  return JSON.parse(payload);
}

async function initializeFirebase() {
  if (!getApps().length) {
    try {
      const serviceAccount = await getSecret('my-serviceaccountkey');

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://hay-hair-beauty.firebaseio.com",
      });

      const db = admin.firestore();

      const firebaseConfig = {
        apiKey: "AIzaSyCXr2cwdIn-l2AKnVcz5eAGGhxQc3OGpeM",
        authDomain: "hay-hair-beauty.firebaseapp.com",
        projectId: "hay-hair-beauty",
        storageBucket: "hay-hair-beauty.appspot.com",
        messagingSenderId: "126780028253",
        appId: "1:126780028253:web:d0386b51b13f49443124b4",
        measurementId: "G-5QJHMN455P",
      };

      // Initialize Firebase
      const app = initializeApp(firebaseConfig);

      // Check if the environment supports Firebase Analytics
      if (typeof window !== "undefined" && typeof navigator !== "undefined") {
        const analytics = getAnalytics(app);
      }

      return { admin, db, app };
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      throw error;
    }
  } else {
    // If already initialized, use the existing app
    const app = getApp();
    const db = admin.firestore();
    return { admin, db, app };
  }
}

module.exports = initializeFirebase;
