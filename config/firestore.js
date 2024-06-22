const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const { Firestore } = require('@google-cloud/firestore');
const dotenv = require('dotenv');

dotenv.config();

const secretManagerClient = new SecretManagerServiceClient();

async function getSecret(secretName) {
  const [version] = await secretManagerClient.accessSecretVersion({
    name: `projects/${process.env.GCLOUD_PROJECT_ID}/secrets/${secretName}/versions/latest`,
  });

  const payload = version.payload.data.toString('utf8');
  return JSON.parse(payload);
}

async function initializeFirestore() {
  try {
    const serviceAccount = await getSecret('my-serviceaccountkey');

    const firestore = new Firestore({
      projectId: process.env.GCLOUD_PROJECT_ID,
      credentials: serviceAccount,
    });

    return firestore;
  } catch (error) {
    console.error('Failed to initialize Firestore:', error);
    throw error;
  }
}

module.exports = initializeFirestore;
