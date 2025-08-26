/** @type {import("prettier").Config} */
module.exports = {
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "es5",
  printWidth: 80, // 👈 narrower width, forces wrapping
  arrowParens: "always",
  jsxSingleQuote: false, // JSX uses double quotes (more standard)
  bracketSameLine: false, // 👈 ensures closing `>` of tags goes to new line
};
