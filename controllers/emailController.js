const { google } = require('googleapis');
const { authorize } = require('../config/gmailConfig');

/**
 * Mengirim email verifikasi menggunakan Gmail API.
 *
 * @param {string} recipientEmail Email penerima.
 * @param {string} verificationCode Kode verifikasi.
 */
async function sendVerificationEmail(recipientEmail, verificationCode) {
  try {
    const auth = await authorize();
    const gmail = google.gmail({ version: 'v1', auth });
    const email = `To: ${recipientEmail}\r\n` +
                  'Subject: Verify your email\r\n' +
                  '\r\n' +
                  `Your verification code is: ${verificationCode}`;

    const encodedMessage = Buffer.from(email)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log('Email sent:', res.data);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

module.exports = { sendVerificationEmail };