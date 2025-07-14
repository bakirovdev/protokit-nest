import { FeatureTest } from "../feature-test.base";

export interface IFeatureTest {
    new(): FeatureTest;
    run(): void
}