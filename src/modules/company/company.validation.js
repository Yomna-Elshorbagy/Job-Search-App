import joi from "joi";

const numOfEmpPattern = /^\d+-\d+$/
const companyEmailpattern =  /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/

export const addCompanyVal = joi.object({
    companyName: joi.string().min(2).max(100).required(),
    description: joi.string().min(10).max(500).required(),
    industry: joi.string().min(2).max(100).required(),
    address: joi.string().min(10).max(200).required(),
    numberOfEmployees: joi.string().pattern(new RegExp(numOfEmpPattern)).required(),
    companyEmail: joi.string().pattern(new RegExp(companyEmailpattern)).required(),
});

export const UpdateCompanyVal = joi.object({
    companyName: joi.string().min(2).max(100),
    description: joi.string().min(10).max(500),
    industry: joi.string().min(2).max(100),
    address: joi.string().min(10).max(200),
    numberOfEmployees: joi.string().pattern(new RegExp(numOfEmpPattern)),
    companyEmail: joi.string().pattern(new RegExp(companyEmailpattern)),
    id: joi.string().hex().length(24).required()
});