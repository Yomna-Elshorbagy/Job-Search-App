import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { v4 as uuidv4 } from "uuid";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { AppError } from "../utils/catchError.js";

//configration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

//filter
function fileFilter(req, file, cb) {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new AppError("PDF files only", 400), false);
  }
}

//store
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    format: async (req, file) => {
      if (file.mimetype !== "application/pdf") {
        throw new AppError("Invalid file format", 409);
      }
      return "pdf"; 
    },
    public_id: (req, file) => file.originalname.split('.')[0] + "-" + uuidv4(),
    resource_type: "raw" 
  },
});

export const upload = multer({
  storage: storage,
  fileFilter,
  limits: {
    fieldSize: 10 * 1024 * 1024, 
  },
}).single("userResume");
