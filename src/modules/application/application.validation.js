import joi from "joi";

export const addAppVal = joi.object({
    jobId : joi.string().hex().length(24).required(),
    userTechSkills: joi.array().items(joi.string()).required(),
    userSoftSkills: joi.array().items(joi.string()).required(),
});