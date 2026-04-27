import { Prisma } from "@generated/prisma";
import { Injectable, Scope } from "@nestjs/common";
import { BaseSearch } from "@src/base/search/base.search";
import { SearchFilterConditionEnum } from "@src/base/search/filter/enums/search-filter-condition.enum";
import { SearchFilterTypeEnum } from "@src/base/search/filter/enums/search-filter-type.enum";

@Injectable({ scope: Scope.REQUEST })
export class UserSearch extends BaseSearch {
    orders = [
        'id',
        'created_at'
    ]
    relations = [
        'role'
    ]
    filters = {
        full_name: SearchFilterTypeEnum.LIKE,
        email: SearchFilterTypeEnum.LIKE,
        search: {
            condition: SearchFilterConditionEnum.OR_WHERE,
            filters: {
                full_name: SearchFilterTypeEnum.LIKE,
                email: SearchFilterTypeEnum.LIKE,                
            }
        }
    }

    safeSelect: Prisma.UserSelect = {
        id: true,
        uid: true,
        email: true,
        full_name: true,
        role_id: true,
        is_deleted: true,
        created_at: true,
        updated_at: true,
    }
}