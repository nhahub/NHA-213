
import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    action: { type: String, required: true }, // مثال: "Recycled 3 bottles"
    date: { type: Date, default: Date.now },  // مثال: "2025-10-12T09:00:00Z"
    Points: { type: Number, default: 0 },     // مثال: 150
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // 📧 Email verification
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
    verifyOtp: String,
    verifyOtpExpireAt: Number,

    // 🔑 Password reset
    resetOtp: String,
    resetOtpExpireAt: Number,

    // 🧭 Profile fields
    profileImage: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    points: {
      type: Number,
      default: 0,
    },
    level: {
      type: [String],
      default: ["Beginner"],
    },
    daysRecycled: {
      type: Number,
      default: 0,
    },
    badges: {
      type: [String],
      default: ["Eco Starter"],
    },

    // ♻ Stats object
    stats: {
      thisWeek: { type: Number, default: 0 },
      totalRecycled: { type: Number, default: 0 },
      co2Saved: { type: Number, default: 0 },
    },

    // ♻ Activity log
    activity: {
      type: [activitySchema],
      default: [],
    },
  },
  { timestamps: true }
);

// ✅ Clean JSON response
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.verifyOtp;
  delete obj.verifyOtpExpireAt;
  delete obj.resetOtp;
  delete obj.resetOtpExpireAt;
  return obj;
};

const User = mongoose.model("User", userSchema);

export default User;


