type Context = Record<string, unknown>;

function safe(context: Context = {}) {
  const blocked = /password|token|secret|authorization|cookie/i;
  return Object.fromEntries(Object.entries(context).filter(([key]) => !blocked.test(key)));
}

export const logger = {
  info(message: string, context?: Context) { console.info(`[ENKAYS] ${message}`, safe(context)); },
  warn(message: string, context?: Context) { console.warn(`[ENKAYS] ${message}`, safe(context)); },
  error(message: string, context?: Context) { console.error(`[ENKAYS] ${message}`, safe(context)); },
};
