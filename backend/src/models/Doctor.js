const mongoose = require("mongoose");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      trim: true,
    },
    hospital: {
      type: String,
      required: [true, "Hospital is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [emailRegex, "Please provide a valid email address"],
    },
  },
  {
    timestamps: true,
  }
);

// Name lookups. List search uses case-insensitive regex, not a text index.
doctorSchema.index({ name: 1 });

// Filtering doctors by specialization.
doctorSchema.index({ specialization: 1 });

// Filtering doctors by hospital.
doctorSchema.index({ hospital: 1 });

// Date-based filtering and newest-first listing.
doctorSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Doctor", doctorSchema);
