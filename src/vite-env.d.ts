/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_API_TARGET?: string;
  readonly VITE_FRONTEND_BASE_URL?: string;
  readonly VITE_GIT_VERSION?: string;
  readonly VITE_ALLOWED_HOSTS?: string;
}
