import mongoose from "mongoose";

let userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, "First name must be at least 3 characters long"],
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, "last name must be at least 3 characters long"],
      maxlength: [50, "last name cannot exceed 50 characters"],
    },
    userName: {
      type: String, 
      // required: true       
  },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match :/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
    },
    password: {
      type: String,
      required: true,
    },
    recoveryEmail: {
      type: String,
      match :/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
    },
    DOB: {
      type: String,
      required: true,
      match:/^\d{4}-\d{2}-\d{2}$/
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: /^01[01245]\d{8}$/,
        message: (props) => `${props.value} is not a valid mobile number!`,
      },
    },
    role: {
      type: String,
      enum: ["User", "Company_HR", "owner"],
      default: "User",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    },
    otpCode: String, //Math.floor(100000 + Math.random() * 900000)
    otpExpire: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.pre('save', function (next) {
    this.userName = `${this.firstName} ${this.lastName}`;
  next();
});

userSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.firstName || update.lastName) {
    this.model.findOne(this.getQuery())
      .then(user => {
        update.userName = `${update.firstName || user.firstName} ${update.lastName || user.lastName}`;
        next();
      })
      .catch(err => next(err));
  } else {
    next();
  }
});

const userModel = mongoose.model("User", userSchema);
export default userModel;
