/*
  Note:
  There is a new "flat" config option for eslint, that is more efficient to
  resolve and will be the default in the next eslint major release.

  As of 2023-12-06, @typescript-eslint (and potentially eslint-plugin-unicorn)
  don't support the new config format, but once that changes we should try out
  the new config.
*/

/** @type {import('eslint').Linter.Config} */
module.exports = {
  env: {
    node: true,
    es2024: true,
    jest: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  plugins: ["unicorn"],
  rules: {
    camelcase: [
      "error",
      {
        properties: "never",
        ignoreDestructuring: true,
      },
    ],
    "@typescript-eslint/no-explicit-any": "error",
    "default-case": "error",
    // enforce kebab case file names
    "unicorn/filename-case": "error",
  },
};
