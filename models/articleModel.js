const { Firestore } = require('@google-cloud/firestore');
const initializeFirestore = require('../config/firestore');

const Article = {
  create: async (title, content, imagePath) => {
    try {
      const firestore = await initializeFirestore();
      const docRef = firestore.collection('articles').doc();
      const data = {
        title,
        content,
        image: imagePath,
        createdAt: Firestore.FieldValue.serverTimestamp(),
        updatedAt: Firestore.FieldValue.serverTimestamp(),
      };
      await docRef.set(data);
      console.log('Document successfully written with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating document in Firestore:', error);
      throw error;
    }
  },

  findAll: async (page, limit) => {
    try {
      const firestore = await initializeFirestore();
      return await firestore.collection('articles')
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .offset((page - 1) * limit)
        .get();
    } catch (error) {
      console.error('Error fetching documents from Firestore:', error);
      throw error;
    }
  },

  getTotalCount: async () => {
    try {
      const firestore = await initializeFirestore();
      const snapshot = await firestore.collection('articles').count().get();
      return snapshot.data().count;
    } catch (error) {
      console.error('Error fetching document count from Firestore:', error);
      throw error;
    }
  },

  findById: async (id) => {
    try {
      const firestore = await initializeFirestore();
      const doc = await firestore.collection('articles').doc(id).get();
      if (!doc.exists) {
        console.log('No such document!');
        return null;
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error fetching document from Firestore:', error);
      throw error;
    }
  },

  update: async (id, title, content, imagePath) => {
    try {
      const firestore = await initializeFirestore();
      const docRef = firestore.collection('articles').doc(id);
      const data = {
        title,
        content,
        image: imagePath,
        updatedAt: Firestore.FieldValue.serverTimestamp(),
      };
      await docRef.update(data);
      console.log('Document successfully updated');
    } catch (error) {
      console.error('Error updating document in Firestore:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const firestore = await initializeFirestore();
      const docRef = firestore.collection('articles').doc(id);
      await docRef.delete();
      console.log('Document successfully deleted');
    } catch (error) {
      console.error('Error deleting document from Firestore:', error);
      throw error;
    }
  },

  searchByTitle: async (title, page, limit) => {
    try {
      const firestore = await initializeFirestore();
      const lowerCaseTitle = title.toLowerCase();
      console.log('Searching for title:', lowerCaseTitle);
      console.log('Page:', page, 'Limit:', limit);

      // Perform a query that finds documents where the title contains the search term
      const snapshot = await firestore.collection('articles').get();

      // Filter results manually to simulate a case-insensitive search
      const filteredDocs = snapshot.docs.filter(doc => doc.data().title.toLowerCase().includes(lowerCaseTitle));

      // Implement pagination on the filtered results
      const totalCount = filteredDocs.length;
      const totalPages = Math.ceil(totalCount / limit);
      const paginatedDocs = filteredDocs.slice((page - 1) * limit, page * limit);

      const articles = paginatedDocs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Articles found:', articles);

      return {
        articles,
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: articles.length
      };
    } catch (error) {
      console.error('Error searching documents in Firestore:', error);
      throw error;
    }
  },
};

module.exports = Article;
