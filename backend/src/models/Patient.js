const mongoose = require("mongoose");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const patientSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor is required"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator(value) {
          if (!value) {
            return true;
          }
          return emailRegex.test(value);
        },
        message: "Please provide a valid email address",
      },
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
    },
    age: {
      type: Number,
      min: [0, "Age cannot be negative"],
      max: [120, "Age cannot exceed 120"],
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "other"],
        message: "Gender must be male, female, or other",
      },
    },
    condition: {
      type: String,
      required: [true, "Condition is required"],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Patients for a given doctor, typically listed newest first.
// The doctorId prefix also supports lookups by doctorId alone.
patientSchema.index({ doctorId: 1, createdAt: -1 });

// Prefix/equality lookups when searching patients by name.
// This is not a text index; list search uses case-insensitive regex.
patientSchema.index({ name: 1 });

// Filtering patients by medical condition.
patientSchema.index({ condition: 1 });

// Default patient list is newest-first across all doctors.
patientSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Patient", patientSchema);
