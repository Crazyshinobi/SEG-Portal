import sendResponse from "../utils/responseUtils.js";
import User from "../models/userModel.js";
import userValidationSchema from "../schemas/userValidationSchema.js";
import sendOtpEmail from "../services/emailService.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  createRecord,
  deleteRecord,
  getRecord,
  getSingleRecord,
} from "../common/commonDatabaseQueries.js";

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    // Generate a token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      role: user.role,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, "Server Error");
  }
};

const createUser = async (req, res) => {
  const { error } = userValidationSchema.validate(req.body);

  if (error) {
    return sendResponse(res, 400, false, error.details[0].message);
  }

  try {
    const { name, email, password, role } = req.body;

    const existingUser = await getSingleRecord(User, { email: email });

    if (existingUser.data) {
      console.log("User already exists!");
      return res.status(400).json({
        success: false,
        message: "User already exists!",
        data: existingUser.data,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await createRecord(User, {
      name,
      email,
      password: hashedPassword,
      role,
    });

    if (newUser.status) {
      sendResponse(res, 201, true, "User created successfully", newUser.data);
    } else {
      sendResponse(res, 500, false, "Something went wrong");
    }
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, "Internal server Error");
  }
};

const getUsers = async (req, res) => {
  const options = { name: 1, email: 1, role: 1, createdAt: 1 };
  const query = {};
  try {
    const users = await getRecord(User, query, options);
    if (users.status) {
      sendResponse(res, 200, true, "Data fetched successfully", users.data);
    } else {
      sendResponse(res, 500, false, "Something went wrong", users);
    }
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, "Internal server Error");
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return sendResponse(res, 400, false, "ID is requried");
  }
  const user = await getSingleRecord(User, { _id: id });
  if (!user) {
    return sendResponse(res, 404, false, "User not found");
  }
  try {
    const deletedUser = await deleteRecord(User, { _id: id });

    if (deletedUser.status) {
      sendResponse(res, 200, true, "User deleted successfully", user.data);
    } else {
      sendResponse(res, 500, false, "Something went wrong", user);
    }
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, "Internal server Error");
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    await sendOtpEmail(email);
    res.status(200).json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.error(error);
    if (error.message === "User not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.otpExpires < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "OTP has expired" });
    }

    res.status(200).json({
      success: true,
      message: "OTP verified. You can now reset your password",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOtp = null;
    user.otpExpires = null;

    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export {
  createUser,
  getUsers,
  deleteUser,
  loginUser,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
