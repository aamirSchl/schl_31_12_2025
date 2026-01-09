const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    studentId: {
      type: String, // reference id
      required: true,
    },

    student: {
      type: Object, // storing snapshot of student
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["CASH", "UPI", "CARD", "CHEQUE","ONLINE"],
      required: true,
    },

    transactionRef: {
      type: String,
      required: true,
      unique: true,
    },

    remarks: {
      type: String,
    },

    processedByUser: {
      id: String,
      name: String,
      role: {
        type: String,
        enum: ["ADMIN", "USER"],
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
