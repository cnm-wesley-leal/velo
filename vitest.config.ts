import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Reporters: 'default' para saída no terminal; 'json' para gerar arquivo de relatório
    reporters: ["default", "json"],
    outputFile: {
      // Relatório JSON gerado em vitest-report/results.json
      // Publicado como artefato na pipeline pelo GitHub Actions
      json: "vitest-report/results.json",
    },
  },
});
