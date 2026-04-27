import { BaseResource } from "@src/base/http/resources";

export class UserResource extends BaseResource {
    toJSON() {
        return {
            id: this.data.id,
            uid: this.data.uid,
            email: this.data.email,
            full_name: this.data.full_name,
            is_deleted: this.data.is_deleted,
            created_at: this.data.created_at,
            updated_at: this.data.updated_at,
        };
    }
}
