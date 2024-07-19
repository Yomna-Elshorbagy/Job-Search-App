import { Router } from "express";
import * as userController from './user.controllers.js'
import { validate } from "../../middelwares/validate.js";
import { resetPassVal, signinVal, signupVal, updateVal } from "./user.validation.js";
import { verifyToken } from "../../middelwares/verifyToken.js";
const userRouter = Router();

userRouter.post('/signUp',validate(signupVal),userController.signUp);
userRouter.post('/verifyOtp',userController.verifyOtp );
userRouter.get('/verify/:token',userController.verifyEmail );
userRouter.post('/logIn',validate(signinVal),userController.logIn);

//reset Password:
userRouter.post('/forgetPass',userController.forgetPassword);
userRouter.post('/verify',userController.verifyOtpForPasswordReset);
userRouter.put("/resetPass", validate(resetPassVal), userController.resetPassword);

//auth:
userRouter.use(verifyToken);

userRouter.get('/',userController.getAllUsers);
userRouter.get('/useProfile',userController.getUserData);
userRouter.get('/recoveryMail',userController.getRecoveryMail);

userRouter.route('/:id')
.get(userController.getUserById)
.put(validate(updateVal),userController.updateUser)
.delete(userController.deleteUser);


export default userRouter;