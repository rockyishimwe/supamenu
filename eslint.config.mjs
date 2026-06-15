import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";

export default [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "out/**",
    ],
  },

  js.configs.recommended,

  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/prop-types": "off",
    },
  },

  {
    files: [
      "**/next.config.js",
      "**/postcss.config.js",
      "**/tailwind.config.js",
    ],
    languageOptions: {
      globals: globals.node,
    },
  },

  pluginReact.configs.flat.recommended,
];