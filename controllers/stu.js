const FeeStructure = require("../models/feeStrAd");
const Student = require("../models/stu");
const Installment = require("../models/installment");

const addStudent = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      address,
      city,
      state,
      pincode,
      guardianName,
      guardianPhone,
      courseId,
      courseName,
      // Fee structure fields
      totalFee,
      discount = 0,
      discountReason,
      paymentMode,
      numberOfInstallments,
      // 🔹 NEW: Installment summary & details
      installmentSummary,
      installments
    } = req.body;

    // Required validation
    if (!firstName || !lastName || !email || !phone || !courseId || !totalFee || !paymentMode) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing (student or fee structure)",
      });
    }

    // Duplicate email check
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: "Student already exists",
      });
    }

    // 🔹 Dynamic Admission No
    const year = new Date().getFullYear();
    const lastStudent = await Student.findOne().sort({ createdAt: -1 });

    let nextNumber = "0001";
    if (lastStudent?.admissionNo) {
      const lastNumber = parseInt(lastStudent.admissionNo.slice(-4));
      nextNumber = String(lastNumber + 1).padStart(4, "0");
    }

    const admissionNo = `FS${year}${nextNumber}`;

    // Create student
    const student = await Student.create({
      admissionNo,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      address,
      city,
      state,
      pincode,
      guardianName,
      guardianPhone,
      courseId,
      courseName,
      status: "ACTIVE",           // ✅ dynamic
      admissionDate: new Date(),  // ✅ dynamic
    });

    // Create fee structure for this student with installment summary
    const feeStructure = await FeeStructure.create({
      studentId: student._id,
      totalFee,
      discount,
      discountReason,
      paymentMode,
      numberOfInstallments: paymentMode === "INSTALLMENT" ? numberOfInstallments : null,
      // 🔹 NEW: Store installment summary
      installmentSummary: installmentSummary || {
        totalInstallments: 0,
        paidInstallments: 0,
        pendingInstallments: 0,
        paidAmount: 0,
        pendingAmount: 0,
      }
    });

    // 🔹 NEW: Create individual installment records if provided
    let installmentRecords = [];
    if (installments && Array.isArray(installments) && installments.length > 0) {
      installmentRecords = await Installment.insertMany(
        installments.map(inst => ({
          studentId: student._id,
          installmentNo: inst.installmentNo,
          amount: inst.amount,
          status: inst.status,
          paymentMethod: inst.paymentMethod,
          paidDate: inst.status === 'PAID' ? new Date() : null
        }))
      );
    }

    res.status(201).json({
      success: true,
      message: "Student, fee structure, and installments added successfully",
      data: {
        student: {
          id: student._id,
          admissionNo: student.admissionNo,
          status: student.status,
          admissionDate: student.admissionDate,
        },
        feeStructure,
        installments: installmentRecords
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getStudents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      courseId,
    } = req.query;

    const query = {};

    // Status filter (ACTIVE / INACTIVE)
    if (status) {
      query.status = status;
    }

    // Course filter
    if (courseId) {
      query.courseId = courseId;
    }

    // Search (name, email, admissionNo)
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { admissionNo: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [students, total] = await Promise.all([
      Student.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Student.countDocuments(query),
    ]);

    // 🔹 NEW: Attach feeStatus, feeStructure, and installments for each student
    const studentsWithDetails = await Promise.all(
      students.map(async (student) => {
        const feeStructure = await FeeStructure.findOne({ studentId: student._id });
        
        // Get installments if payment mode is INSTALLMENT
        let installments = [];
        if (feeStructure && feeStructure.paymentMode === 'INSTALLMENT') {
          installments = await Installment.find({ studentId: student._id }).sort({ installmentNo: 1 });
        }

        let feeStatus = "UNPAID";
        let feeStructureWithCalculations = null;

        if (feeStructure) {
          // 🔹 Calculate total paid and balance
          const totalPaid = feeStructure.installmentSummary?.paidAmount || 0;
          const netFee = feeStructure.totalFee - (feeStructure.discount || 0);
          const balance = netFee - totalPaid;

          // Calculate fee status
          if (feeStructure.paymentMode === 'ONE_TIME') {
            feeStatus = totalPaid > 0 ? "PAID" : "UNPAID";
          } else {
            // For installments
            const paidCount = installments.filter(i => i.status === 'PAID').length;
            if (paidCount === 0) {
              feeStatus = "UNPAID";
            } else if (paidCount === installments.length) {
              feeStatus = "PAID";
            } else {
              feeStatus = "PARTIAL";
            }
          }

          // Include calculated fields in feeStructure response
          feeStructureWithCalculations = {
            ...feeStructure.toObject(),
            totalPaid,  // 🔹 ADD: Total amount paid
            netFee,     // 🔹 ADD: Net fee after discount
            balance     // 🔹 ADD: Remaining balance
          };
        }

        return {
          ...student.toObject(),
          feeStatus,
          feeStructure: feeStructureWithCalculations,
          installments
        };
      })
    );

    res.status(200).json({
      success: true,
      data: studentsWithDetails,
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

// UPDATE Student
const updateStudent = async (req, res) => {
  try {
    const { _id } = req.params;

    // Check student exists
    const student = await Student.findById(_id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Prevent duplicate email / admissionNo
    if (req.body.email || req.body.admissionNo) {
      const duplicate = await Student.findOne({
        _id: { $ne: id },
        $or: [
          { email: req.body.email },
          { admissionNo: req.body.admissionNo },
        ],
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Email or Admission No already exists",
        });
      }
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: updatedStudent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// getStudentDatabyId

const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid student id",
      });
    }

    // 1️⃣ Get Student
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // 2️⃣ Get Fee Structure using studentId
    const feeStructure = await FeeStructure.findOne({ studentId: id });

    // 🔹 NEW: Get Installments
    let installments = [];
    let feeStructureWithCalculations = null;

    if (feeStructure) {
      if (feeStructure.paymentMode === 'INSTALLMENT') {
        installments = await Installment.find({ studentId: id }).sort({ installmentNo: 1 });
      }

      // Calculate total paid and balance
      const totalPaid = feeStructure.installmentSummary?.paidAmount || 0;
      const netFee = feeStructure.totalFee - (feeStructure.discount || 0);
      const balance = netFee - totalPaid;

      // Include calculated fields
      feeStructureWithCalculations = {
        ...feeStructure.toObject(),
        totalPaid,
        netFee,
        balance
      };
    }

    res.status(200).json({
      success: true,
      data: {
        student,
        feeStructure: feeStructureWithCalculations,
        installments
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  addStudent,
  getStudents,
  updateStudent,
  getStudentById,
};