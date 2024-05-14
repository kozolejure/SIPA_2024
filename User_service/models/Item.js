const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: String,
  manufacturer: String,
  warrantyExpiryDate: Date,
  productImage: String,
  receiptImage: String,
  notes: String,
});

module.exports = mongoose.model('Item', itemSchema);
