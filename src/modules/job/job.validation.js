import joi from "joi";

export const addJobVal = joi.object({
    jobTitle: joi.string().min(2).max(100).required(),
    jobLocation: joi.string().required(),
    workingTime: joi.string().required(),
    seniorityLevel: joi.string().required(),
    jobDescription: joi.string().required(),
    technicalSkills: joi.array().required(),
    softSkills: joi.array().required(),
    company : joi.string().hex().length(24).required()
});

export const updateJobVal = joi.object({
    jobTitle: joi.string().min(2).max(100),
    jobLocation: joi.string(),
    workingTime: joi.string(),
    seniorityLevel: joi.string(),
    jobDescription: joi.string(),
    technicalSkills: joi.array(),
    softSkills: joi.array().required(),
    addedBy : joi.string().hex().length(24),
    company : joi.string().hex().length(24),
    id: joi.string().hex().length(24).required()
});
