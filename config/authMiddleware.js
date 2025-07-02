function isAuthenticated(req, res, next) {
  const userId = req.session.userId;

  if (!userId) {
    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res.status(401).json({ message: "Unauthorized User: Please log in" });
    }
    return res.redirect("/login.html");
  }

  next();
}

module.exports = isAuthenticated;
