// Seems like Jest's fail() was remvoed by mistake.
// This adds it back.
//
// https://github.com/jestjs/jest/issues/11698#issuecomment-1753323405
function fail(message = '') {
    expect(`[FAIL (monkey-patch fail API)] ${message}`.trim()).toBeFalsy();
}

global.fail = fail;