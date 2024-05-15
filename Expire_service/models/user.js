const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: String,
  manufacturer: String,
  warrantyExpiryDate: Date,
  productImage: String,
  receiptImage: String,
  notes: String,
});

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  items: [itemSchema],
});

module.exports = mongoose.model('User', userSchema);
