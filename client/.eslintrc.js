module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: ["plugin:vue/base"],
  rules: {
    'vue/multi-word-component-names': 'off',
    'no-unused-vars': 'off'
  },
}