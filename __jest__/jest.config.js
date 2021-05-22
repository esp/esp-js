module.exports = {
    "transform": {
        "^.+\\.js?$": "<rootDir>/../../__jest__/typeScriptPreprocessor.ts",
        "^.+\\.tsx?$": "<rootDir>/../../__jest__/typeScriptPreprocessor.ts"
    },
    "testMatch": [
        "**/tests/**/*Tests.[jt]s?(x)"
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
    "setupFiles": [
        "<rootDir>/../../__jest__/disableJestConsoleWrapper.js",
        "<rootDir>/../../__jest__/mocks/browserMocks.js"
    ],
    "modulePaths": [
        "<rootDir>"
    ],
    "testURL": "http://localhost/",
    "setupFilesAfterEnv": [
        "<rootDir>/../../__jest__/mocks/cryptoMock.ts"
    ]
};
