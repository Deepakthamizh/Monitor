function isAuthenticated(req, res, next) {
  // Enhanced logging for debugging
  console.log("Auth Check - Session ID:", req.sessionID);
  console.log("Auth Check - Session Data:", {
    userId: req.session.userId,
    premium: req.session.premium,
    expires: req.session.cookie.expires
  });
  console.log("Auth Check - Cookies:", req.headers.cookie);
  console.log("Auth Check - Passport User:", req.user);

  const userId = req.user?._id || req.session.userId;

  if (!userId) {
    console.error("Authentication failed - No user ID found");
    if (req.headers.accept?.includes("application/json")) {
      return res.status(401).json({ 
        message: "Unauthorized",
        details: {
          sessionExists: !!req.session,
          hasSessionUserId: !!req.session.userId,
          hasPassportUser: !!req.user
        }
      });
    }
    return res.redirect("https://monitor---a-todo-app.web.app/login.html");
  }

  // Optional: Verify the user exists in DB
  collection.findById(userId)
    .then(user => {
      if (!user) {
        console.error("Authentication failed - User not found in DB");
        return res.status(401).json({ message: "User account not found" });
      }
      
      // Attach full user object to request for later use
      req.authenticatedUser = user;
      next();
    })
    .catch(err => {
      console.error("Authentication DB error:", err);
      res.status(500).json({ message: "Authentication server error" });
    });
}

module.exports = isAuthenticated;