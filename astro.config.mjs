// @ts-check
import {defineConfig} from 'astro/config';

import preact from "@astrojs/preact";
import tailwindcss from "@tailwindcss/vite";
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// https://astro.build/config
export default defineConfig({
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
  vite: {
    plugins: [tailwindcss()],
  },

  site:"https://new.untymen.com",
  integrations: [preact()]
});
