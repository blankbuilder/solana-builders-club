import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

const eslintConfig = [
  {
    ignores: ['.astro/**', '.next/**', 'dist/**', 'out/**', 'node_modules/**', 'next-env.d.ts'],
  },
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      '@next/next/no-img-element': 'off',
    },
  },
]

export default eslintConfig
