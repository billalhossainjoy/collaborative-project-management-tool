import Joi from 'joi';

export const envValidation = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('production'),
  PORT: Joi.number().default(3000),
  HOST: Joi.string().default('localhost'),

  POSTGRES_PRISMA: Joi.string().required(),
  MONGO_URI: Joi.string().required(),

  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string(),
  DB_PASSWORD: Joi.string(),
  DB_NAME: Joi.string(),

  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string(),
  JWT_ISSUER: Joi.string().default('myapp.com'),
  JWT_AUDIENCE: Joi.string().default('myapp.com'),

  REDIS_HOST: Joi.string(),
  REDIS_PORT: Joi.number(),
});
