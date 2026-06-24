// const express = require("express");
// const router = express.Router();
// const ctrl = require("../controllers/leadController");
// const adminCheck = require("../middleware/adminCheck");

// // user
// router.post("/", ctrl.createLead);

// // admin
// router.get("/", adminCheck, ctrl.getLeads);
// router.put("/:id", adminCheck, ctrl.updateLead);
// router.delete("/:id", adminCheck, ctrl.deleteLead);

// module.exports = router;







const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead");

// 🚀 छोटासा सिक्युरिटी गार्ड
const adminCheck = (req, res, next) => {
  if (req.headers.role === "admin") {
    next();
  } else {
    res.status(403).json({ msg: "Access Denied! You are not an admin." });
  }
};

// 🚀 सगळे leads मिळवा
router.get("/", adminCheck, async (req, res) => {
  try {
    const leads = await Lead.findAll({ order: [['createdAt', 'DESC']] });
    res.json(leads);
  } catch (err) {
    console.error("Error fetching leads:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🚀 Lead status update करा (Approve/Reject)
router.put("/:id", adminCheck, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`Updating lead ${id} with status: ${status}`);

    // Sequelize में findByPk किंवा findOne दोनों काम करते हैं
    const lead = await Lead.findByPk(id);

    if (!lead) {
      return res.status(404).json({ msg: "Request not found" });
    }

    // Status update करा
    lead.status = status; // "approved" या "rejected"
    await lead.save();

    res.json({ msg: `Request ${status} successfully! ✅`, lead });

  } catch (error) {
    console.error("Error updating lead status:", error);
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
});

// 🚀 Lead delete करा
router.delete("/:id", adminCheck, async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findByPk(id);

    if (!lead) {
      return res.status(404).json({ msg: "Request not found" });
    }

    await lead.destroy();
    res.json({ msg: "Request deleted successfully 🗑️" });

  } catch (error) {
    console.error("Error deleting lead:", error);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
