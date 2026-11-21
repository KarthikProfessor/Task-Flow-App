import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ApiError, asyncHandler } from "../utils/ApiError.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (await User.exists({ email }))
    throw new ApiError(409, "Email is already registered");

  const user = await User.create({ name, email, password });
  
  res.status(201).json(
    { 
      token: signToken(user._id), 
      user 
    }
  );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }
  res.json({ token: signToken(user._id), user });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
