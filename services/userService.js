const initializeFirebase = require('../config/firebase');
const { sendVerificationEmail } = require("../controllers/emailController");
const { generateVerificationCode } = require("../models/user");

async function createUser({ name, phone, email, password }) {
  const { admin, db } = await initializeFirebase();
  const userCredential = await admin.auth().createUser({ email, password });
  const userId = userCredential.uid;
  const verificationCode = generateVerificationCode();

  await db.collection("users").doc(userId).set({
    name,
    phone,
    email,
    verificationCode,
    verified: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(), // Menambahkan timestamp
  });

  await sendVerificationEmail(email, verificationCode);
  return userId;
}

async function verifyUser(email, code) {
  const { db } = await initializeFirebase();
  
  console.log(`Received email: '${email}', code: '${code}'`); // Log untuk debugging

  if (!email) {
    console.error("Email is undefined or empty");
    return false; // Atau handle error sesuai kebutuhan
  }

  const userRef = db.collection('users').where("email", "==", email).limit(1);
  const snapshot = await userRef.get();

  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    const userData = doc.data();
    if (userData.verificationCode === code) {
      await db.collection('users').doc(doc.id).update({
        verified: true,
        verificationCode: null // Opsional: Hapus kode verifikasi setelah berhasil
      });
      return true;
    } else {
      console.log(`Invalid code. Expected: ${userData.verificationCode}, received: ${code}`);
    }
  } else {
    console.log("No user found with the given email.");
  }
  return false;
}

async function resendVerificationCode(email) {
  const { db } = await initializeFirebase();

  if (!email) {
    throw new Error("Email is required");
  }

  const userRef = db.collection('users').where("email", "==", email).limit(1);
  const snapshot = await userRef.get();

  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    const newVerificationCode = generateVerificationCode();

    await db.collection('users').doc(doc.id).update({
      verificationCode: newVerificationCode,
    });

    await sendVerificationEmail(email, newVerificationCode);
  } else {
    console.log("No user found with the given email.");
    throw new Error("No user found with the given email.");
  }
}

async function deleteUserData(userId) {
  const { db } = await initializeFirebase();
  
  const userRef = db.collection('users').doc(userId);
  await userRef.delete();
}

async function updateUser({ userId, name, phone, email }) {
  const { db } = await initializeFirebase();

  const userRef = db.collection('users').doc(userId);
  const updates = {};
  let sendVerification = false;

  if (name) updates.name = name;
  if (phone) updates.phone = phone;
  if (email) {
    updates.email = email;
    updates.verified = false; // Set verified to false if email is changed
    updates.verificationCode = generateVerificationCode();
    sendVerification = true;
  }

  await userRef.update(updates);

  if (sendVerification) {
    await sendVerificationEmail(email, updates.verificationCode);
  }
}

module.exports = {
  createUser,
  verifyUser,
  resendVerificationCode,
  deleteUserData,
  updateUser,
};
