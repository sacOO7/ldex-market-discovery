module.exports = {
    roots: ['./'],
    transform: {
        "^.+\\.[t|j]s?$": "babel-jest"
    },
    testMatch: ["**/tests/**/*.spec.+(ts|tsx|js)"],
    // testRegex: '(/tests/.*|(\\.|/)(test|spec))\\.tsx?$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}
