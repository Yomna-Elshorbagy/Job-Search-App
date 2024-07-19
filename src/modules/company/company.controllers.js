import companyModel from "../../../database/models/company.model.js";
import JobModel from "../../../database/models/job.model.js";
import { AppError, catchAsyncError } from "../../utils/catchError.js";

/**
 * Add a new company.
 * this function allows Company_HR user to add a new company to the database.
 * method: post 
 * route: http://localhost:5000\company\addCompany
 * access: Private (Company_HR only)
 */
export const addCompany = catchAsyncError(async (req, res, next) => {
  // 1 - destructing the required data
  const {
    companyName,
    description,
    industry,
    address,
    numberOfEmployees,
    companyEmail,
  } = req.body;
  // 2 - find the compony by it's unique name
  let company = await companyModel.findOne({ companyName });
  if (company) return next(new AppError("company already exisit", 409));
  // 3 - check if the user is authorized to add the company
  if (req.user.role !== "Company_HR")
    return next(new AppError(" you are not authorized", 401));
  // 4 - create a new company
  let newCompany = await companyModel.insertMany({
    companyName,
    description,
    industry,
    address,
    numberOfEmployees,
    companyEmail,
    companyHR: req.user.userId,
  });
  // 5 - responce with the new created company
  res.status(201).json({ message: "Company added Sucessfully", newCompany });
});

/**
 * Get a specific company by ID.
 * this function retrieves a specific company with its jobs details.
 * method: get
 * route: http://localhost:5000\company\66958d8c3da8c2c7d57cf063 
 * access: Private (Company_HR only)
 */
export const getSpecificCam = catchAsyncError(async (req, res) => {
  // 1 - destructing the required data
  const { id } = req.params;
  // 2 - Check if the user is authorized to view the company
  if (req.user.role !== "Company_HR")
    return next(new AppError(" you are not authorized", 401));
  // 3 - find the compony by id
  const campany = await companyModel.findById(id);
  // 4 - find the jobs releted to this company 
  const jobs = await JobModel.find({ company: id });
  // 5 - responce with the company with related jobs
  res.status(200).json({ message: "Caampany data is: ", campany ,jobs });
});

/**
 * Update an existing company.
 * This function allows a Company_HR user or owner to update company details.
 * method:  put
 * route: http://localhost:5000\company\here the objectId
 * access: Private (Company_HR, owner)
 */
export const updateCompany = catchAsyncError(async (req, res, next) => {
  // 1 - destructing the required data
  const { id } = req.params;
  const {
    companyName,
    description,
    industry,
    address,
    numberOfEmployees,
    companyEmail,
  } = req.body;
  // 2 - check if the user is authorized to update the company
  if (req.user.role !== "Company_HR" && req.user.role !== "owner")
    return next(new AppError("you are not authorized", 401));
  // 3 - find the compony by id
  let company = await companyModel.findById(id);
  if (!company) return next(new AppError("company doesnot exisit", 404));
  // 4 - check if the user is authorized to update this specific company
  if (company.companyHR.toString() !== req.user.userId)
    return next(
      new AppError("You are not authorized to update this company", 401)
    );
  // 5 - Update the company details
  let updatedCompany = await companyModel.findByIdAndUpdate(
    id,
    {
      companyName,
      description,
      industry,
      address,
      numberOfEmployees,
      companyEmail,
    },
    { new: true }
  );
  // 6 - responce wwith updated company
  res.json({ message: "Company updated sucessfully..", updatedCompany });
});

/**
 * Delete an existing company.
 * this function allows a Company_HR user or owner to delete a company 
 * delete any related documents.
 * method: DELETE 
 * route: http://localhost:5000\company\66958d8c3da8c2c7d57cf063
 * access: Private (Company_HR, owner)
 */
export const deletedCompany = catchAsyncError(async (req, res, next) => {
  // 1 - destructing the required data
  const { id } = req.params;
  // 2 - check if the user is authorized to delete the company
  if (req.user.role !== "Company_HR" || req.user.role !== "owner")
    return next(new AppError("you are not authorized", 401));
  // 3 - find the compony by id
  let company = await companyModel.findById(id);
  if (!company) return next(new AppError("Company doesnot exisit", 404));
  // 4 - check if the user is authorized to update this specific company
  if (company.companyHR.toString() !== req.user.userId)
    return next(
      new AppError("You are not authorized to delete this company", 401)
    );
  // 5 - delete any related documents in other collections.
  await JobModel.deleteMany({ company: id });
  // 6 - delet company
  let deletedCompany = await companyModel.findByIdAndDelete(id);
  // 6 - responce with deleted company
  res.json({ message: "Company deleted sucessfully..", deletedCompany });
});
/**
 * Get all companies.
 * This function retrieves all companies from the database.
 * method: get
 * route: http://localhost:5000\company\
 * access: Private (Company_HR only)
 */
export const getAllcompanies = catchAsyncError(async (req, res, next) => {
  // 1 - check if the user is authorized to view
  if (req.user.role !== "Company_HR")
    return next(new AppError(" you are not authorized", 401));
  // 2 - find all companys
  const campanies = await companyModel.find();
  res.status(200).json({ message: "All campanys: ", campanies });
});

/**
 * get a company by name.
 * this function retrieves a specific company by its name.
 * method: get 
 * route: http://localhost:5000\company\filter?companyName=company 2
 * access:  Private (Company_HR, User, owner)
 */
export const getCompanyByName = catchAsyncError(async (req, res, next) => {
  // 1 - distruct and filter data needed
  const { companyName } = req.query;
  const filter = companyName ? { companyName: companyName.toLowerCase() } : {};
  // 2 - check if the user is authorized to view
  if (!["Company_HR", "User", "owner"].includes(req.user.role))
    return next(new AppError("You are not authorized", 401));
  // 3 - find filtered data
  const campany = await companyModel.findOne(filter);
  if (!campany) return next(new AppError("Company does not exisit", 404));
  // 6 - responce with company
  res.status(200).json({ message: "Company: ", campany });
});
