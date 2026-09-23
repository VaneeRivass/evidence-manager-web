import js from '@eslint/js'
import ts from 'typescript-eslint'
import next from '@next/eslint-plugin-next'
import prettier from 'eslint-config-prettier'

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    plugins: { '@next/next': next },
    rules: {
      ...next.configs.recommended.rules,
      ...next.configs['core-web-vitals'].rules,

      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  // components/ui/ is shadcn's code, copied in. Fighting its style is noise.
  { ignores: ['.next/', 'node_modules/', 'components/ui/'] },

  prettier,
)
