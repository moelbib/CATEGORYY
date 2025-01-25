const express = require('express');
const userCtrl = require('../controllers/user');
const router = express.Router();
const auth = require("../middleware/auth");

router.post('/login', userCtrl.login);
router.post('/signup', userCtrl.signup);
router.get("/", userCtrl.alluser);
router.get("/current", auth, userCtrl.getCurrentUser);
router.get("/currentUserId", auth, userCtrl.getCurrentUserId);
router.delete("/:email", auth, userCtrl.delete);

module.exports = router;