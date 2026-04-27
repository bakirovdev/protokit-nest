import { Prisma } from "@generated/prisma";
import { Injectable, Scope } from "@nestjs/common";
import { BaseSearch } from "@src/base/search/base.search";
import { SearchFilterConditionEnum } from "@src/base/search/filter/enums/search-filter-condition.enum";
import { SearchFilterTypeEnum } from "@src/base/search/filter/enums/search-filter-type.enum";

@Injectable({ scope: Scope.REQUEST })
export class RoleSearch extends BaseSearch {
    orders = [
        'id',
        'created_at'
    ]
    relations = [
        'users',
        'role_permission_ref',
        'role_permission_ref.permission'
    ]
    filters = {
        name: SearchFilterTypeEnum.LIKE,
        search: {
            condition: SearchFilterConditionEnum.OR_WHERE,
            filters: {
                name: SearchFilterTypeEnum.LIKE,
                description: SearchFilterTypeEnum.LIKE
            }
        }
    }
    safeSelect: Prisma.RoleSelect = {
        id: true,
        uid: true,
        name: true,
        description: true,
        created_at: true,
        updated_at: true,
        is_deleted: true,
    }
}