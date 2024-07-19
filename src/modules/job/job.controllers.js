import applicationModel from "../../../database/models/application.model.js";
import companyModel from "../../../database/models/company.model.js";
import JobModel from "../../../database/models/job.model.js";
import { AppError, catchAsyncError } from "../../utils/catchError.js";


/**
 * Add a new job.
 * This function allows a Company_HR user to add a new job to the database.
 * method:  POST 
 * route: http://localhost:5000\job\addjob
 * access: Private (Company_HR only)
 */
export const addJob = catchAsyncError(async (req, res, next) => {
  // 1 - destructing the required data
  const {
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
    company,
  } = req.body;
  // 2 - check if the user is authorized as HR to add a job
  if (req.user.role !== "Company_HR")
    return next(new AppError(" you are not authorized", 401));
  // 3 - find the company  by id and check if it exisit
  const existCompany = await companyModel.findById(company);
  if (!existCompany) return next(new AppError("company does not exisit", 404));
  // 4 - adding new job to database
  let newJob = await JobModel.insertMany({
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
    addedBy: req.user.userId,
    company,
  });
  // 5 - send suceesfull msg with job
  res.status(201).json({ message: "Company added Sucessfully", newJob });
});

/**
 * Update an existing job.
 * This function allows a Company_HR user to update job details.
 * method: PUT 
 * route: http://localhost:5000\job\here the objId
 * access: Private (Company_HR only)
 */
export const updateJob = catchAsyncError(async (req, res, next) => {
  // 1 - destructing the required data
  const { id } = req.params;
  const {
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
  } = req.body;
  // 2 - check if the user is authorized as HR to update a job
  if (req.user.role !== "Company_HR")
    return next(new AppError("you are not authorized", 401));
  // 3 - check that the job exists by id
  let job = await JobModel.findById(id);
  if (!job) return next(new AppError("job doesnot exisit", 404));
  // 4 - Update the job details
  let updatedJob = await JobModel.findByIdAndUpdate(
    id,
    {
      jobTitle,
      jobLocation,
      workingTime,
      seniorityLevel,
      jobDescription,
      technicalSkills,
      softSkills,
    },
    { new: true }
  );
  // 5 - Respond with the updated job details
  res.json({ message: "Job updated sucessfully..", updatedJob });
});

/**
 * Delete an existing job.
 * This function allows a Company_HR user to delete a job and any related documents.
 * method: DELETE 
 * route: http://localhost:5000\job\here the objectId
 * access: Private (Company_HR only)
 */
export const deletedJob = catchAsyncError(async (req, res, next) => {
  // 1 - destructing the required data
  const { id } = req.params;
  // 2 - check if the user is authorized as HR to delete a job
  if (req.user.role !== "Company_HR")
    return next(new AppError("you are not authorized", 401));
  // 3 - check that the job exists by id
  let job = await JobModel.findById(id);
  if (!job) return next(new AppError("job doesnot exisit", 404));
  // 4 - delete any related documents in other collections.  
  await applicationModel.deleteMany({ jobId: id });
  // 5 - Delete the job
  let deletedJob = await JobModel.findByIdAndDelete(id);
  // 6 - Respond with the deleted job details
  res.json({ message: "job deleted sucessfully..", deletedJob });
});

/**
 * Get all jobs.
 * This function retrieves all jobs from the database.
 * method: GET
 * route: http://localhost:5000\job\ 
 * access: Private (Company_HR, User, owner)
 */
export const getAllJobs = catchAsyncError(async (req, res, next) => {
  // 1 - check if the user is authorized 
  if (!["Company_HR", "User", "owner"].includes(req.user.role))
    return next(new AppError("You are not authorized", 401));
  // 2 - retrieve all jobs and populate nedeed company details
  const jobs = await JobModel.find().populate({
    path: 'company',
    select: 'companyName description industry address companyEmail -_id'
  });
  // 3 - respond with the list of jobs
  res.status(200).json({ message: "All jobs: ", jobs });
});

/**
 * Get jobs by company name.
 * This function retrieves all jobs for a specific company.
 * method: GET 
 * route: http://localhost:5000\job\jobsCompany\name?companyName=Tec Company
 * access: Private (Company_HR, User, owner)
 */
export const getJobByCompany = catchAsyncError(async (req, res, next) => {
  // 1 - destructing the required data
  const { companyName } = req.query;
  // 2 - check if the user is authorized 
  if (!["Company_HR", "User", "owner"].includes(req.user.role))
    return next(new AppError("You are not authorized", 401));
  if (!companyName) return next(new AppError("Company name is required", 400));
  // 3 -  find by companyName
  let company = await companyModel.findOne({companyName})
  if (!company) return next(new AppError("Company does not exist", 400));
  // 4 - retrieve jobs for the specified company
  const jobs = await JobModel.find({ company: company._id });
  // 5 - retrieve jobs for the specified company
  res.status(200).json({ message: `All jobs for company: ${companyName}`, jobs });
});

/**
 * Get filtered jobs.
 * This function retrieves jobs based on more than filter type.
 * method: GET 
 * route: http://localhost:5000\job\filter?jobTitle=Backend&workingTime=full-time
 * access: Private (Company_HR, User)
 */
export const getFilteredJobs = catchAsyncError(async (req, res, next) => {
    // 1 - check if the user is authorized 
    if (!["Company_HR", "User"].includes(req.user.role)) {
      return next(new AppError("You are not authorized", 401));
    };

    // 2 - distruct filter nedded from query
    const { workingTime, jobLocation, seniorityLevel, jobTitle, technicalSkills } = req.query;
    let filter = {};
    // 3 - Add filters based on query params to the obj to be find with it
    if (workingTime) filter.workingTime = workingTime;
    if (jobLocation) filter.jobLocation = jobLocation;
    if (seniorityLevel) filter.seniorityLevel = seniorityLevel;
    // to match any job title that contains the word in a case-insensitive
    if (jobTitle) filter.jobTitle = { $regex: jobTitle, $options: 'i' }; 
    if (technicalSkills) filter.technicalSkills = { $in: technicalSkills.split(',') };
  
   // 4 - fin jobs based on filters
    const jobs = await JobModel.find(filter);
   // 5 - response with filtered jobs
    res.status(200).json({message: "Filtered jobs", jobs});
});  