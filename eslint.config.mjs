import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const downgradeErrorsToWarn = (rules) =>
  Object.fromEntries(
    Object.entries(rules).map(([key, value]) => [
      key,
      value === "error" ? "warn" : value,
    ]),
  );

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    rules: {
      // Downgrade recommended configs
      ...downgradeErrorsToWarn(js.configs.recommended.rules),
      ...downgradeErrorsToWarn(react.configs.recommended.rules),
      ...downgradeErrorsToWarn(react.configs["jsx-runtime"].rules),
      ...downgradeErrorsToWarn(reactHooks.configs.recommended.rules),

      // TypeScript rules
      "@typescript-eslint/ban-ts-comment": [
        "warn",
        {
          "ts-ignore": true,
          "ts-expect-error": true,
          "ts-nocheck": false,
          "ts-check": false,
        },
      ],
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-non-null-assertion": "warn",

      // React rules
      "react/jsx-no-target-blank": "off",
      "react/prop-types": "off",

      // General rules
      "no-console": "warn",
      "no-debugger": "warn",
      "no-unused-vars": "off",
    },
  },

  // Override default ignores of eslint-config-next
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
