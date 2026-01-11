const mongoose = require("mongoose");


const feeStructureSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    totalFee: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    discountReason: {
      type: String,
    },
    paymentMode: {
      type: String,
      enum: ["ONE_TIME", "INSTALLMENT"],
      required: true,
    },
    numberOfInstallments: {
      type: Number,
      enum: [2, 3, 4],
      required: function () {
        return this.paymentMode === "INSTALLMENT";
      },
    },
    installmentSummary: {
      totalInstallments: {
        type: Number,
        default: 0,
      },
      paidInstallments: {
        type: Number,
        default: 0,
      },
      pendingInstallments: {
        type: Number,
        default: 0,
      },
      paidAmount: {
        type: Number,
        default: 0,
      },
      pendingAmount: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FeeStructure", feeStructureSchema);
