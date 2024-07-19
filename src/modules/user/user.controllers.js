import userModel from "../../../database/models/user.model.js";
import { AppError, catchAsyncError } from "../../utils/catchError.js";
import bcrypt from "bcryptjs";
import { sendEmail, sendResetPasswordMail } from "../../utils/email.js";
import jwt from "jsonwebtoken";
import JobModel from "../../../database/models/job.model.js";

/**
 * function for sign up in the application to be authenticated and saved in db to login with
 * Method : post
 * route : http://localhost:5000\auth\signUp
 * access : public 
 */

export const signUp = catchAsyncError(async (req, res, next) => {
  // 1 - destructing the required data
  let {
    firstName,
    lastName,
    email,
    password,
    Cpassword,
    recoveryEmail,
    DOB,
    mobileNumber,
  } = req.body;
  // 2 - check if the user already exists
  let user = await userModel.findOne({ email });
  if (user) return next(new AppError("user alredy register", 409));
  // 3 - check if the password and Cpassword are equel 
  if (password != Cpassword)
    return next(
      new AppError("password annd confirmed password doesnot Match", 401)
    );
  // 4 - check for unique Mobile Number
  user = await userModel.findOne({ mobileNumber });
  if (user) return next(new AppError("Mobile number already used", 409));

  // 5 - create the userName
  //we can use this way and alse we can use pre defined hook
  // const userName = firstName + ' ' + lastName;
  let hashedPass = bcrypt.hashSync(password, Number(process.env.SALT_ROUNDS));
  // 6 - generate the otp
  let otpCode = Math.floor(100000 + Math.random() * 900000).toString(); //// 6-digit OTP
  let otpExpire = new Date(Date.now() + 10 * 60 * 1000); //// 10 minutes from now
  // 7 - create new obj for new user 
  let newUser = new userModel({
    firstName,
    lastName,
    // userName,
    email,
    password: hashedPass,
    recoveryEmail,
    DOB,
    mobileNumber,
    otpCode,
    otpExpire,
  });
  // 8 - save the created obj
  await newUser.save();
  // 9 - prevent password to send to front end
  newUser.password = undefined;
  // 10 - sending link verification and otp code for the email to be verified
  await sendEmail(email, otpCode);
  // 11 - send suceesfull msg for frontend
  return res.status(201).json({ message: "user added Sucessfully", newUser });
});

/**
 * This function verifies the user's email by decoding the provided token.
 * Method: GET 
 * access: Public
 */
export const verifyEmail = catchAsyncError(async (req, res, next) => {
  let { token } = req.params;
  // 1 -  Verify the JWT token
  jwt.verify(token, process.env.EMAIL_KEY, async (err, payload) => {
    if (err) return next(new AppError(err));
  // 2 - Find the user by email from the token payload
    let user = await userModel.findOne({ email: payload.email });
    if (!user) return next(new AppError("invalid user", 404));
  // 3 - Update the user's verification status
    await userModel.findOneAndUpdate(
      { email: payload.email },
      { isVerified: true, otpCode: null, otpExpire: null },
      { new: true }
    );
  // 4 - Respond with success message
    res.json({ message: "sucess", email: payload.email });
  });
});

/**
 * This function verifies the OTP code provided by the user for email verification.
 * Method: POST 
 * route: http://localhost:5000/auth/verifyOtp
 * access: Public
 */
export const verifyOtp = catchAsyncError(async (req, res, next) => {
  // 1 - destructing the required data
  const { email, otpCode } = req.body;
  // 2 - Find the user by email
  const user = await userModel.findOne({ email });
  // 3 - check if user exist
  if (!user) return next(new AppError("User not found", 404));
  // 4 - check and confirm otp
  if (user.otpCode !== otpCode) return next(new AppError("Invalid OTP", 401));
  // 5 - check the expiration otp
  if (user.otpExpire < new Date())
    return next(new AppError("OTP expired", 400));
  // 6 - Update the user's verification status
  await userModel.findOneAndUpdate(
    { email },
    { isVerified: true, otpCode: null, otpExpire: null },
    { new: true }
  );
  // 7 - send success message
  res.json({ message: "Email verified successfully" });
});
/**
 * function for login through (email - recoveryMail - phone) => then get token 
 * Method: post
 * route: http://localhost:5000\auth\logIn
 * access : public 
 */
export const logIn = catchAsyncError(async (req, res, next) => {
  // 1 - destructing the required data
  let { emailOrRecoveryOrMobile, password } = req.body;
  // 2 - Find the user by email, recovery email, or mobile number to be loged in with them
  const user = await userModel.findOne({
    $or: [
      { email: emailOrRecoveryOrMobile },
      { recoveryEmail: emailOrRecoveryOrMobile },
      { mobileNumber: emailOrRecoveryOrMobile },
    ],
  });
  // 3 - check correction of email or password and matching of them with db
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return next(new AppError("incorrect email or password", 401));
  }
  // 4 - ccheck Mail verification
  if (user.isVerified == false || user.otpCode != null) {
    return next(new AppError("Email Not Verified", 401));
  }
  // 5 - Update user's status to online
  await userModel.findByIdAndUpdate(user._id, { status: "online" });
  // 6 - generate token
  jwt.sign(
    {
      userId: user._id,
      password: user.password,
      email: user.email,
      role: user.role,
    },
    process.env.SECRET_KEY,
    (err, token) => {
    // 7 - Respond with success message and token
      res.json({ message: "Loged in sucessfully..", token });
    }
  );
});

/**
 * function for get all the users in db 
 * Method : Get 
 * route: http://localhost:5000\auth
 * access : private for auth => User must be loggedIn
 */
export const getAllUsers = catchAsyncError(async (req, res) => {
  // 1 - find all users in the database
  const users = await userModel.find();
  // 2 - list all the users
  res.status(200).json({ message: "All users: ", users });
});

/**
 * function for get any user data with id in params => must be loged in (auth)
 * Get profile data for another user 
 * Method : GET
 * route: http://localhost:5000\auth\here is objectId
 * access : private for auth => User must be loggedIn
 */
export const getUserById = catchAsyncError(async (req, res, next) => {
  // 1 -  Extract user ID from the request parameters
  let { id } = req.params;
  // 2 - Find the user by ID
  const user = await userModel.findById(id);
  // 3 - check the user Existance
  if (!user) return next(new AppError("users doesnot exisit", 404));
  // 4 - Remove the password field from the sending to the frontend
  user.password = undefined;
  // 5 - Respond with the user data
  res.status(200).json({ message: "user: ", user });
});

/**
 * function for Get user account data by id from his token
 * only the owner of the account can get his account data
 * Method : GET
 * route: http://localhost:5000\auth\useProfile
 * access : private for auth => User must be loggedIn
 */
export const getUserData = catchAsyncError(async (req, res, next) => {
  // 1 - Extract the authenticated user's ID from the request
  let { userId } = req.user;
  // 2 - Find the user by ID
  const user = await userModel.findById(userId);
  // 3 - check the user Existance
  if (!user) return next(new AppError("users doesnot exisit", 404));
  // 4 - Remove the password field from the sending to the frontend
  user.password = undefined;
  // 5 - Respond with the user data
  res.status(200).json({ message: "user: ", user });
});

/**
 * function for update user account data by id from params
 * make sure when updating there is no conflict with any existing data in your  database
 * Method : put
 * route: http://localhost:5000\auth\here is objectId
 * access : private for auth  => User must be loggedIn
 */
export const updateUser = catchAsyncError(async (req, res, next) => {
  // 1 - destructing the required data
  const { id } = req.params;
  const { firstName, lastName, email, recoveryEmail, DOB, mobileNumber } =
    req.body;
  //  2 - Check if the authenticated user is the same as the user being updated => authorized for updating
  if (id !== req.user.userId)
    return next(
      new AppError("You are not authorized to update this user", 403)
    );
  // 3 - Find the user by ID
  let user = await userModel.findById(id);
  // 5 - check if user exist to update
  if (!user) return next(new AppError("user doesnot exisit", 404));
  // 6 - check if the email not used for another user
  if (email !== user.email) {
    const emailUsed = await userModel.findOne({ email });
    if (emailUsed) return next(new AppError("Email is already in use", 409));
  }
  // 7 - check if the mobileNumber not used for another user
  if (mobileNumber !== user.mobileNumber) {
    const mobileNumberUsed = await userModel.findOne({ mobileNumber });
    if (mobileNumberUsed)
      return next(new AppError("Mobile number is already in use", 409));
  }
  // 8 - Update the user's profile data
  // const userName = firstName + ' ' + lastName;
  let updatedUser = await userModel.findByIdAndUpdate(
    id,
    {
      firstName,
      lastName,
      // userName,
      email,
      recoveryEmail,
      DOB,
      mobileNumber,
    },
    { new: true }
  );
  // 9 - Respond with success message and updated user data
  res.json({ message: "user updated sucessfully..", updatedUser });
});

/**
 * function for delete user account  by id from params
 * delete any related document
 * Method : delete
 * route : http://localhost:5000\auth\here is objectId
 * access : private for auth => User must be loggedIn
 */
export const deleteUser = catchAsyncError(async (req, res, next) => {
  // 1 - destructing the required data
  const { id } = req.params;
  // 2 - Find the user by ID
  let user = await userModel.findById(id);
  if (!user) {
    return next(new AppError("user doesnot exisit", 404));
  }
  // 3 - Check if the authenticated user is the same as the user being deleted
  if (id !== req.user.userId)
    return next(
      new AppError("You are not authorized to delete this user", 403)
    );
  // 4 - Delete any related documents in other collections
  await JobModel.deleteMany({ addedBy: id });
  // 5 - Delete the user
  let deleteduser = await userModel.findByIdAndDelete(id);
  res.json({ message: "user deleted sucessfully..", deleteduser });
});

/**
 * function for Get all accounts associated to a specific recovery Email get mail from body
 * Method : get
 * route: http://localhost:5000\auth\recoveryMail
 * access : private for auth => User must be loggedIn
 */
export const getRecoveryMail = catchAsyncError(async (req, res, next) => {
  // 1 - destructing the required data
  const { recoveryEmail } = req.body;
  // 2 - Find the users that have same recoveryEmails
  const users = await userModel.find({ recoveryEmail });
  // 3 - check if the recoveryEmail does not exisist in db
  if (users.length === 0)
    return next(new AppError("This Recovery Mail doesnot exisit", 404));
  // 4 - prevent password to return to the front
  users.forEach((user) => (user.password = undefined));
  // 4 - Respond with the list of users
  res.status(200).json({ message: "users of this recovery mail..", users });
});

/**
 * function for resending otp for the verified mail
 * Method : post
 * route : http://localhost:5000\auth\forgetPass
 * access : public 
 */
export const forgetPassword = catchAsyncError(async (req, res, next) => {
  // 1 - destructing the required data
  const { email } = req.body;
  // 2 - Find the user by email and check its existance
  const user = await userModel.findOne({ email });
  if (!user) return next(new AppError("User not found", 404));
  // 3 - Generate OTP code and expiration time
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpire = new Date(Date.now() + 10 * 60 * 1000);
  // 4 - Update the user with OTP code and expiration time
  await userModel.findByIdAndUpdate(user._id, {
    otpCode,
    otpExpire,
  });
  // 5 - Send OTP email
  await sendResetPasswordMail(email, `Your OTP code is ${otpCode}`);
  // 6 - Respond with success message
  res.status(200).json({ message: "OTP sent to your email" });
});

/**
 * function for verifing otp after sending to the mail without verification mail link
 * Method : post
 * route : http://localhost:5000\auth\verify
 * access : public 
 */
export const verifyOtpForPasswordReset = catchAsyncError(async (req, res, next) => {
  // 1 - destructing the required data
    const { email, otpCode } = req.body;
  // 2 - Find the user by email and check its existance
    const user = await userModel.findOne({ email });
    if (!user) return next(new AppError("User not found", 404));
  // 3 - Check if the OTP code is still valid
    if (user.otpCode !== otpCode) return next(new AppError("Invalid OTP", 401));
    if (user.otpExpire < new Date())
      return next(new AppError("OTP expired", 400));
  // 4 - Update the user to clear OTP code and expiration time
    await userModel.findByIdAndUpdate(user._id, {
      otpCode: null,
      otpExpire: null,
    });
  // 5 - Update the user to clear OTP code and expiration time
    res.status(200).json({ message: "OTP verified successfully" });
  }
);

/**
 * function for reset the password after verifing otpcode
 * Method : post
 * route : http://localhost:5000\auth\resetPass
 * access : public 
 */
export const resetPassword = catchAsyncError(async (req, res, next) => {
  // 1 - destructing the required data
  const { email, password, Cpassword } = req.body;
  // 2 - Check if the email exists
  const user = await userModel.findOne({ email });
  if (!user) return next(new AppError("user not found", 404));
  // 3 - ccheck Mail verification
  if (user.isVerified == false || user.otpCode !== null) {
    return next(new AppError("Email Not Verified", 401));
  }
  // 4 - destructing the required data
  if (password != Cpassword)
    return next(
      new AppError("password annd confirmed password doesnot Match", 401)
    );
  // 5 - Hash the new password
  const hashedPass = bcrypt.hashSync(password, Number(process.env.SALT_ROUNDS));
  // 6 - Update the user's password
  let updateduser = await userModel.findOneAndUpdate(
    { email },
    {
      password: hashedPass,
    },
    { new: true }
  );
  updateduser.password = undefined
  // 7 -Respond with success message
  res.status(200).json({ message: "password reset sucessfully..", updateduser });
});
