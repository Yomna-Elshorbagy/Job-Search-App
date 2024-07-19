process.on('uncaughtException',(err)=>{
    console.log('ERROR in code: ', err);
});

import express, { json } from 'express';
import { dbConnection } from './database/dbConnection.js';
import cors from "cors";
import { AppError } from './src/utils/catchError.js';
import { globalError } from './src/utils/globalError.js';
import userRouter from './src/modules/user/user.routers.js';
import companyRouter from './src/modules/company/company.routes.js';
import jobRouter from './src/modules/job/job.routes.js';
import applicationRouter from './src/modules/application/application.routes.js';

const app = express();
const port =process.env.PORT || 3000;

app.use(json());
app.use(cors());
dbConnection();
app.use("/uploads" , express.static('uploads'))

app.use('/auth', userRouter)
app.use('/company', companyRouter)
app.use('/job', jobRouter)
app.use('/application', applicationRouter)

app.use('*', (req,res,next)=>{
    next (new AppError (`Route Not Found ${req.originalUrl}`, 404))
});
app.use(globalError);

process.on('unhandledRejection', (err)=>{
    console.log('ERROR: ', err);
});
app.listen(port, () => console.log(`Example app listening on port ${port}!`))