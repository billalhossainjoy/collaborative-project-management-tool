import Joi from 'joi';

export const envValidation = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('production'),
  PORT: Joi.number().default(3000),
  HOST: Joi.string().default('localhost'),

  DATABASE_URL: Joi.string().required(),

  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string(),
  JWT_ISSUER: Joi.string().default('myapp.com'),
  JWT_AUDIENCE: Joi.string().default('myapp.com'),

  REDIS_HOST: Joi.string(),
  REDIS_PORT: Joi.number(),
  REDIS_PASSWORD: Joi.number(),
});
