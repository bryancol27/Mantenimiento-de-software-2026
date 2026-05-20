import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';

export default [
    {
        ignores: ['node_modules/**', 'coverage/**', 'tests/**.test.js'],
    },
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.node,
                ...globals.jest,
            },
        },
        plugins: {
            import: importPlugin,
        },
        rules: {
            indent: ['error', 4, { SwitchCase: 1 }],
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            quotes: ['error', 'single'],
            semi: ['error', 'always'],
            eqeqeq: 'error',
            'no-console': 'off',
        },
    },
    eslintConfigPrettier,
];
