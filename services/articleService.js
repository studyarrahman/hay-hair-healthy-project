const Article = require('../models/articleModel');

const createArticle = async (title, content, imagePath) => {
  return await Article.create(title, content, imagePath);
};

const getAllArticles = async (page, limit) => {
  try {
    const snapshot = await Article.findAll(page, limit);
    const articles = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const totalCount = await Article.getTotalCount();
    const totalPages = Math.ceil(totalCount / limit);

    return {
      articles,
      currentPage: page,
      totalPages,
      totalItems: totalCount,
      itemsPerPage: articles.length
    };
  } catch (error) {
    console.error('Terjadi kesalahan saat mengambil artikel:', error);
    throw error;
  }
};

const getArticleById = async (id) => {
  return await Article.findById(id);
};

const updateArticle = async (id, title, content, imagePath) => {
  await Article.update(id, title, content, imagePath);
};

const deleteArticle = async (id) => {
  await Article.delete(id);
};

const searchArticlesByTitle = async (title, page, limit) => {
  return await Article.searchByTitle(title, page, limit);
};


module.exports = {
  createArticle,
  getAllArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
  searchArticlesByTitle,
};