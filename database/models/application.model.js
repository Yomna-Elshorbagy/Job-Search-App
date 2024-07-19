import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userTechSkills: {
      type: [String],
      required: true,
    },
    userSoftSkills: {
      type: [String],
      required: true,
    },
    userResume: {
      type: String,
      required: true,
      validate: {
        validator: /.*\.pdf$/,
        message: (props) => `${props.value} is not a valid PDF file!`,
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const applicationModel = mongoose.model('Application', applicationSchema);

export default applicationModel;