import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../../database/schemas/user.model.js";
import UserSettings from "../../database/schemas/user-settings.model.js";

export const configurePassport = () => {
  // ── Serialization ──────────────────────────────────────────
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  // ── GitHub Strategy ────────────────────────────────────────
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callbackURL: process.env.GITHUB_CALLBACK_URL,
          scope: ["user:email"],
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const user = await findOrCreateOAuthUser(profile, "github");
            done(null, user);
          } catch (err) {
            done(err, null);
          }
        }
      )
    );
    console.log("✅ GitHub OAuth strategy configured");
  } else {
    console.log("⚠️  GitHub OAuth not configured (missing env vars)");
  }

  // ── Google Strategy ────────────────────────────────────────
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL,
          scope: ["profile", "email"],
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const user = await findOrCreateOAuthUser(profile, "google");
            done(null, user);
          } catch (err) {
            done(err, null);
          }
        }
      )
    );
    console.log("✅ Google OAuth strategy configured");
  } else {
    console.log("⚠️  Google OAuth not configured (missing env vars)");
  }
};

/**
 * Find an existing user by provider/providerId, or create a new one.
 *
 * Exported for direct unit testing — production code calls this only
 * through the Passport strategy callbacks above.
 */
export async function findOrCreateOAuthUser(profile, provider) {
  const providerId = profile.id;

  // Try to find by provider
  let user = await User.findOne({ provider, providerId });
  if (user) return user;

  // Try to find by email (link accounts)
  const email =
    profile.emails && profile.emails.length > 0
      ? profile.emails[0].value
      : `${provider}-${providerId}@oauth.local`;

  user = await User.findOne({ email });
  if (user) {
    // Link provider to existing account
    user.provider = provider;
    user.providerId = providerId;
    if (!user.avatar && profile.photos?.[0]?.value) {
      user.avatar = profile.photos[0].value;
    }
    await user.save();
    return user;
  }

  // Create new user
  user = await User.create({
    name: profile.displayName || profile.username || "OAuth User",
    email,
    provider,
    providerId,
    avatar: profile.photos?.[0]?.value || "",
    role: "student",
    plan: "free",
    isActive: true,
    status: "active",
  });

  // Create default settings
  await UserSettings.create({ userId: user._id });

  return user;
}
