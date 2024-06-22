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

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://hay-hair-healthy-project.firebaseio.com",
      });

      const db = admin.firestore();

      const firebaseConfig = {
        apiKey: "AIzaSyDXNbpO0CWZrBFp6RBYeoXWFSB_zAhQydA",
        authDomain: "hay-hair-healthy-project.firebaseapp.com",
        projectId: "hay-hair-healthy-project",
        storageBucket: "hay-hair-healthy-project.appspot.com",
        messagingSenderId: "626086545012",
        appId: "1:626086545012:web:b83f92eaf7bc770f853321",
        measurementId: "G-N17CHP1DSW"
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
