/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __APP_ENV__: ImportMetaEnv & {
  readonly DEV?: boolean;
  readonly [key: string]: string | boolean | undefined;
};
