import { createLogger, format, transports, config } from 'winston';

export const LOGGER = createLogger({
    transports: [
        new transports.Console()
    ]
});