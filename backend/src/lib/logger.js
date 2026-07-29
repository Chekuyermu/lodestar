import { AsyncLocalStorage } from 'node:async_hooks';
import pino from 'pino';
import config from '../config.js';

export const requestContext = new AsyncLocalStorage();

const logger = pino({
  level: config.logLevel,
  mixin() {
    const context = requestContext.getStore();

    return context?.requestId
      ? { requestId: context.requestId }
      : {};
  },
  transport:
    config.nodeEnv === 'development'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
});

export default logger;
