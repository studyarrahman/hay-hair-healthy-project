const initializeFirebase = require('../config/firebase');
const initializeFirestore = require('../config/firestore');
const { getAuth, signInWithEmailAndPassword, signOut, deleteUser, sendPasswordResetEmail, updatePassword } = require("firebase/auth");
const { validateEmail, validatePhone, validatePassword } = require("../utils/validation");
const { createUser, verifyUser, resendVerificationCode, deleteUserData, updateUser } = require("../services/userService");

exports.register = async (req, res) => {
  try {
    const { name, phone, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number" });
    }

    // Lanjutkan dengan proses registrasi
    await createUser({ name, phone, email, password });
    res.status(201).json({
      message: "User registered successfully. Please check your email to verify."
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.verifyAccount = async (req, res) => {
  const { email, code } = req.body; // Menerima email dan kode dari body request

  try {
    const result = await verifyUser(email, code);
    if (result) {
      res.status(200).json({ message: "Account verified successfully." });
    } else {
      res.status(400).json({ error: "Invalid verification code." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resendVerificationCode = async (req, res) => {
  const { email } = req.body; // Menerima email dari body request

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    await resendVerificationCode(email);
    res.status(200).json({ message: "Verification code resent successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Memeriksa apakah email dan password tidak diisi
    if (!email && !password) {
      return res.status(400).json({ error: "Email dan Password tidak boleh kosong" });
    }

    // Memeriksa apakah email tidak diisi
    if (!email) {
      return res.status(400).json({ error: "Email tidak boleh kosong" });
    }

    // Memeriksa apakah password tidak diisi
    if (!password) {
      return res.status(400).json({ error: "Password tidak boleh kosong" });
    }

    const { app } = await initializeFirebase();
    const firestore = await initializeFirestore();
    
    const auth = getAuth(app);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Mendapatkan token ID untuk sesi pengguna
    const token = await user.getIdToken();

    const userDoc = await firestore.collection("users").doc(user.uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }
    const userData = userDoc.data();

    if (!userData.verified) {
      return res.status(403).json({
        error: "Your account is not verified. Please check your email to verify your account."
      });
    }

    // Mengirimkan token dan user ID sebagai bagian dari respons
    res.status(200).json({ message: "Login successful", token, userId: user.uid, userData });
  } catch (error) {
    if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
      return res.status(403).json({ error: "Invalid email or password" });
    } else if (error.code === "auth/invalid-credential") {
      return res.status(400).json({ error: "Email atau Password Salah" });
    } else {
      return res.status(400).json({ error: error.message });
    }
  }
};

exports.logout = async (req, res) => {
  try {
    const { app } = await initializeFirebase();
    
    const auth = getAuth(app);
    await signOut(auth);
    
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { app } = await initializeFirebase();
    
    const auth = getAuth(app);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    const userId = userCredential.user.uid;

    // Hapus data pengguna dari Firestore
    await deleteUserData(userId);

    // Hapus pengguna dari Firebase Authentication
    await deleteUser(userCredential.user);

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.editUser = async (req, res) => {
  try {
    const { userId, name, phone, email } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (email && !validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (phone && !validatePhone(phone)) {
      return res.status(400).json({ error: "Invalid phone format" });
    }

    await updateUser({ userId, name, phone, email });
    
    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    
res.status(500).json({ error: error.message });
}
};

exports.getUser = async (req, res) => {
try {
const { userId } = req.params;

if (!userId) {
return res.status(400).json({ error: "User ID is required" });
}

const firestore = await initializeFirestore();

const userDoc = await firestore.collection("users").doc(userId).get();
if (!userDoc.exists) {
return res.status(404).json({ error: "User not found" });
}

const userData = userDoc.data();
res.status(200).json({ userData });
} catch (error) {
res.status(500).json({ error: error.message });
}
};

exports.setNewPassword = async (req, res) => {
try {
const { oobCode, newPassword } = req.body; // oobCode adalah kode dari email reset password

if (!oobCode || !newPassword) {
return res.status(400).json({ error: "oobCode and new password are required" });
}

if (!validatePassword(newPassword)) {
return res.status(400).json({ error: "New password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number" });
}

const { app } = await initializeFirebase();

const auth = getAuth(app);
await confirmPasswordReset(auth, oobCode, newPassword);

res.status(200).json({ message: "Password has been reset successfully" });
} catch (error) {
res.status(500).json({ error: error.message });
}
};

exports.changePassword = async (req, res) => {
try {

const { email, oldPassword, newPassword } = req.body;

if (!email || !oldPassword || !newPassword) {
return res.status(400).json({ error: "Email, old password, and new password are required" });
}

if (!validatePassword(newPassword)) {
return res.status(400).json({ error: "New password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character" });
}

const { app } = await initializeFirebase();

const auth = getAuth(app);
const userCredential = await signInWithEmailAndPassword(auth, email, oldPassword);
const user = userCredential.user;

await updatePassword(user, newPassword);

res.status(200).json({ message: "Password changed successfully" });

} catch (error) {

res.status(500).json({ error: error.message });

}
};

exports.resetPassword = async (req, res) => {

try {

const { email } = req.body;

if (!email) {

return res.status(400).json({ error: "Email is required" });

}

const { app } = await initializeFirebase();

const auth = getAuth(app);
await sendPasswordResetEmail(auth, email);

res.status(200).json({ message: "Password reset email sent successfully" });

} catch (error) {

res.status(500).json({ error: error.message });

}
};

exports.helloWorld = (req,res) => {

res.send("Hello World Bismillah bisa ayok bisa");

};
