const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    admissionNo: {
      type: String,
      required: true,
      unique: true,
    },

    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      required: true,
    },

    dateOfBirth: {
      type: Date,
    },

    address: String,
    city: String,
    state: String,
    pincode: String,

    guardianName: String,
    guardianPhone: String,

    courseId: {
      type: String,
      required: true,
    },

    course: {
      type: Object, // frontend mockCourses object
      required: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },

    admissionDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true } // creates createdAt & updatedAt
);

module.exports = mongoose.model("Student", studentSchema);
