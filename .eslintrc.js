module.exports = {
    env: {
        es2021: true,
        node: true,
    },
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
    overrides: [
        {
            env: {
                node: true,
            },
            files: [".eslintrc.{js,cjs}"],
            parserOptions: {
                sourceType: "script",
            },
        },
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
    },
    plugins: ["@typescript-eslint", "pretty-imports"],
    rules: {
        "pretty-imports/sorted": "warn",
        "@typescript-eslint/no-unused-vars": "warn",
        indent: ["error", 4],
        "linebreak-style": ["error", "unix"],
        quotes: ["error", "double", "avoid-escape"],
        semi: ["error", "always"],
    },
};
