import { Router } from "express";
import { verifyToken } from "../../middelwares/verifyToken.js";
import * as jobController from "./job.controllers.js";
import { validate } from "../../middelwares/validate.js";
import { addJobVal, updateJobVal } from "./job.validation.js";

const jobRouter = Router();
jobRouter.use(verifyToken);

jobRouter.post('/addjob',validate(addJobVal) ,jobController.addJob )
jobRouter.get('/',jobController.getAllJobs)
jobRouter.get('/',jobController.getAllJobs)
jobRouter.get('/jobsCompany/name',jobController.getJobByCompany)
jobRouter.get('/filter',jobController.getFilteredJobs)

jobRouter.route('/:id')
.get()
.put(validate(updateJobVal), jobController.updateJob)
.delete(jobController.deletedJob)

export default jobRouter;