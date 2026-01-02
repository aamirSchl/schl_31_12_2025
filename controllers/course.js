const Course = require("./../models/course");

/**
 * ADD COURSE (POST)
 */
const addCourse = async (req, res) => {
  try {
    const { name, code, description, duration, baseFee, isActive } = req.body;

    if (!name || !code || !duration || !baseFee) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    // Check duplicate course code
    const existingCourse = await Course.findOne({ code });
    if (existingCourse) {
      return res.status(409).json({
        success: false,
        message: "Course with this code already exists",
      });
    }

    const course = await Course.create({
      name,
      code,
      description,
      duration,
      baseFee,
      isActive,
    });

    res.status(201).json({
      success: true,
      message: "Course added successfully",
    //   data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET COURSES (LIST)
 */
const getCourses = async (req, res) => {
  try {
    const { isActive } = req.query;

    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    const courses = await Course.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addCourse,
  getCourses,
};
