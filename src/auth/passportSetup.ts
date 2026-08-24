import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

console.log("CALLBACK_URL:", process.env.CALLBACK_URL);
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.CALLBACK_URL!,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value ?? "";

        console.log("Google Email:", email);

        done(null, email);
      } catch (error) {
        done(error);
      }
    },
  ),
);
