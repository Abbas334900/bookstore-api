const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true
  },
  genre: {
    type: String,
    trim: true,
    default: 'Uncategorized'
  },
  price: {
    type: Number,
    required: [true, 'Book price is required'],
    min: [0, 'Price cannot be negative']
  },
  publishedDate: {
    type: Date,
    default: Date.now
  },
  inStock: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Book', bookSchema);