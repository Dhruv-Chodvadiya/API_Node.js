const joi = require("joi");

const verifyUserSchema = joi.object({
    name: joi.string().alphanum().min(3).max(30).required(),
    email: joi.string()
        .email({ minDomainSegments: 1, tlds: { allow: ['com'] } })
        .pattern(/^[^A-Z*/+\-]+@[^A-Z*/+\-]+\.[^A-Z*/+\-]+$/)
        .required(),
    password: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    role: joi.string().required(),
});

const verifyRoleSchema = joi.object({
    roleName: joi.string().pattern(new RegExp('^[a-zA-Z]')).required(),
    permissions: joi.array().items(joi.string()).required().min(1).messages({
        'any.required': 'Permissions are required',
        'array.min': 'At least one permission is required'
    })
});

const verifyBulkRoleSchema = joi.array().items(verifyRoleSchema);

const verifyUpdateUser = joi.object({
    name: joi.string(),
    email: joi.string().email({ tlds: { allow: ['com', 'in'] } }).pattern(/^[^A-Z*/+\-]+@[^A-Z*/+\-]+\.[^A-Z*/+\-]+$/),
    password: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    role: joi.string().alphanum()
});

const verifyTaskschema = joi.object({
    taskName: joi.string().required(),
    description: joi.string().required(),
    //taskStatus: joi.string().valid('In Progress', 'Completed').default('Pending'),
    //requireTime: joi.string().optional(),
    //taskDate: joi.date().default(Date.now()),
    assignedTo: joi.string().required().regex(/^[0-9a-fA-F]{24}$/)
    //assignedBy: joi.string().required() .regex(/^[0-9a-fA-F]{24}$/)
});

module.exports = { verifyUserSchema, verifyRoleSchema, verifyBulkRoleSchema, verifyUpdateUser, verifyTaskschema};