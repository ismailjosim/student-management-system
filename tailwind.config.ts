import type { Config } from 'tailwindcss';

/**
 * Tailwind v4 Configuration
 *
 * Theme configuration is now in src/app/globals.css using @theme
 * This file only contains content paths for template scanning
 */
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
};

export default config;
