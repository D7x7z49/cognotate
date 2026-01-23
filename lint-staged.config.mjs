// lint-staged.config.mjs

/**
 * @filename: lint-staged.config.mjs
 * @type {import('lint-staged').Configuration}
 */
export default {
  "*.{js,mjs,cjs,jsx,ts,tsx}": ["prettier --write"],
  "*.{html,css,scss,sass,less,md,json,jsonc,yml,yaml}": ["prettier --write"],
};
