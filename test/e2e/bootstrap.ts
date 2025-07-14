import * as path from "path";
import * as glob from 'glob';
import { IFeatureTest } from "src/base/test/interfaces/feature-test-iterface";
import { FeatureTest } from "src/base/test/feature-test.base";

const pattern = path.join(__dirname, '../../src/**/*.test.ts');

for (const file of glob.sync(pattern)) {
    require(file);
}

function isFeatureTest(ctor: any): ctor is IFeatureTest {
    return (
        typeof ctor === 'function' &&
        typeof ctor.run === 'function' &&
        ctor.prototype instanceof FeatureTest
    );
}

for(const mod of Object.values(require.cache)){
    const exports = mod?.exports ?? {};
    for(const value of Object.values(exports)){
        if (isFeatureTest(value)) {
            value.run();
        }
    }
}