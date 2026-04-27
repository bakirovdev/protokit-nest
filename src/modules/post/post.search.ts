import { Prisma } from "@generated/prisma";
import { Injectable, Scope } from "@nestjs/common";
import { BaseSearch } from "@src/base/search/base.search";
import { SearchFilterConditionEnum } from "@src/base/search/filter/enums/search-filter-condition.enum";
import { SearchFilterTypeEnum } from "@src/base/search/filter/enums/search-filter-type.enum";

@Injectable({ scope: Scope.REQUEST })
export class PostSearch extends BaseSearch {
    orders = [
        'id',
        'created_at'
    ]
    relations = [
        'user'
    ]
    filters = {
        title: SearchFilterTypeEnum.LIKE,
        search: {
            condition: SearchFilterConditionEnum.OR_WHERE,
            filters: {
                title: SearchFilterTypeEnum.LIKE,
                content: SearchFilterTypeEnum.LIKE,
                "user.full_name": SearchFilterTypeEnum.LIKE,
            }
        }
    }

    safeSelect: Prisma.PostSelect = {
        id: true,
        uid: true,
        title: true,
        content: true,
        user_id: true,
        is_deleted: true,
        created_at: true,
        updated_at: true,
    }
}