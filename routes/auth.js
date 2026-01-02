const express = require("express");
const {
  loginUser,
  registerUser,
  getDashboardStats,
} = require("../controllers/auth");
const { addStudent, getStudents } = require("../controllers/stu");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// GET Dashboard Stats
router.get("/dashboard", getDashboardStats);
router.post("/addStudent", addStudent);
router.get("/students", getStudents);

module.exports = router;
