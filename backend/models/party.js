const mongoose = require("mongoose");

const partySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  noPeople: {
    type: Number,
    required: true,
    max: 100,
    min: 0,
  },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("Party", partySchema);
