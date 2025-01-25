const mongoose = require("mongoose");
const categoryMiddleware = require("../middleware/categoryMiddleware");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  creationDate: {
    type: Date,
    default: Date.now
  },
  isRoot: {
    type: Boolean,
    default: true
  },
  children: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    }
  ],
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null
  }
});

// Applique le Middleware avant de sauvegarder une catégorie
categorySchema.pre("save", categoryMiddleware);

module.exports = mongoose.model("Category", categorySchema);
