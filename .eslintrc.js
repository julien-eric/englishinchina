const OFF = 0, WARN = 1, ERROR = 2;

module.exports = {
    "extends": "google",
    "rules": {
        "max-len": [WARN, 140]
    },
    "parserOptions": {
        "ecmaVersion": 6
    }
};