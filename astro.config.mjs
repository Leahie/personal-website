// @ts-check
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';

import icon from 'astro-icon';
import mdx from '@astrojs/mdx';

import react from '@astrojs/react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  vite: {
      resolve: {
          alias: {
              '@': path.resolve(__dirname, 'src'),
          },
      },
    },

  integrations: [icon(), mdx(), react()],
});