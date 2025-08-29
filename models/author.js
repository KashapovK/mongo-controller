const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  name: String,
  country: String,
});

module.exports = mongoose.model('Author', authorSchema);
