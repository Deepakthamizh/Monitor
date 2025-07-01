function isAuthenticated(req, res, next) {
  const userId = req.cookies.userId;
  if(!userId) {
    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res.status(401).json({message: "Unauthorized User: Please log in"});
    }
    return res.redirect("/login");
  }
  next();
}

module.exports = isAuthenticated;