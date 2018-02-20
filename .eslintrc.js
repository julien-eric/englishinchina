const OFF = 0, WARN = 1, ERROR = 2;

module.exports = {
    "extends": "google",
    "rules": {
        "max-len": [WARN, 140],
        "new-cap": ["error", {"capIsNewExceptionPattern": "^express\.."}],
        "guard-for-in": OFF,
        "padded-blocks": OFF,
        "linebreak-style": ["error", "windows"],
        "comma-dangle": ["error", "never"],
    },
    "parserOptions": {
        "ecmaVersion": 2017
    },
};