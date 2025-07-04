const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8')
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const isAuthenticated = async (req, res, next) => {
  // 1. Session-based authentication (for web app)
  if (req.session && req.session.userId) {
    return next();
  }

  // 2. Bearer token authentication (for API clients)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      return next();
    } catch (error) {
      console.error("Token verification failed:", error);
      return res.status(403).json({ message: "Unauthorized" });
    }
  }

  // If neither session nor token is present
  return res.status(401).json({ message: "No token or session provided" });
};

module.exports = isAuthenticated;