import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      unique: true,
      minlength: [2, "Company name must be at least 2 characters long"],
      maxlength: [100, "Company name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: true,
      minlength: [10, "Description must be at least 10 characters long"],
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    industry: {
      type: String,
      required: true,
      minlength: [2, "Industry must be at least 2 characters long"],
      maxlength: [100, "Industry cannot exceed 100 characters"],
    },
    address: {
      type: String,
      required: true,
      minlength: [10, "Address must be at least 10 characters long"],
      maxlength: [200, "Address cannot exceed 200 characters"],
    },
    numberOfEmployees: {
      type: String,
      required: true,
      validate: {
        validator: /^\d+-\d+$/,
        message: (props) =>
          `${props.value} is not a valid number of employees range`,
      },
    },
    companyEmail: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        message: (props) =>
          `${props.value} is not a valid company email address!`,
      },
    },
    companyHR: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const companyModel = mongoose.model("Company", companySchema);

export default companyModel;
