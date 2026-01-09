// Get single student by id (RESTful)
const express = require("express");
const {
  loginUser,
  registerUser,
  getDashboardStats,
  getUserList,
} = require("../controllers/auth");
const { addStudent, getStudents, updateStudent, getStudentById } = require("../controllers/stu");
const { addCourse, getCourses, } = require("../controllers/course");
const {
  getTransactionHistory,
  addTransaction,
} = require("../controllers/transH");
const { createFeeStructure } = require("../controllers/feeStrAd");

const router = express.Router();


router.post("/register", registerUser);
router.post("/login", loginUser);

// GET Dashboard Stats
router.get("/dashboard", getDashboardStats);
router.get("/users", getUserList);
router.get("/students", getStudents);
router.get("/student/:id", getStudentById);
router.get("/courses", getCourses);
router.get("/transactions", getTransactionHistory);
router.post("/transactions", addTransaction);
router.post("/addStudent", addStudent);
router.post("/addCourse", addCourse);
router.post("/fee-structure", createFeeStructure);
router.put("/:id", updateStudent);
router.get("/:id", getStudentById);

module.exports = router;
