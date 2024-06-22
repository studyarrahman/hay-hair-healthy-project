const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const admin = require("firebase-admin");
const { initializeApp, getApps, getApp } = require("firebase/app");
const { getAnalytics } = require("firebase/analytics");

const secretManagerClient = new SecretManagerServiceClient();

async function getSecret(secretName) {
  const [version] = await secretManagerClient.accessSecretVersion({
    name: `projects/${process.env.GCLOUD_PROJECT_ID}/secrets/${secretName}/versions/latest`,
  });

  const payload = version.payload.data.toString('utf8');
  return JSON.parse(payload);
}

async function initializeFirebase() {
  if (!getApps().length) {
    try {
      const serviceAccount = await getSecret('my-serviceaccountkey');
      const firebaseConfig = await getSecret('my-firebase-config');

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: firebaseConfig.databaseURL,
      });

      const db = admin.firestore();

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
