function isAuthenticated(req, res, next) {
  const userId = req.cookies.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized User: Please log in" });
  }

  next();
}

module.exports = isAuthenticated;