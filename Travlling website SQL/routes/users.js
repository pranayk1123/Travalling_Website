const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const User = require("../models/User"); 

// 🚀 इथे approveUser इम्पोर्टमध्ये ॲड केलंय
const { registerUser, loginUser, updateAdmin, deleteUser, approveUser, googleLogin } = require('../controllers/userController');

// 🚀 छोटासा सिक्युरिटी गार्ड
const adminCheck = (req, res, next) => {
  if (req.headers.role === "admin") {
    next();
  } else {
    res.status(403).json({ msg: "Access Denied! You are not an admin." });
  }
};

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.post("/google-login", userController.googleLogin);
router.put("/update-admin", adminCheck, userController.updateAdmin);


// 🚀 delete ला adminCheck लावलाय आणि नवीन PUT राऊट ॲड केलाय
router.delete('/:id', adminCheck, deleteUser); 
router.put('/:id', adminCheck, approveUser); // 👈 Sub-Admin Accept करण्यासाठी!

// 🚀 नवीन राऊट: ॲडमिनला सगळे युजर्स दाखवण्यासाठी (मूळ कोडला धक्का न लावता)
router.get("/", adminCheck, async (req, res) => {
  try {
    const users = await User.findAll({ order: [['createdAt', 'DESC']] });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;