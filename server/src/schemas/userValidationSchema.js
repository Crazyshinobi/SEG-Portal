import Joi from 'joi';

const userValidationSchema = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    "string.base": `"name" should be a type of 'text'`,
    "string.empty": `"name" cannot be an empty field`,
    "string.min": `"name" should have a minimum length of {#limit}`,
    "string.max": `"name" should have a maximum length of {#limit}`,
    "any.required": `"name" is a required field`
  }),
  email: Joi.string().email().required().messages({
    "string.base": `"email" should be a type of 'text'`,
    "string.empty": `"email" cannot be an empty field`,
    "string.email": `"email" must be a valid email`,
    "any.required": `"email" is a required field`
  }),
  password: Joi.string().min(8).required().messages({
    "string.base": `"password" should be a type of 'text'`,
    "string.empty": `"password" cannot be an empty field`,
    "string.min": `"password" should have a minimum length of {#limit}`,
    "any.required": `"password" is a required field`
  }),
  role: Joi.string().required().messages({
    "string.base": `"role" should be a type of 'text'`,
    "string.empty": `"role" cannot be an empty field`,
    "any.required": `"role" is a required field`
  }),
});

export default userValidationSchema;
