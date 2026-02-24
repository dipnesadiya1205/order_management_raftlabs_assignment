export function getEnvVar(key: string, defaultValue: string = ''): string {
  // In Vite/browser, we inject import.meta.env via Vite `define`
  // so we can access it without using `import.meta` syntax or eval.
  if (typeof __APP_ENV__ !== 'undefined' && __APP_ENV__ && typeof __APP_ENV__ === 'object' && key in __APP_ENV__) {
    return String((__APP_ENV__ as any)[key]);
  }

  // In Jest/Node (or other non-Vite environments), try globalThis.process.env
  try {
    const nodeProcess = (globalThis as any).process as { env?: Record<string, string | undefined> } | undefined;
    if (nodeProcess?.env && nodeProcess.env[key]) {
      return nodeProcess.env[key] as string;
    }
  } catch {
    // Ignore if globalThis or process is not available
  }

  return defaultValue;
}

export function isDev(): boolean {
  // In Vite/browser, `DEV` is available on import.meta.env (injected as __APP_ENV__)
  if (typeof __APP_ENV__ !== 'undefined' && __APP_ENV__ && typeof __APP_ENV__ === 'object' && 'DEV' in __APP_ENV__) {
    const dev = (__APP_ENV__ as any).DEV;
    return dev === true || dev === 'true';
  }

  // In Jest/Node, check NODE_ENV via globalThis.process
  try {
    const nodeProcess = (globalThis as any).process as { env?: Record<string, string | undefined> } | undefined;
    if (nodeProcess?.env) {
      const env = nodeProcess.env.NODE_ENV;
      return env === 'development' || env === 'test';
    }
  } catch {
    // Ignore if not available
  }

  return false;
}

declare const __APP_ENV__:
  | {
      [key: string]: unknown;
      DEV?: boolean | string;
    }
  | undefined;
