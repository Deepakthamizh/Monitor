const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { collection } = require('../model/user.data'); // login model


passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {

  // Check for the user exists in MongoDB
  const existingUser = await collection.findOne({ googleId: profile.id });

  if (existingUser) {
    return done(null, existingUser);
  }

  const email = profile.emails?.[0]?.value || '';
  const userName = profile.displayName || email.split('@')[0] || 'GoogleUser';

  // If not create a new user
  const newUser = await new collection({
    name: profile.displayName,
    googleId: profile.id,
    premium: false // default
  }).save();

  done(null, newUser);
}));

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  const user = await collection.findById(id);
  done(null, user);
});

/* const GitHubStrategy = require('passport-github2').Strategy;

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('GitHub profile:', profile); // add this

    // Try to fetch email
    const email = profile.emails && profile.emails.length > 0
      ? profile.emails[0].value
      : `${profile.username}@github.com`; // fallback fake email

    let user = await collection.findOne({ email });

    if (!user) {
      user = await collection.create({
        name: profile.displayName || profile.username || "GitHub User",
        email: email,
        password: '',
        isOAuth: true,
        premium: false
      });
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));*/