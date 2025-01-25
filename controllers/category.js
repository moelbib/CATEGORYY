const Category = require("../models/Category");
const User = require('../models/User');
const fs = require("fs");

// E_CAT_10 : Création d'une nouvelle catégorie
exports.createCategory = (req, res) => {
  const parentId = req.body.parent && req.body.parent.trim() !== '' 
    ? req.body.parent
    : null;

  const category = new Category({
    name: req.body.name,
    parent: parentId,
    isRoot: !parentId
  });

  category.save()
    .then((savedCategory) => res.status(201).json(savedCategory))
    .catch((error) => {
      console.error(error);
      if (error.code === 11000) {
        res.status(400).json({ message: "Le nom de la catégorie est déjà utilisé" });
      } else if (error.name === "ValidationError") {
        res.status(400).json({
          message: "Saisie incorrecte sur un ou plusieurs champs",
          error: error.message
        });
      } else {
        res.status(500).json({
          message: "Erreur serveur",
          error: error.message
        });
      }
    });
};

// E_CAT_20 : Associer une catégorie parent-enfant
exports.addChildCategory = async (req, res) => {
  try {
    const parentCategory = await Category.findById(req.params.id);
    if (!parentCategory) {
      return res.status(404).json({ message: "Parent introuvable" });
    }

    // Vérifie si la sous-catégorie existe déjà
    const existingChild = await Category.findOne({ name: req.body.name });
    let childCategory;

    if (existingChild) {
      // PREVENT self-parent
      if (existingChild._id.equals(parentCategory._id)) {
        return res.status(400).json({ message: "Une catégorie ne peut pas être son propre parent." });
      }

      // Vérifie si elle est déjà associée
      if (existingChild.parent && existingChild.parent.equals(parentCategory._id)) {
        return res.status(400).json({ message: "Cette catégorie est déjà une sous-catégorie de ce parent." });
      }

      // Sinon, on la relie comme enfant (sous-catégorie)
      childCategory = await Category.findByIdAndUpdate(
        existingChild._id,
        { parent: parentCategory._id, isRoot: false },
        { new: true }
      );
    } else {
      // Crée une nouvelle sous-catégorie
      // isRoot = false si un parent existe
      childCategory = new Category({
        name: req.body.name,
        parent: parentCategory._id,
        isRoot: false
      });
      await childCategory.save();
    }

    // Ajoute la sous-catégorie dans le tableau children du parent
    if (!parentCategory.children.includes(childCategory._id)) {
      parentCategory.children.push(childCategory._id);
      await parentCategory.save();
    }

    res.status(201).json({ message: "Catégorie enfant ajoutée!", parentCategory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};


// E_CAT_30 : Modifier une catégorie
exports.updateCategory = async (req, res) => {
  try {
    // 1) No self-parent
    if (req.body.parent && req.body.parent === req.params.id) {
      return res.status(400).json({ message: "A category cannot be its own parent." });
    }

    // 2) Find the old category to see its current parent
    const oldCategory = await Category.findById(req.params.id);
    if (!oldCategory) {
      return res.status(404).json({ message: "Category not found." });
    }
    const oldParentId = oldCategory.parent;  // might be null

    // 3) Determine new parent
    const newParentId = req.body.parent || null; // if empty or '', treat as null
    const isRoot = !newParentId; // if there's no parent, it's root

    // 4) Build the fields to update
    const updateFields = {
      ...req.body,
      parent: newParentId,
      isRoot
    };

    // 5) Actually update the category
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );

    // 6) If old parent existed, remove this category from old parent's children
    if (oldParentId && (!newParentId || newParentId.toString() !== oldParentId.toString())) {
      const oldParent = await Category.findById(oldParentId);
      if (oldParent) {
        oldParent.children = oldParent.children.filter(
          (childId) => !childId.equals(updatedCategory._id)
        );
        await oldParent.save();
      }
    }

    // 7) If we now have a new parent, push into the new parent's children array (if not already present)
    if (newParentId) {
      const newParent = await Category.findById(newParentId);
      if (newParent && !newParent.children.includes(updatedCategory._id)) {
        newParent.children.push(updatedCategory._id);
        await newParent.save();
      }
    }

    return res.status(200).json(updatedCategory);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erreur lors de la mise à jour de la catégorie",
      error: error.message
    });
  }
};


// E_CAT_40 : Supprimer une catégorie
exports.deleteCategory = (req, res) => {
  Category.findByIdAndDelete(req.params.id)
    .then(() => res.status(200).json({ message: "Catégorie supprimée!" }))
    .catch(error => res.status(400).json({ error }));
};

// E_CAT_50 : Récupérer une catégorie (avec parent et enfants)
exports.getCategoryWithParentAndChildren = (req, res) => {
  Category.findById(req.params.id)
    .populate("parent", "name creationDate isRoot")
    .populate("children", "name creationDate isRoot")
    .then((category) => {
      if (!category) return res.status(404).json({ message: "Category not found" });

      res.status(200).json({
        category: {
          id: category._id,
          name: category.name,
          creationDate: category.creationDate ? category.creationDate.toISOString() : null,
          isRoot: category.isRoot,
        },
        parent: category.parent,
        children: category.children.map((child) => ({
          _id: child._id,
          name: child.name,
          creationDate: child.creationDate ? child.creationDate.toISOString() : null,
        })),
      });
    })
    .catch((error) => res.status(500).json({ error: error.message }));
};

// E_CAT_60 : Recherche avec filtres (racine, dates, etc.)
exports.searchCategories = (req, res) => {
  const filters = {};

  // isRoot filter
  if (req.query.isRoot) {
    filters.isRoot = req.query.isRoot === "true";
  }

  // Date filters
  if (req.query.creationDateAfter) {
    filters.creationDate = {
      ...filters.creationDate,
      $gte: new Date(req.query.creationDateAfter)
    };
  }
  if (req.query.creationDateBefore) {
    filters.creationDate = {
      ...filters.creationDate,
      $lte: new Date(req.query.creationDateBefore)
    };
  }

  // Combined date range => automatically merges in the filters above

  Category.find(filters)
    .then(categories => res.status(200).json(categories))
    .catch(error => res.status(400).json({ error }));
};

// E_CAT_70 : Tri des catégories
// sortBy=name or creationDate or childrenCount
// order=asc or desc
exports.getCategoriesSorted = (req, res) => {
  const sortField = req.query.sortBy || "name";
  const sortOrder = req.query.order === "desc" ? -1 : 1;

  if (sortField === "childrenCount") {
    // Aggregation to sort by size of children array
    Category.aggregate([
      {
        $addFields: {
          childrenCount: { $size: "$children" }
        }
      },
      {
        $sort: { childrenCount: sortOrder }
      }
    ])
      .then(result => res.status(200).json(result))
      .catch(error => res.status(400).json({ error }));
  } else {
    Category.find()
      .sort({ [sortField]: sortOrder })
      .then(categories => res.status(200).json(categories))
      .catch(error => res.status(400).json({ error }));
  }
};

// E_CAT_80 : Détails d'une catégorie
exports.getCategoryDetails = (req, res) => {
  Category.findById(req.params.id)
    .populate("children", "name creationDate isRoot")
    .then(category => {
      if (!category) return res.status(404).json({ message: "Catégorie introuvable" });
      res.status(200).json(category);
    })
    .catch(error => res.status(400).json({ error }));
};

// Récupérer toutes les catégories (juste id, name, creationDate, isRoot)
exports.getAllCategories = (req, res) => {
  Category.find()
    .select('_id name creationDate isRoot')
    .then(categories => res.status(200).json(categories))
    .catch(error => res.status(400).json({ error }));
};
