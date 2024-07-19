import { Router } from "express";
import * as applicationController from './application.controllers.js'
import { verifyToken } from "../../middelwares/verifyToken.js";
import { uploadSingleFile } from "../../fileUpload/fileUpload.js";
import { upload } from "../../fileUpload/cloudinary.js";

const applicationRouter = Router();
applicationRouter.use(verifyToken);

// this route when using multer deskstorage
// applicationRouter.post('/addApp',uploadSingleFile('userResume'),applicationController.addApplication)

// this route when using cloudinary
applicationRouter.post('/addApp',upload,applicationController.addApplication)

applicationRouter.get('/job/:jobId',applicationController.getApplicationsForJob)
applicationRouter.route('/:id')
.get()
.put(applicationController.updateApplication)
.delete(applicationController.deletedApplication)


export default applicationRouter;