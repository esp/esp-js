module.exports = {
    "transform": {
        "^.+\\.jsx?$": "babel-jest",
        "^.+\\.tsx?$": "<rootDir>/../../__jest__/typeScriptPreprocessor.ts"
    },
    "testMatch": [
        "**/tests/**/*Tests.[jt]s"
    ],
    "moduleFileExtensions": [
        "ts",
        "tsx",
        "js"
    ],
    "moduleNameMapper": {
        "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/../../__jest__/mocks/fileMock.js",
        "\\.(css|less)$": "<rootDir>/../../__jest__/mocks/styleMock.js"
    },
    "testEnvironment": "node"
};
