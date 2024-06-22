const { Firestore } = require('@google-cloud/firestore');
const dotenv = require('dotenv');

dotenv.config();

const firestore = new Firestore();
const collectionName = 'recommendations';

const getRecommendationData = async () => {
  try {
    const snapshot = await firestore.collection(collectionName).get();
    const recommendations = snapshot.docs.map(doc => doc.data());
    return recommendations;
  } catch (error) {
    console.error('Error fetching data from Firestore:', error);
    throw error;
  }
};

const getRecommendationByHairIssue = async (label) => {
  try {
    const snapshot = await firestore.collection(collectionName).where('hair_issue', '==', label).get();
    const recommendations = snapshot.docs.map(doc => doc.data());
    return recommendations;
  } catch (error) {
    console.error('Error fetching data from Firestore:', error);
    throw error;
  }
};

module.exports = {
  getRecommendationData,
  getRecommendationByHairIssue,
};