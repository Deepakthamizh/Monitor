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

const GitHubStrategy = require('passport-github2').Strategy;

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value || '';
    let user = await collection.findOne({ email });

    if (!user) {
      user = await collection.create({
        name: profile.username,
        email: email,
        password: '', // placeholder
        isOAuth: true,
        premium: false
      });
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  const user = await collection.findById(id);
  done(null, user);
});

const MicrosoftStrategy = require('passport-azure-ad-oauth2').Strategy;
const jwt = require('jsonwebtoken');

passport.use('microsoft', new MicrosoftStrategy({
  clientID: process.env.MICROSOFT_CLIENT_ID,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  callbackURL: process.env.MICROSOFT_CALLBACK_URL,
  scope: ['user.read']
}, async (accessToken, refreshToken, params, profile, done) => {
  const decoded = jwt.decode(params.id_token);

  const microsoftId = decoded.oid;
  const displayName = decoded.name;

  let user = await collection.findOne({ microsoftId });

  if (!user) {
    user = await collection.create({
      name: displayName,
      microsoftId,
      premium: false
    });
  }

  return done(null, user);
}));

