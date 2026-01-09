const FeeStructure = require("./../models/feeStrAd");

const createFeeStructure = async (req, res) => {
  try {

    const {
      studentId,
      totalFee,
      discount = 0,
      discountReason,
      paymentMode,
      numberOfInstallments,
    } = req.body;

    if (!studentId || !totalFee || !paymentMode) {
      return res.status(400).json({
        success: false,
        message: "Student ID, Total Fee and Payment Mode are required",
      });
    }

    // Installment validation
    if (
      paymentMode === "INSTALLMENT" &&
      ![2, 3, 4].includes(numberOfInstallments)
    ) {
      return res.status(400).json({
        success: false,
        message: "Number of installments must be 2, 3 or 4",
      });
    }


    const feeStructure = await FeeStructure.create({
      studentId,
      totalFee,
      discount,
      discountReason,
      paymentMode,
      numberOfInstallments:
        paymentMode === "INSTALLMENT" ? numberOfInstallments : null,
    });

    res.status(201).json({
      success: true,
      message: "Fee structure created successfully",
      data: feeStructure,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { createFeeStructure };
