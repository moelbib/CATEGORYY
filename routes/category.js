const express = require("express");
const categoryCtrl = require("../controllers/category");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: API pour gérer les catégories
 */

/**
 * @swagger
 * /category:
 *   post:
 *     summary: Créer une nouvelle catégorie
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom de la catégorie
 *               parent:
 *                 type: string
 *                 description: ID de la catégorie parent (facultatif)
 *     responses:
 *       201:
 *         description: Catégorie créée avec succès
 *       400:
 *         description: Erreur de validation ou duplication
 *       500:
 *         description: Erreur serveur
 */
router.post("/", categoryCtrl.createCategory);

/**
 * @swagger
 * /category/{id}/child:
 *   post:
 *     summary: Associer une catégorie enfant à une catégorie parent
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la catégorie parent
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom de la sous-catégorie
 *     responses:
 *       201:
 *         description: Sous-catégorie associée avec succès
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Catégorie parent introuvable
 *       500:
 *         description: Erreur serveur
 */
router.post("/:id/child", categoryCtrl.addChildCategory);

/**
 * @swagger
 * /category/{id}:
 *   put:
 *     summary: Mettre à jour une catégorie existante
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la catégorie
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nouveau nom de la catégorie
 *               parent:
 *                 type: string
 *                 description: ID de la nouvelle catégorie parent (facultatif)
 *     responses:
 *       200:
 *         description: Catégorie mise à jour avec succès
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Catégorie introuvable
 *       500:
 *         description: Erreur serveur
 */
router.put("/:id", categoryCtrl.updateCategory);

/**
 * @swagger
 * /category/{id}:
 *   delete:
 *     summary: Supprimer une catégorie existante
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la catégorie
 *     responses:
 *       200:
 *         description: Catégorie supprimée avec succès
 *       404:
 *         description: Catégorie introuvable
 *       500:
 *         description: Erreur serveur
 */
router.delete("/:id", categoryCtrl.deleteCategory);

/**
 * @swagger
 * /category/search:
 *   get:
 *     summary: Rechercher des catégories avec des filtres
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: isRoot
 *         schema:
 *           type: boolean
 *         description: Filtrer par catégories racines
 *       - in: query
 *         name: creationDateAfter
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrer par date de création après
 *       - in: query
 *         name: creationDateBefore
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrer par date de création avant
 *     responses:
 *       200:
 *         description: Liste des catégories filtrées
 *       500:
 *         description: Erreur serveur
 */
router.get("/search", categoryCtrl.searchCategories);

/**
 * @swagger
 * /category/sorted:
 *   get:
 *     summary: Récupérer des catégories triées
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Champ pour le tri (name, creationDate, childrenCount)
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Ordre du tri (ascendant ou descendant)
 *     responses:
 *       200:
 *         description: Liste des catégories triées
 *       500:
 *         description: Erreur serveur
 */
router.get("/sorted", categoryCtrl.getCategoriesSorted);

/**
 * @swagger
 * /category/{id}/details:
 *   get:
 *     summary: Obtenir les détails d'une catégorie
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la catégorie
 *     responses:
 *       200:
 *         description: Détails de la catégorie
 *       404:
 *         description: Catégorie introuvable
 *       500:
 *         description: Erreur serveur
 */
router.get("/:id/details", categoryCtrl.getCategoryDetails);

/**
 * @swagger
 * /category/{id}/parent-children:
 *   get:
 *     summary: Obtenir les enfants et le parent d'une catégorie
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la catégorie
 *     responses:
 *       200:
 *         description: Détails de la catégorie avec son parent et ses enfants
 *       404:
 *         description: Catégorie introuvable
 *       500:
 *         description: Erreur serveur
 */
router.get("/:id/parent-children", categoryCtrl.getCategoryWithParentAndChildren);

/**
 * @swagger
 * /category/all:
 *   get:
 *     summary: Récupérer toutes les catégories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Liste de toutes les catégories
 *       500:
 *         description: Erreur serveur
 */
router.get("/all", categoryCtrl.getAllCategories);

module.exports = router;