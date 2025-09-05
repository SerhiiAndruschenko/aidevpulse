declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      GEMINI_API_KEY: string;
      IMAGE_API_KEY?: string;
      IMAGE_API_URL?: string;
      SITE_URL?: string;
      SITE_NAME?: string;
      SITE_DESCRIPTION?: string;
      ADMIN_EMAIL?: string;
      CRON_SECRET?: string;
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}

export {};
