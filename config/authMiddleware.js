// // authMiddleware.js
// const admin = require("firebase-admin");

// const authenticate = async (req, res, next) => {
//   const authHeader = req.headers.authorization || "";
//   const token = authHeader.split("Bearer ")[1];

//   if (!token) return res.status(401).send("Unauthorized");

//   try {
//     const decoded = await admin.auth().verifyIdToken(token);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(401).send("Unauthorized");
//   }
// };

// module.exports = authenticate;
