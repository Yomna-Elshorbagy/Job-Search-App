import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

export const dbConnection = () => {
  mongoose
    .connect(process.env.mongoose_URI)
    .then(() => {
      console.log("Db connected succesfully..");
    })
    .catch((err) => {
      console.log("Error connecting", err);
    });
};
