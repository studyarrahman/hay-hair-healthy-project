const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const checkAdmin = require('../middlewares/authMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');

router.post('/create-article', checkAdmin, uploadMiddleware, articleController.createArticle);
router.put('/update-article/:id', checkAdmin, uploadMiddleware, articleController.updateArticle);

router.get('/articles', articleController.getAllArticles);
router.get('/article/:id', articleController.getArticleById);
router.delete('/delete-article/:id', checkAdmin, articleController.deleteArticle);

router.get('/search-article', articleController.searchArticles);

module.exports = router;
