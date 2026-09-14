import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists with this Google ID
          let user = await User.findOne({
            'oauthProviders.provider': 'google',
            'oauthProviders.providerId': profile.id,
          });

          if (user) {
            return done(null, user);
          }

          // Check if user exists with the same email
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // Add Google OAuth to existing user
            user.oauthProviders.push({
              provider: 'google',
              providerId: profile.id,
            });
            if (!user.avatarUrl && profile.photos && profile.photos.length > 0) {
              user.avatarUrl = profile.photos[0].value;
            }
            await user.save();
            return done(null, user);
          }

          // Create new user
          const username = profile.emails[0].value.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');
          let finalUsername = username;
          let counter = 1;
          
          // Ensure unique username
          while (await User.findOne({ username: finalUsername })) {
            finalUsername = `${username}${counter}`;
            counter++;
          }

          user = await User.create({
            name: profile.displayName,
            username: finalUsername,
            email: profile.emails[0].value,
            avatarUrl: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : '',
            oauthProviders: [
              {
                provider: 'google',
                providerId: profile.id,
              },
            ],
          });

          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
}

// GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
        scope: ['user:email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists with this GitHub ID
          let user = await User.findOne({
            'oauthProviders.provider': 'github',
            'oauthProviders.providerId': profile.id,
          });

          if (user) {
            return done(null, user);
          }

          // Get primary email
          const email = profile.emails && profile.emails.length > 0 
            ? profile.emails.find(e => e.primary)?.value || profile.emails[0].value
            : `${profile.username}@github.user`;

          // Check if user exists with the same email
          user = await User.findOne({ email });

          if (user) {
            // Add GitHub OAuth to existing user
            user.oauthProviders.push({
              provider: 'github',
              providerId: profile.id,
            });
            if (!user.avatarUrl && profile.photos && profile.photos.length > 0) {
              user.avatarUrl = profile.photos[0].value;
            }
            await user.save();
            return done(null, user);
          }

          // Create new user
          let finalUsername = profile.username.toLowerCase().replace(/[^a-z0-9_]/g, '_');
          let counter = 1;
          
          // Ensure unique username
          while (await User.findOne({ username: finalUsername })) {
            finalUsername = `${profile.username}${counter}`.toLowerCase().replace(/[^a-z0-9_]/g, '_');
            counter++;
          }

          user = await User.create({
            name: profile.displayName || profile.username,
            username: finalUsername,
            email,
            avatarUrl: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : '',
            oauthProviders: [
              {
                provider: 'github',
                providerId: profile.id,
              },
            ],
          });

          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
}

export default passport;
