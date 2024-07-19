import applicationModel from "../../../database/models/application.model.js";
import JobModel from "../../../database/models/job.model.js";
import userModel from "../../../database/models/user.model.js";
import { AppError, catchAsyncError } from "../../utils/catchError.js";

/**
 * adding a new application.
 * this function allows a user to apply for a job by submitting an application.
 * method: post
 * route: http://localhost:5000\application\addApp\ 
 * access: Private (User only)
 */
export const addApplication = catchAsyncError(async (req, res, next) => {
  // 1 - distruct and filter data needed
  const { jobId, userId, userTechSkills, userSoftSkills, userResume } =
    req.body;
  // 2 - make sure that the job exists
  const job = await JobModel.findById(jobId);
  if (!job) return next(new AppError("job does not exisit", 404));
  // 3 - check if the user is authorized to apply for the job
  if (req.user.role !== 'User' ) {
    return next(new AppError("You can not applay to this application", 409));
  }
  //if i want to take userid from body:
  // const user = await userModel.findById(userId);
  // if (!user) return next(new AppError("user does not exisit", 404));

  // 4 - create a new application
  let newApplication = await applicationModel.insertMany({
    jobId,
    userId: req.user.userId,
    userTechSkills,
    userSoftSkills,
    // userResume:  req.file.filename, //for multer diskStorage
    userResume:  req.file.path, //for cloudinary
  });

  // 5 - responce with the newly created application
  res
    .status(201)
    .json({ message: "application added Sucessfully", newApplication });
});

/**
 * Update an existing application.
 * This function allows a user to update their application details.
 * method: PUT 
 * route: http://localhost:5000\application\6696558b85dd362aa4d14ffe
 * access: Private (User only)
 */
export const updateApplication = catchAsyncError(async (req, res, next) => {
  // 1 - distruct and filter data needed
  const { id } = req.params;
  const { jobId, userId, userTechSkills, userSoftSkills, userResume } =
    req.body;

  // 2 - make sure that the job exists
  const application = await applicationModel.findById(id);
  if (!application)
    return next(new AppError("application doesnot exisit", 404));

  // 3 - make sure that the job exists
  const job = await JobModel.findById(jobId);
  if (!job) return next(new AppError("job does not exisit", 404));

  // 5 - check if the user is authorized to update the application
  const user = await userModel.findById(req.user.userId);
  if (application.userId.toString() !== req.user.userId.toString()) 
    return next(new AppError("you are not allowed to edit", 404));
  // 5 - Update the application details
  let updatedApp = await applicationModel.findByIdAndUpdate(
    id,
    {
      jobId,
      userTechSkills,
      userSoftSkills,
      userResume,
    },
    { new: true }
  );
  res
    .status(200)
    .json({ message: "application updated sucessfully..", updatedApp });
});

/**
 * Delete an existing application.
 * This function allows a user to delete their application.
 * method: delete 
 * route: http://localhost:5000\application\669655002db16f5cb89e0729
 * access: Private (User only)
 */
export const deletedApplication = catchAsyncError(async (req, res, next) => {
  // 1 - distruct and filter data needed
  const { id } = req.params;
  // 2 - make sure that the application exists
  const application = await applicationModel.findById(id);
  if (!application)
    return next(new AppError("application doesnot exisit", 404));
  // 3 - Delete the application
  let deletedApp = await applicationModel.findByIdAndDelete(id);
  res
    .status(200)
    .json({ message: "application deleted sucessfully..", deletedApp });
});

/**
 * Get all applications for a specific job.
 * This function retrieves all applications for a specified job.
 * method: get
 * route: http://localhost:5000\application\job\66961d59972b2cab240aaddf
 * access: Private (Company_HR only)
 */
export const getApplicationsForJob = catchAsyncError(async (req, res, next) => {
  const { jobId } = req.params;
  //1. Verify that the job exists
  const job = await JobModel.findById(jobId).populate('company');
  if (!job) return next(new AppError("Job does not exist", 404));
  //2. Verify that the logged-in user is a Company_HR
  if (req.user.role !== 'Company_HR' ) {
    return next(new AppError("You are not authorized to view applications for this job", 401));
  }
  //3. Retrieve all applications for the specified job and populate user data needed
  const applications = await applicationModel.find({ jobId }).populate({
    path: 'userId',
    select: 'firstName lastName email mobileNumber -_id'
  });
  // response with the applications
  res.status(200).json({ message: "Applications retrieved successfully", applications });
});
