const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const { collection } = require("./model/user.data");

// Initialize Firebase Admin using base64 environment variable
if (!admin.apps.length) {
  const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!serviceAccountBase64) {
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_BASE64 env variable");
  }

  const serviceAccount = JSON.parse(
    Buffer.from(serviceAccountBase64, "base64").toString("utf8")
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Route: POST /session-login
router.post("/session-login", async (req, res) => {
  const { idToken, name } = req.body;

  if (!idToken) {
    return res.status(400).json({ error: "No token provided" });
  }

  try {
    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const firebaseUID = decodedToken.uid;

    // Check if user exists in DB
    let user = await collection.findOne({ firebaseUID });

    // If user doesn't exist, create with firebaseUID and name
    if (!user) {
      user = await collection.create({
        firebaseUID,
        name: name || "",  // fallback if name is undefined
        premium: false,
      });
    }

    // Set session
    req.session.userId = user._id;
    req.session.premium = user.premium;

    req.session.save((err) => {
      if (err) return res.status(500).json({ error: "Session save failed" });
      res.json({
        success: true,
        name: user.name || "",
        premium: user.premium,
      });
    });
  } catch (error) {
    console.error("Session login failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
