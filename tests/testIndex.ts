const testsContext = require.context('.', true, /Tests.ts$/);
testsContext.keys().forEach(testsContext);
