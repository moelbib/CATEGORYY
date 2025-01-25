const mongoose = require("mongoose");

// Middleware pour s'assurer qu'une catégorie enfant ne soit pas elle-même et n'ait pas plusieurs parents
module.exports = async function (next) {
  if (this.parent && this.parent.equals(this._id)) {
    return next(new Error("Une catégorie ne peut pas être enfant d'elle-même"));
  }
  
  if (this.parent) {
    const parentCategory = await mongoose.model("Category").findById(this.parent);
    if (parentCategory && parentCategory.children.includes(this._id)) {
      return next(new Error("Une catégorie enfant ne peut avoir qu'un seul parent"));
    }
  }

  this.isRoot = !this.parent; // `isRoot` devient `false` si la catégorie a un parent
  next();
};
    