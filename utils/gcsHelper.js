const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const { Storage } = require('@google-cloud/storage');
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

async function initializeStorage() {
  try {
    const serviceAccount = await getSecret('my-serviceaccountkey');

    const storage = new Storage({
      projectId: process.env.GCLOUD_PROJECT_ID,
      credentials: serviceAccount,
    });

    const bucketName = process.env.GCS_BUCKET_NAME;
    const bucket = storage.bucket(bucketName);

    return bucket;
  } catch (error) {
    console.error('Failed to initialize Google Cloud Storage:', error);
    throw error;
  }
}

const uploadToGCS = async (file) => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    const bucket = await initializeStorage();
    const gcsFileName = `${Date.now()}_${file.originalname}`;
    const fileUpload = bucket.file(gcsFileName);

    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    return new Promise((resolve, reject) => {
      stream.on('error', (err) => {
        reject(err);
      });

      stream.on('finish', () => {
        fileUpload.makePublic().then(() => {
          resolve(`https://storage.googleapis.com/${bucket.name}/${gcsFileName}`);
        });
      });

      stream.end(file.buffer);
    });
  } catch (error) {
    throw error;
  }
};

module.exports = { uploadToGCS };
