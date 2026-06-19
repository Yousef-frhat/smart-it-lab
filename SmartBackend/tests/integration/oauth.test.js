/**
 * Integration tests — OAuth find-or-create logic (passport.js)
 *
 * Tests call findOrCreateOAuthUser() directly — no HTTP OAuth flow needed.
 * This function was exported from passport.js specifically for testability.
 */

import { connectTestDB, disconnectTestDB, clearCollections } from "../helpers/db.js";
import { findOrCreateOAuthUser } from "../../src/modules/auth/passport.js";
import User from "../../src/database/schemas/user.model.js";
import UserSettings from "../../src/database/schemas/user-settings.model.js";

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

afterEach(async () => {
  await clearCollections(User, UserSettings);
});

// ── Mock profile builders ─────────────────────────────────────────

function makeGitHubProfile(overrides = {}) {
  return {
    id: "gh-12345",
    displayName: "Alice GitHub",
    username: "alicegithub",
    emails: [{ value: "alice@github.com" }],
    photos: [{ value: "https://avatars.githubusercontent.com/u/12345" }],
    ...overrides,
  };
}

function makeGoogleProfile(overrides = {}) {
  return {
    id: "google-67890",
    displayName: "Bob Google",
    emails: [{ value: "bob@gmail.com" }],
    photos: [{ value: "https://lh3.googleusercontent.com/photo.jpg" }],
    ...overrides,
  };
}

// ── GitHub — new user ─────────────────────────────────────────────
describe("findOrCreateOAuthUser — GitHub new user", () => {
  test("creates a new User document with provider:github", async () => {
    const profile = makeGitHubProfile();
    await findOrCreateOAuthUser(profile, "github");

    const user = await User.findOne({ provider: "github", providerId: "gh-12345" });
    expect(user).not.toBeNull();
    expect(user.provider).toBe("github");
    expect(user.providerId).toBe("gh-12345");
  });

  test("sets email from profile.emails[0].value", async () => {
    const profile = makeGitHubProfile();
    await findOrCreateOAuthUser(profile, "github");

    const user = await User.findOne({ provider: "github" });
    expect(user.email).toBe("alice@github.com");
  });

  test("sets name from profile.displayName", async () => {
    const profile = makeGitHubProfile();
    await findOrCreateOAuthUser(profile, "github");

    const user = await User.findOne({ provider: "github" });
    expect(user.name).toBe("Alice GitHub");
  });

  test("sets avatar from profile.photos[0].value", async () => {
    const profile = makeGitHubProfile();
    await findOrCreateOAuthUser(profile, "github");

    const user = await User.findOne({ provider: "github" });
    expect(user.avatar).toBe("https://avatars.githubusercontent.com/u/12345");
  });

  test("assigns role:student and plan:free by default", async () => {
    const profile = makeGitHubProfile();
    await findOrCreateOAuthUser(profile, "github");

    const user = await User.findOne({ provider: "github" });
    expect(user.role).toBe("student");
    expect(user.plan).toBe("free");
  });

  test("creates a UserSettings record for the new user", async () => {
    const profile = makeGitHubProfile();
    const user = await findOrCreateOAuthUser(profile, "github");

    const settings = await UserSettings.findOne({ userId: user._id });
    expect(settings).not.toBeNull();
  });

  test("returns the created user object", async () => {
    const profile = makeGitHubProfile();
    const result = await findOrCreateOAuthUser(profile, "github");

    expect(result).toBeDefined();
    expect(result._id).toBeDefined();
    expect(result.email).toBe("alice@github.com");
  });
});

// ── GitHub — existing user (idempotency) ─────────────────────────
describe("findOrCreateOAuthUser — GitHub existing user", () => {
  test("calling twice with same profile creates only ONE user document", async () => {
    const profile = makeGitHubProfile();
    await findOrCreateOAuthUser(profile, "github");
    await findOrCreateOAuthUser(profile, "github");

    const count = await User.countDocuments({ provider: "github", providerId: "gh-12345" });
    expect(count).toBe(1);
  });

  test("second call returns the same user (same _id)", async () => {
    const profile = makeGitHubProfile();
    const first = await findOrCreateOAuthUser(profile, "github");
    const second = await findOrCreateOAuthUser(profile, "github");

    expect(first._id.toString()).toBe(second._id.toString());
  });

  test("does not create duplicate UserSettings on second call", async () => {
    const profile = makeGitHubProfile();
    const user = await findOrCreateOAuthUser(profile, "github");
    await findOrCreateOAuthUser(profile, "github");

    const count = await UserSettings.countDocuments({ userId: user._id });
    expect(count).toBe(1);
  });
});

// ── Google — new user ─────────────────────────────────────────────
describe("findOrCreateOAuthUser — Google new user", () => {
  test("creates a new User document with provider:google", async () => {
    const profile = makeGoogleProfile();
    await findOrCreateOAuthUser(profile, "google");

    const user = await User.findOne({ provider: "google", providerId: "google-67890" });
    expect(user).not.toBeNull();
    expect(user.provider).toBe("google");
  });

  test("sets email from Google profile.emails[0].value", async () => {
    const profile = makeGoogleProfile();
    await findOrCreateOAuthUser(profile, "google");

    const user = await User.findOne({ provider: "google" });
    expect(user.email).toBe("bob@gmail.com");
  });

  test("sets name from Google profile.displayName", async () => {
    const profile = makeGoogleProfile();
    await findOrCreateOAuthUser(profile, "google");

    const user = await User.findOne({ provider: "google" });
    expect(user.name).toBe("Bob Google");
  });

  test("creates UserSettings for Google user", async () => {
    const profile = makeGoogleProfile();
    const user = await findOrCreateOAuthUser(profile, "google");

    const settings = await UserSettings.findOne({ userId: user._id });
    expect(settings).not.toBeNull();
  });
});

// ── Google — existing user (idempotency) ─────────────────────────
describe("findOrCreateOAuthUser — Google existing user", () => {
  test("calling twice with same Google profile creates only ONE user", async () => {
    const profile = makeGoogleProfile();
    await findOrCreateOAuthUser(profile, "google");
    await findOrCreateOAuthUser(profile, "google");

    const count = await User.countDocuments({ provider: "google", providerId: "google-67890" });
    expect(count).toBe(1);
  });

  test("second Google call returns the same user", async () => {
    const profile = makeGoogleProfile();
    const first = await findOrCreateOAuthUser(profile, "google");
    const second = await findOrCreateOAuthUser(profile, "google");

    expect(first._id.toString()).toBe(second._id.toString());
  });
});

// ── Account linking — existing local user ────────────────────────
describe("findOrCreateOAuthUser — account linking", () => {
  test("links GitHub provider to existing local user with same email", async () => {
    // Create a local user first
    const localUser = await User.create({
      name: "Local Alice",
      email: "alice@github.com",
      password: "Password123",
      provider: "local",
      role: "student",
      plan: "free",
      isActive: true,
      status: "active",
    });

    const profile = makeGitHubProfile({ id: "gh-new-99" });
    const result = await findOrCreateOAuthUser(profile, "github");

    // Should return the existing user, not create a new one
    expect(result._id.toString()).toBe(localUser._id.toString());

    // Provider should now be linked
    const updated = await User.findById(localUser._id);
    expect(updated.provider).toBe("github");
    expect(updated.providerId).toBe("gh-new-99");
  });

  test("does not create a duplicate user when email already exists", async () => {
    await User.create({
      name: "Existing",
      email: "alice@github.com",
      password: "Password123",
      provider: "local",
      role: "student",
      plan: "free",
      isActive: true,
      status: "active",
    });

    const profile = makeGitHubProfile();
    await findOrCreateOAuthUser(profile, "github");

    const count = await User.countDocuments({ email: "alice@github.com" });
    expect(count).toBe(1);
  });
});

// ── Missing email in OAuth profile ───────────────────────────────
describe("findOrCreateOAuthUser — missing email fallback", () => {
  test("falls back to generated placeholder email when profile has no emails", async () => {
    const profile = makeGitHubProfile({
      id: "gh-noemail",
      emails: undefined, // no emails array
    });

    const user = await findOrCreateOAuthUser(profile, "github");

    expect(user).toBeDefined();
    // Implementation uses: `${provider}-${providerId}@oauth.local`
    expect(user.email).toBe("github-gh-noemail@oauth.local");
  });

  test("falls back when profile.emails is an empty array", async () => {
    const profile = makeGitHubProfile({
      id: "gh-emptyemail",
      emails: [],
    });

    const user = await findOrCreateOAuthUser(profile, "github");

    expect(user).toBeDefined();
    expect(user.email).toBe("github-gh-emptyemail@oauth.local");
  });

  test("placeholder email user is still created with correct provider", async () => {
    const profile = makeGitHubProfile({
      id: "gh-noemail2",
      emails: null,
    });

    const user = await findOrCreateOAuthUser(profile, "github");
    expect(user.provider).toBe("github");
    expect(user.providerId).toBe("gh-noemail2");
  });

  test("Google user without email gets placeholder", async () => {
    const profile = makeGoogleProfile({
      id: "google-noemail",
      emails: undefined,
    });

    const user = await findOrCreateOAuthUser(profile, "google");
    expect(user.email).toBe("google-google-noemail@oauth.local");
  });
});
