import { BaseResource } from "@src/base/http/resources";

export class PostResource extends BaseResource {
    toJSON() {
        return {
            id: this.data.id,
            uid: this.data.uid,
            title: this.data.title,
            content: this.data.content,
            user_id: this.data.user_id,
            user: this.data.user,
            is_deleted: this.data.is_deleted,
            created_at: this.data.created_at,
            updated_at: this.data.updated_at,
        };
    }
}
