import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false }, // optional for OAuth users
    role: {
      type: String,
      enum: ["student", "admin", "instructor"],
      default: "student",
    },
    plan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free",
    },
    avatar: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    refreshToken: { type: String, select: false },

    // Email verification
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpires: Date,

    // Password reset
    passwordResetToken: String,
    passwordResetExpires: Date,

    // OAuth provider info
    provider: { type: String, enum: ["local", "github", "google"], default: "local" },
    providerId: { type: String },

    // Aggregated stats (denormalized for performance)
    labsCompleted: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastLabDate: { type: Date },
  },
  { timestamps: true }
);

// Index for OAuth lookup
userSchema.index({ provider: 1, providerId: 1 });

// Hash password before save
userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare candidate password against the hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;