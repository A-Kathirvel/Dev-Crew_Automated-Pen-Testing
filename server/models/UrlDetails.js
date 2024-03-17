const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  url_id: Number,
  url_name: String,
  url_status: String,
  file_path: String,
});

const UrlDetails = mongoose.model('UrlDetails', urlSchema);

module.exports = UrlDetails;
