import { createLogger, transports, format } from 'winston';

const { combine, timestamp, printf } = format;

const logFormat = printf(({ level, message, label, timestamp }) => {
    return `${ timestamp } [${ label }] ${ level }: ${ message }`;
});

export const LOGGER = createLogger({
    format: combine(
        timestamp(),
        logFormat
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'combined.log' }),
        new transports.File({
            level: 'info',
            filename: 'info.log',
            format: format.json()
        }),
        new transports.File({
            level: 'warn',
            filename: 'warn.log',
            format: format.json()
        }),
        new transports.File({
            level: 'error',
            filename: 'error.log',
            format: format.json()
        })
    ]
});