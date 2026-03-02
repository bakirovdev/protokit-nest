import { BaseResource } from "./base.resource";

export class JsonResource extends BaseResource {
    toJSON()
    {
        return this.data;
    }
}