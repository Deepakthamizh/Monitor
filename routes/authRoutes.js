const express = require('express');
const passport = require('passport');
const router = express.Router();

// Trigger login with Google
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback URL after Google login
router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/dashboard'); // or your main tasks page
  }
);

/*router.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login.html' }),
  (req, res) => {
    res.cookie("userId", req.user._id.toString(), { httpOnly: true, sameSite: "Strict", secure: true });
    res.cookie("premium", req.user.premium);
    res.redirect('/home');
  }
);*/

module.exports = router;
