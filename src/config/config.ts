import { ConfigModuleOptions } from '@nestjs/config';
import * as Joi from 'joi';

export enum ServerEnv {
  Development = 'development',
  Production = 'production',
}

export interface ConfigAttributes {
  port: number;
  database: {
    uri: string;
  };
  serverEnv: ServerEnv;
  appClient: {
    url: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  email: {
    host: string;
    port: number;
    secure: boolean;
    tls: {
      rejectUnauthorized: boolean;
    };
    user: string;
    password: string;
    from: string;
  };
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
}

const configuration = (): ConfigAttributes => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ewaiter',
  },
  serverEnv: (process.env.NODE_ENV as ServerEnv) || ServerEnv.Development,
  appClient: {
    url: process.env.APP_CLIENT_URL || 'http://localhost:5173',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRATION || '7d',
  },
  email: {
    host: process.env.EMAIL_HOST || '',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: false,
    tls: {
      rejectUnauthorized: false,
    },
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'E-Waiter <noreply@ewaiter.com>',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
});

const configSchema = Joi.object<Record<string, string>>({
  PORT: Joi.number().default(3000),
  MONGODB_URI: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION: Joi.string().default('7d'),
  NODE_ENV: Joi.string()
    .valid('development', 'production')
    .default('development'),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: Joi.string().optional(),
  CLOUDINARY_API_KEY: Joi.string().optional(),
  CLOUDINARY_API_SECRET: Joi.string().optional(),

  // App
  APP_CLIENT_URL: Joi.string().default('http://localhost:5173'),
});

export const configOpts: ConfigModuleOptions = {
  isGlobal: true,
  envFilePath: '.env',
  load: [configuration],
  validationSchema: configSchema,
  validationOptions: {
    allowUnknown: true,
    abortEarly: false,
  },
};
