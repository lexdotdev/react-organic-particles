import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { defineConfig } from "vitest/config";

// ESM config has no __dirname; URL keeps this Node-version agnostic.
const entry = new URL("./src/index.ts", import.meta.url).pathname;

const EXTERNAL_PACKAGES = [
  "react",
  "react-dom",
  "react/jsx-runtime",
  "three",
  "@react-three/fiber",
  "@react-three/drei",
  "@react-three/postprocessing",
];

// Prefix match keeps subpaths external, e.g. three/examples/jsm/*.
const external = (id: string) =>
  EXTERNAL_PACKAGES.some((pkg) => id === pkg || id.startsWith(`${pkg}/`));

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ["src"],
      exclude: ["src/**/*.test.ts", "src/**/*.test.tsx"],
      rollupTypes: true,
    }),
  ],
  resolve: {
    alias: {
      "@lexdotdev/react-organic-particles": entry,
    },
  },
  build: {
    lib: {
      entry,
      formats: ["es", "cjs"],
      fileName: "index",
    },
    rollupOptions: {
      external,
    },
  },
  test: {
    environment: "jsdom",
    globals: false,
    css: false,
  },
});
