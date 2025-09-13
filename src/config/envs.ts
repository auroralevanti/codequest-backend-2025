import 'dotenv/config'
import * as joi from 'joi'

interface EnvConfig {
    PORT : number,
    DB_URL : string,
    JWT_SECRET : string,
}

const envVarsSchema = joi.object({
    PORT: joi.number().required(),
    DB_URL: joi.string().required(),
    JWT_SECRET: joi.string().required(),
}).unknown(true);

const { error, value } = envVarsSchema.validate( process.env ) 

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvConfig = value;

export const envs = {
    port: envVars.PORT,
    dbUrl: envVars.DB_URL,
    jwtSecret: envVars.JWT_SECRET,
}