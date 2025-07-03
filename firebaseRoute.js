const express = require("express");
const router = express.Router();
const { collection } = require("./model/user.data");

router.post("/firebase-login", async (req, res) => {
  const { firebaseUID } = req.body;

  try {
    let user = await collection.findOne({ firebaseUID });

    if (!user) {
      user = await collection.create({ firebaseUID, premium: false });
    }

    req.session.userId = user._id;
    req.session.premium = user.premium;

    req.session.save((err) => {
      if (err) return res.status(500).json({ error: "Session save failed" });
      res.json({ success: true, name: user.name, premium: user.premium });
    });
  } catch (error) {
    console.error("Firebase login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
