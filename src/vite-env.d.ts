/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_CAREERNEXT_GRAPHQL_URL: string;
  readonly VITE_CAREERNEXT_WEB_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
