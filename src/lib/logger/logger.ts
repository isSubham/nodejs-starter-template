import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { env, isDev } from '../../config/env';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// ─── Custom dev format ────────────────────────────────────────────────────────

const devFormat = printf(({ level, message, timestamp: ts, requestId, stack, ...meta }) => {
  const reqId = requestId ? ` [${String(requestId)}]` : '';
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  const stackStr = stack ? `\n${String(stack)}` : '';
  return `${String(ts)} [${level}]${reqId}: ${String(message)}${metaStr}${stackStr}`;
});

// ─── Transports ───────────────────────────────────────────────────────────────

// ─── Transports ───────────────────────────────────────────────────────────────

const transports: winston.transport[] = [
  new DailyRotateFile({
    level: 'error',
    filename: `${env.LOG_DIR}/error/error-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    zippedArchive: true,
  }),
  new DailyRotateFile({
    level: 'info',
    filename: `${env.LOG_DIR}/combined/combined-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    zippedArchive: true,
  }),
];

if (isDev) {
  transports.push(
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'HH:mm:ss' }),
        errors({ stack: true }),
        devFormat,
      ),
    }),
  );
}

// ─── Logger ───────────────────────────────────────────────────────────────────

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: combine(timestamp(), errors({ stack: true }), json()),
  transports,
  exitOnError: false,
  silent: env.NODE_ENV === 'test',
});

// ─── Request Logger (HTTP) ────────────────────────────────────────────────────

export const httpLogger = winston.createLogger({
  level: 'http',
  format: combine(timestamp(), json()),
  transports: [
    new DailyRotateFile({
      level: 'http',
      filename: `${env.LOG_DIR}/http/http-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true,
    }),
    ...(isDev
      ? [
          new winston.transports.Console({
            format: combine(colorize({ all: true }), timestamp({ format: 'HH:mm:ss' }), devFormat),
          }),
        ]
      : []),
  ],
  silent: env.NODE_ENV === 'test',
});
