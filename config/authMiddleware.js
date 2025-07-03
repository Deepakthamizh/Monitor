function isAuthenticated(req, res, next) {
  
  console.log("Session data:", req.session);
  
  const userId = req.user?._id || req.session.userId;

  if (!userId) {
    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res.status(401).json({ message: "Unauthorized User: Please log in" });
    }
    return res.redirect("https://monitor---a-todo-app.web.app/login.html");
  }

  next();
}

module.exports = isAuthenticated;
