const mongoose = require("mongoose");

const installmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    installmentNo: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "PARTIAL"],
      default: "PENDING",
    },
    paymentMethod: {
      type: String,
      enum: ["CASH", "ONLINE", null],
      default: null,
    },
    paidDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Installment", installmentSchema);
