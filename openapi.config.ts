import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "https://paywise-api.dipper.ir/open.json",
  output: "./src/lib/api",
});
