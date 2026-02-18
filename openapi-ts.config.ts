import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "https://paywise-api.dipper.ir/open.json",
  output: "./src/lib/api",
  plugins: [
    "@hey-api/typescript",
    "@hey-api/sdk",
    "@hey-api/client-axios",
    "@tanstack/react-query",
  ],
});
