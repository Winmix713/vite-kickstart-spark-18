import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Liga Soccer CRA aliases
      "@components": path.resolve(__dirname, "./_imports/liga-soccer-cra/src/components"),
      "@ui": path.resolve(__dirname, "./_imports/liga-soccer-cra/src/ui"),
      "@pages": path.resolve(__dirname, "./_imports/liga-soccer-cra/src/pages"),
      "@assets": path.resolve(__dirname, "./_imports/liga-soccer-cra/src/assets"),
      "@styles": path.resolve(__dirname, "./_imports/liga-soccer-cra/src/styles"),
      "@db": path.resolve(__dirname, "./_imports/liga-soccer-cra/src/db"),
      "@hooks": path.resolve(__dirname, "./_imports/liga-soccer-cra/src/hooks"),
      "@layout": path.resolve(__dirname, "./_imports/liga-soccer-cra/src/layout"),
      "@fonts": path.resolve(__dirname, "./_imports/liga-soccer-cra/src/fonts"),
      "@utils": path.resolve(__dirname, "./_imports/liga-soccer-cra/src/utils"),
      "@widgets": path.resolve(__dirname, "./_imports/liga-soccer-cra/src/widgets"),
      "@contexts": path.resolve(__dirname, "./_imports/liga-soccer-cra/src/contexts"),
      "@constants": path.resolve(__dirname, "./_imports/liga-soccer-cra/src/constants"),
      "@features": path.resolve(__dirname, "./_imports/liga-soccer-cra/src/features"),
    },
  },
}));
