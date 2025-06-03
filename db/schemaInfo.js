// db/schemaInfo.js
const mongoose = require("mongoose");

const schemaInfoSchema = new mongoose.Schema({
  version: String,
  load_date_time: String,
});

module.exports = mongoose.model("SchemaInfo", schemaInfoSchema);