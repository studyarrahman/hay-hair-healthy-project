const ArticleService = require('../services/articleService');
const { uploadToGCS } = require('../utils/gcsHelper');

const createArticle = async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  let imagePath = null;

  if (req.file) {
    try {
      imagePath = await uploadToGCS(req.file);
    } catch (error) {
      console.error('Failed to upload image to GCS:', error);
      return res.status(500).json({ error: 'Failed to upload image to GCS' });
    }
  }

  try {
    const id = await ArticleService.createArticle(title, content, imagePath);
    console.log('Article created with ID:', id);
    res.status(201).json({ id, title, content, image: imagePath });
  } catch (error) {
    console.error('Failed to create article:', error);
    res.status(500).json({ error: 'Failed to create article' });
  }
};

const getAllArticles = async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const limit = 20;

  try {
    const { articles, currentPage, totalPages, totalItems, itemsPerPage } = await ArticleService.getAllArticles(page, limit);
    res.json({
      data: articles,
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage
    });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mendapatkan artikel' });
  }
};

const getArticleById = async (req, res) => {
  const { id } = req.params;
  try {
    const article = await ArticleService.getArticleById(id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get article' });
  }
};

const updateArticle = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  let imagePath = null;

  if (req.file) {
    try {
      imagePath = await uploadToGCS(req.file);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to upload image to GCS' });
    }
  }

  try {
    await ArticleService.updateArticle(id, title, content, imagePath);
    res.json({ message: 'Article updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update article' });
  }
};

const deleteArticle = async (req, res) => {
  const { id } = req.params;
  try {
    await ArticleService.deleteArticle(id);
    res.json({ message: 'Article deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete article' });
  }
};

const searchArticles = async (req, res) => {
  const { title } = req.query;
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit) : 20;

  if (!title) {
    return res.status(400).json({ error: 'Title is required for search' });
  }

  try {
    const lowerCaseTitle = title.toLowerCase();
    console.log('Received search request for title:', lowerCaseTitle);
    
    const { articles, currentPage, totalPages, totalItems, itemsPerPage } = await ArticleService.searchArticlesByTitle(lowerCaseTitle, page, limit);
    
    if (articles.length === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    console.log('Search results:', {
      data: articles,
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage
    });

    res.json({
      data: articles,
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage
    });
  } catch (error) {
    console.error('Failed to search articles:', error);
    res.status(500).json({ error: 'Failed to search articles' });
  }
};






module.exports = {
  createArticle,
  getAllArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
  searchArticles
};