import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import { AppError } from "../utils/catchError.js";

export const fileUpload = (fieldName) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
      cb(null, uuidv4() + "_" + file.originalname);
    },
  });
  //if image
  // function fileFilter(req, file, cb) {
  //   if (file.mimetype.startsWith("image")) {
  //     cb(null, true);
  //   } else {
  //     cb(new AppError("image only"), false);
  //   }
  // }
  function fileFilter(req, file, cb) {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new AppError("PDF files only", 400), false);
    }
  }
  const upload = multer({
    storage: storage,
    fileFilter,
    limits: {
      fieldSize: 1 * 1024 * 1024, 
    },
  });
  return upload;
};

export const uploadSingleFile = (fieldName) => {
  return fileUpload().single(fieldName);
};

export const uploadMixFile = (fieldName, maxCount) => {
  return fileUpload().array(fieldName, maxCount);
};

export const uploadMixFiles = (arrayOfFields) => {
  return fileUpload().fields(arrayOfFields);
};
