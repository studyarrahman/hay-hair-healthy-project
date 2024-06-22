const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify', authController.verifyAccount);
router.post('/resend-verification', authController.resendVerificationCode);
router.post('/logout', authController.logout);
router.delete('/delete-account', authController.deleteAccount);
router.put('/edit-user', authController.editUser);
router.get('/user/:userId', authController.getUser);
router.post('/reset-password', authController.resetPassword);
router.post('/change-password', authController.changePassword);
router.get('/', authController.helloWorld);

module.exports = router;