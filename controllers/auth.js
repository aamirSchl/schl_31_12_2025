const User = require("./../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check fields
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2. Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 4. Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 5. Response
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validate input
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Name, email, password and role are required",
      });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // 5. Response
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Dashboard API
const getDashboardStats = async (req, res) => {
  try {
    // MOCK DATA (as provided)
    const mockDashboardStats = {
      totalStudents: 4,
      activeStudents: 4,
      totalRevenue: 37083,
      pendingAmount: 22167,
      overdueAmount: 4500,
      completedPayments: 1,
      partialPayments: 3,

      recentTransactions: [
        {
          id: "TXN001",
          studentName: "Rahul Sharma",
          amount: 3333,
          method: "CASH",
          status: "PARTIAL",
          date: "2025-12-25",
        },
        {
          id: "TXN002",
          studentName: "Priya Patel",
          amount: 7500,
          method: "UPI",
          status: "PARTIAL",
          date: "2025-12-20",
        },
        {
          id: "TXN003",
          studentName: "Amit Verma",
          amount: 15000,
          method: "UPI",
          status: "COMPLETED",
          date: "2025-12-18",
        },
        {
          id: "TXN004",
          studentName: "Neha Singh",
          amount: 3750,
          method: "CARD",
          status: "PARTIAL",
          date: "2025-12-15",
        },
        {
          id: "TXN005",
          studentName: "Rohit Kumar",
          amount: 4500,
          method: "CHEQUE",
          status: "OVERDUE",
          date: "2025-12-10",
        },
      ],

      paymentsByMethod: {
        CASH: 3333,
        UPI: 25500,
        CARD: 3750,
        CHEQUE: 4500,
      },

      courseStats: [
        {
          name: "Basic Fire Safety Training",
          count: 2,
          baseFee: 10000,
        },
        {
          name: "Advanced Fire Safety & Rescue",
          count: 1,
          baseFee: 25000,
        },
        {
          name: "Fire Safety Management",
          count: 1,
          baseFee: 18000,
        },
      ],

      upcomingInstallments: [
        {
          studentName: "Rahul Sharma",
          amount: 3333,
          dueDate: "2026-01-01",
        },
        {
          studentName: "Priya Patel",
          amount: 7500,
          dueDate: "2026-02-05",
        },
      ],
    };

    res.status(200).json({
      success: true,
      data: mockDashboardStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getUserList = async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude password field
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { loginUser, registerUser, getDashboardStats, getUserList };