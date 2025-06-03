const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  comment: String,
  date_time: { type: Date, default: Date.now },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "Users" }, 
});

const photoSchema = new mongoose.Schema({
  file_name: { type: String },
  date_time: { type: Date, default: Date.now },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "Users" }, 
  comments: [commentSchema],
});

module.exports = mongoose.model("Photos", photoSchema);