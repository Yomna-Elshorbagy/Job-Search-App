import { Router } from "express";
import { verifyToken } from "../../middelwares/verifyToken.js";
import * as companyController from "./company.controllers.js";
import { validate } from "../../middelwares/validate.js";
import { addCompanyVal, UpdateCompanyVal } from "./company.validation.js";

const companyRouter = Router();
companyRouter.use(verifyToken);

companyRouter.post('/addCompany',validate(addCompanyVal), companyController.addCompany)
companyRouter.get('/', companyController.getAllcompanies)
companyRouter.get('/filter', companyController.getCompanyByName)

companyRouter.route('/:id')
.get(companyController.getSpecificCam)
.put(validate(UpdateCompanyVal),companyController.updateCompany)
.delete(companyController.deletedCompany)

export default companyRouter;