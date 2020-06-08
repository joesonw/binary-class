require('@rushstack/eslint-config/patch-eslint6');

module.exports = {
    extends: [
        '@rushstack/eslint-config',
    ],
    parserOptions: { tsconfigRootDir: __dirname },
    rules: {
        '@typescript-eslint/typedef':  [
            'error',
            {
                arrayDestructuring: false,
                arrowParameter: true,
                memberVariableDeclaration: true,
                objectDestructuring: false,
                parameter: true,
                propertyDeclaration: true,
                variableDeclaration: false,
                variableDeclarationIgnoreFunction: false,
            },
        ],
        semi: [
            'error',
            'always',
            {
                omitLastInOneLineBlock: true,
            },
        ],
    },
};
