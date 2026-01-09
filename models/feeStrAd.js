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
  },
  { timestamps: true }
);

module.exports = mongoose.model("FeeStructure", feeStructureSchema);
