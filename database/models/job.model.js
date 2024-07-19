import mongoose from "mongoose";

let jobSchema = new mongoose.Schema(
  {
    jobTitle: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "jobtitle must be at least 2 characters long"],
      maxlength: [100, "jobtitle cannot exceed 100 characters"],
    },
    jobLocation: {
      type: String,
      enum: ["onsite", "remotely", "hybrid"],
      required: true,
    },
    workingTime: {
      type: String,
      enum: ["part-time", "full-time"],
      required: true,
    },
    seniorityLevel: {
      type: String,
      enum: ["Junior", "Mid-Level", "Senior", "Team-Lead", "CTO"],
      required: true,
    },
    jobDescription: {
      type: String,
      required: true,
    },
    technicalSkills: {
      type: [String],
      required: true,
    },
    softSkills: {
      type: [String],
      required: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const JobModel = mongoose.model("Job", jobSchema);

export default JobModel;
