import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: [
    '.corepack',
    'dist',
    'node_modules',
  ],
  rules: {
    'antfu/no-top-level-await': 'off',
    'no-console': 'off',
  },
})
