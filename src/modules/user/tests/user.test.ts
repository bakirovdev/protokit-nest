import { FeatureTest } from "src/base/test/feature-test.base";

export class UserTest extends FeatureTest
{
    async test_index_success()
    {
        this.sendRequest({
            path: '/user',            
        })
    }
}