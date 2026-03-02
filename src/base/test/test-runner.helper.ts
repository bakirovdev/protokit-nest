export function runE2ETests<T>(
    testClass: new () => T,
    describeName?: string
): void {
    describe(describeName || testClass.name, () => {
        let testCase: T;

        beforeAll(async () => {
            testCase = new testClass();
            if (typeof (testCase as any).setUp === 'function') {
                await (testCase as any).setUp();
            }
        });

        afterAll(async () => {
            if (typeof (testCase as any).tearDown === 'function') {
                await (testCase as any).tearDown();
            }
        });

        // Get all methods starting with test_
        const prototype = testClass.prototype;
        const methodNames = Object.getOwnPropertyNames(prototype).filter(
            (name) => name.startsWith('test_') && typeof prototype[name] === 'function'
        );

        // Create a test for each method
        methodNames.forEach((methodName) => {
            const testName = methodName
                .replace('test_', '')
                .replace(/_/g, ' ');

            it(`should ${testName}`, async () => {
                await (testCase as any)[methodName]();
            });
        });
    });
}