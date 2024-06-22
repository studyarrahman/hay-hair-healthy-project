const fs = require("fs").promises;
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];
const PROJECT_ID = 'hay-hair-beauty';
const CREDENTIALS_SECRET_ID = 'my-credentials';
const TOKEN_SECRET_ID = 'my-token';

/**
 * Mengakses versi secret dari Secret Manager.
 *
 * @param {string} secretId ID secret di Secret Manager.
 * @return {Promise<Object>} Objek JavaScript dari payload secret.
 */
async function accessSecretVersion(secretId) {
  const client = new SecretManagerServiceClient();
  const versionId = 'latest';
  // Membangun  secret
  const name = `projects/${PROJECT_ID}/secrets/${secretId}/versions/${versionId}`;

  // Mengakses versi secret
  const [version] = await client.accessSecretVersion({ name });

  // Mengambil payload dan mengonversinya ke bentuk string
  const payload = version.payload.data.toString('utf8');

  // Mengonversi string JSON menjadi objek JavaScript
  return JSON.parse(payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 * @return {Promise<OAuth2Client>}
 */
async function authorize() {
  let credentials;
  let token;

  try {
    credentials = await accessSecretVersion(CREDENTIALS_SECRET_ID);
  } catch (err) {
    console.error('Error accessing credentials:', err);
    throw err;
  }

  try {
    token = await accessSecretVersion(TOKEN_SECRET_ID);
  } catch (err) {
    console.error('Error accessing token:', err);
    throw err;
  }

  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  oAuth2Client.setCredentials(token);

  // Refresh token if it's expired
  if (token.expiry_date && token.expiry_date <= Date.now()) {
    try {
      await oAuth2Client.getAccessToken();
      const newToken = oAuth2Client.credentials;
      await saveTokenToSecretManager(newToken);  // Save updated token back to Secret Manager
    } catch (err) {
      console.error('Error refreshing access token:', err);
    }
  }

  return oAuth2Client;
}

/**
 * Save the updated token to Secret Manager.
 *
 * @param {Object} token The token object to save.
 * @return {Promise<void>}
 */
async function saveTokenToSecretManager(token) {
  const client = new SecretManagerServiceClient();
  const name = `projects/${PROJECT_ID}/secrets/${TOKEN_SECRET_ID}/versions/latest`;

  const payload = JSON.stringify(token);

  await client.addSecretVersion({
    parent: name,
    payload: {
      data: Buffer.from(payload, 'utf8'),
    },
  });

  console.log('Token saved to Secret Manager.');
}

module.exports = { authorize };