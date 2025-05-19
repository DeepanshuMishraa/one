export default {
  "*.{js,jsx,ts,tsx}": [
    "prettier --write",
    "eslint --fix --max-warnings=0"
  ],
  "*.{json,css,md}": ["prettier --write"]
};
