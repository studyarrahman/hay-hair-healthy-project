const initializeFirebase = require('../config/firebase');

const checkAdmin = async (req, res, next) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    return res.status(403).json({ error: 'No credentials sent!' });
  }
  const token = req.headers.authorization.split('Bearer ')[1];
  
  try {
    const { admin, db } = await initializeFirebase();
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

module.exports = checkAdmin;
