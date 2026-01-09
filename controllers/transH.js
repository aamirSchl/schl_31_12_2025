const Transaction = require("./../models/transH");

/**
 * GET Transaction History
 */
const getTransactionHistory = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      studentId,
      paymentMethod,
      startDate,
      endDate,
    } = req.query;

    const query = {};

    // Filter by student
    if (studentId) {
      query.studentId = studentId;
    }

    // Filter by payment method
    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Transaction.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const addTransaction = async (req, res) => {
  try {
    const {
      studentId,
      student,
      amount,
      paymentMethod,
      transactionRef,
      remarks,
      processedByUser
    } = req.body;

    if (!studentId || !student || !amount || !paymentMethod || !transactionRef || !processedByUser) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    const transaction = await Transaction.create({
      studentId,
      student,
      amount,
      paymentMethod,
      transactionRef,
      remarks,
      processedByUser
    });

    res.status(201).json({
      success: true,
      message: "Transaction added successfully",
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { getTransactionHistory, addTransaction };
