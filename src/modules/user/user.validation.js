
import joi from "joi";

const passPattern = /^[A-Z][A-Za-z0-9]{5,20}$/;
const emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
const mobileNumberPattern = /^01[01245]\d{8}$/;
const DOBPattern = /^\d{4}-\d{2}-\d{2}$/;

export const signupVal = joi.object({
    firstName: joi.string().min(3).max(50).required(),
    lastName: joi.string().min(3).max(50).required(),
    email: joi.string().email().required(),
    password: joi.string().pattern(new RegExp(passPattern)).required(),
    Cpassword: joi.valid(joi.ref('password')).required(),
    recoveryEmail: joi.string().email().required(),
    mobileNumber: joi.string().pattern(new RegExp(mobileNumberPattern)).required(),
    DOB: joi.string().pattern(new RegExp(DOBPattern)).required()
    // DOB: Joi.date().less("now").required(),
});

export const signinVal = joi.object({
    emailOrRecoveryOrMobile: joi.alternatives().try(
        joi.string().pattern(emailPattern),
        joi.string().pattern(mobileNumberPattern)
      ),
    password: joi.string().pattern(new RegExp(passPattern)).required(),
});

export const updateVal = joi.object({
    firstName: joi.string().min(3).max(50),
    lastName: joi.string().min(3).max(50),
    email: joi.string().email(),
    recoveryEmail: joi.string().email(),
    mobileNumber: joi.string().pattern(new RegExp(mobileNumberPattern)),
    DOB: joi.string().pattern(new RegExp(DOBPattern)),
    id: joi.string().hex().length(24).required()
});

export const resetPassVal = joi.object({
    email: joi.string().email().required(),
    password: joi.string().pattern(new RegExp(passPattern)).required(),
    Cpassword: joi.valid(joi.ref('password')).required(),
});