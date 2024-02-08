import express from 'express';
import winston, { format } from 'winston';
import videoRoutes from './src/routes/video.route';
require("dotenv").config();

const app = express();

//Logger
const logFileLocation = `src/logs/${process.env.NODE_ENV}.log`;
const { timestamp, printf } = format;
const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: format.combine(format.splat(), format.json(), timestamp(), myFormat),
  transports: [new winston.transports.File({
    filename: logFileLocation, maxsize: 104857600, maxFiles:2})]//100MB
});

app.use('/videos', videoRoutes);

export { app, logger };