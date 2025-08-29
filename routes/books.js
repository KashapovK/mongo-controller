const express = require('express');
const { getBooks } = require('../controllers/booksController');
const router = express.Router();

router.get('/', getBooks);

module.exports = router;
