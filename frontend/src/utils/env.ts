// Environment variable helper that works in both Vite and Jest

// Declare process for TypeScript (available in Node/Jest)
declare const process: {
  env: Record<string, string | undefined>;
} | undefined;

export function getEnvVar(key: string, defaultValue: string = ''): string {
  // In Jest/Node, use process.env (checked first to avoid import.meta parse errors)
  if (typeof process !== 'undefined' && process?.env && process.env[key]) {
    return process.env[key];
  }
  
  // In Vite/browser, import.meta.env is available
  // We use a try-catch with a function that accesses it dynamically
  // This prevents Jest from parsing import.meta as syntax
  try {
    // Use Function constructor to create a function that accesses import.meta
    // Jest won't parse this as import.meta syntax since it's in a string
    const getImportMeta = new Function('try { return import.meta.env; } catch { return null; }');
    const viteEnv = getImportMeta();
    if (viteEnv && typeof viteEnv === 'object' && key in viteEnv) {
      return String(viteEnv[key]);
    }
  } catch {
    // Jest will catch here - import.meta doesn't exist
  }
  
  return defaultValue;
}

export function isDev(): boolean {
  // In Jest/Node, check NODE_ENV
  if (typeof process !== 'undefined' && process?.env) {
    return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
  }
  
  // In Vite, check import.meta.env.DEV
  try {
    const getImportMeta = new Function('try { return import.meta.env; } catch { return null; }');
    const viteEnv = getImportMeta();
    if (viteEnv && typeof viteEnv === 'object' && 'DEV' in viteEnv) {
      return viteEnv.DEV === true || viteEnv.DEV === 'true';
    }
  } catch {
    // Jest will catch here
  }
  
  return false;
}
