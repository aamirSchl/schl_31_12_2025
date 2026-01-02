const express = require("express");
const {
  loginUser,
  registerUser,
  getDashboardStats,
} = require("../controllers/auth");
const { addStudent, getStudents, updateStudent } = require("../controllers/stu");
const { addCourse, getCourses, } = require("../controllers/course");
const {
  getTransactionHistory,
} = require("../controllers/transH");
const { createFeeStructure } = require("../controllers/feeStrAd");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// GET Dashboard Stats
router.get("/dashboard", getDashboardStats);
router.post("/addStudent", addStudent);
router.get("/students", getStudents);
// POST Add Course
router.post("/addCourse", addCourse);

// GET Courses
router.get("/courses", getCourses);

router.put("/:id", updateStudent);

router.get("/transactions", getTransactionHistory);
router.post("/fee-structure", createFeeStructure);

module.exports = router;
