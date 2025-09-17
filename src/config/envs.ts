import 'dotenv/config'
import * as joi from 'joi'

interface EnvConfig {
    PORT : number,
    DB_URL : string,
    JWT_SECRET : string,
    DISCORD_CLIENT_ID?: string,
    DISCORD_CLIENT_SECRET?: string,
    DISCORD_CALLBACK_URL?: string,
    FRONTEND_URL?: string,
}

const envVarsSchema = joi.object({
    PORT: joi.number().required(),
    DB_URL: joi.string().required(),
    JWT_SECRET: joi.string().required(),
    DISCORD_CLIENT_ID: joi.string().optional(),
    DISCORD_CLIENT_SECRET: joi.string().optional(),
    DISCORD_CALLBACK_URL: joi.string().optional(),
    FRONTEND_URL: joi.string().optional(),
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
    discordClientId: envVars.DISCORD_CLIENT_ID,
    discordClientSecret: envVars.DISCORD_CLIENT_SECRET,
    discordCallbackUrl: envVars.DISCORD_CALLBACK_URL,
    frontendUrl: envVars.FRONTEND_URL,
}