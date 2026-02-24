/// <reference types="vite/client" />

// Type declarations for test environment
declare namespace NodeJS {
  interface ProcessEnv {
    VITE_API_BASE_URL?: string;
    NODE_ENV?: 'development' | 'production' | 'test';
  }
}

// Extend ImportMeta to support import.meta.env in tests
interface ImportMeta {
  env: {
    VITE_API_BASE_URL?: string;
    DEV?: boolean;
    [key: string]: string | boolean | undefined;
  };
}
