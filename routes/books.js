const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// GET all books with search and pagination
router.get('/', async (req, res, next) => {
  try {
    const { author, genre, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    if (author) filter.author = { $regex: author, $options: 'i' };
    if (genre) filter.genre = { $regex: genre, $options: 'i' };
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);
    
    const books = await Book.find(filter)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });
    
    const total = await Book.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: books,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET single book by ID
router.get('/:id', async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid book ID format'
      });
    }
    next(error);
  }
});

// POST add new book
router.post('/', async (req, res, next) => {
  try {
    const { title, author, genre, price, publishedDate, inStock } = req.body;
    
    // Validate required fields
    if (!title || !author || price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, author, and price are required'
      });
    }
    
    const book = new Book({
      title,
      author,
      genre,
      price,
      publishedDate,
      inStock
    });
    
    await book.save();
    
    res.status(201).json({
      success: true,
      data: book
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    next(error);
  }
});

// PUT update book by ID
router.put('/:id', async (req, res, next) => {
  try {
    const { title, author, genre, price, publishedDate, inStock } = req.body;
    
    // Validate required fields
    if (!title || !author || price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, author, and price are required'
      });
    }
    
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    // Update fields
    book.title = title;
    book.author = author;
    book.genre = genre;
    book.price = price;
    book.publishedDate = publishedDate || book.publishedDate;
    book.inStock = inStock !== undefined ? inStock : book.inStock;
    
    await book.save();
    
    res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid book ID format'
      });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    next(error);
  }
});

// DELETE book by ID
router.delete('/:id', async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    await book.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid book ID format'
      });
    }
    next(error);
  }
});

module.exports = router;