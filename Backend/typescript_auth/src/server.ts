import express from 'express';
import passport from 'passport';
import session from 'cookie-session';
import dotenv from 'dotenv';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

app.use(
  session({
    name: 'session',
    keys: [process.env.SECRET_KEY || 'secret'],
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user: any, done) => {
  done(null, user);
});
passport.deserializeUser((user: any, done) => {
  done(null, user as any);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    (accessToken, refreshToken, profile, done) => {
      // Here you can save/find the user in your DB
      return done(null, profile);
    }
  )
);

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/google/failure', session: false }),
  (req: any, res) => {
    // Successful authentication
    const user = req.user;
    // Create JWT
    const token = jwt.sign({
      id: user.id,
      displayName: user.displayName,
      emails: user.emails,
    }, process.env.SECRET_KEY || 'secret', { expiresIn: '1d' });
    // Redirect to frontend with token (or set cookie)
    res.redirect(`${FRONTEND_URL}/google-callback?token=${token}`);
  }
);

app.get('/auth/google/failure', (req, res) => {
  res.status(401).send('Google authentication failed');
});

app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`);
}); 