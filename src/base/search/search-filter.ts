import QueryString from "qs";
import { SearchFilterConditionEnum } from "./filter/enums/search-filter-condition.enum";
import { SearchFilterTypeEnum } from "./filter/enums/search-filter-type.enum";

type PrismaWhereCondition = {
  [key: string]: {
    contains?: string;
    mode?: 'insensitive';
    equals?: any;
    // Add other Prisma filter operators you might use
    gt?: number;
    lt?: number;
    gte?: number;
    lte?: number;
    in?: any[];
    not?: any;
  };
};


export class SearchFilter
{
    constructor(
        private filters: {},
        private params: any,
        private queryFilter: any[] = [],
    ){}

    process(): any[]
    {
        if (this.params) {            
            Object.entries(this.params).forEach(([param, value]: [string, string]) => {        
                if (!this.filters[param]) return;
                    
                let filterType = this.filters[param];                
                
                const paramParts = param.split('.');
    
                if (Object.values(SearchFilterTypeEnum).includes(filterType as SearchFilterTypeEnum)) {                    
                    this.processSingle(filterType, paramParts, value)
                } else {                    
                    this.processGroup(filterType, value)
                }
            })
        }
        
        return this.queryFilter;
    }

    private processSingle(filterType: SearchFilterTypeEnum, params: any[], value: any): void
    {                
        if (params.length === 1) {
            let filter = new filterType(params[0], value, SearchFilterConditionEnum.WHERE)            
            this.queryFilter.push(...filter.process());            
            
        } else {
            let field = params.pop()
            this.queryFilter.push(this.applyRelation(filterType, params[0], field, value));            
        }
    }

    private processGroup(filterGroup: {condition: SearchFilterConditionEnum, filters: any[]}, value: any)
    {        
        const orConditions: PrismaWhereCondition[] = [];
        
        Object.entries(filterGroup.filters).forEach(([param, filterType]: [string, SearchFilterTypeEnum]) => {
            const paramParts = param.split('.');                        
            if (paramParts.length === 1) {
                let filter = new filterType(paramParts[0], value, filterGroup.condition);
                orConditions.push(...filter.process());
            } else {
                let field = paramParts.pop()                
                if (field) {     
                    orConditions.push(this.applyRelation(filterType, paramParts[0], field, value, filterGroup.condition))
                }
            }
        });

        this.queryFilter.push({
            OR: orConditions
        });
    }

    private applyRelation(filterType: SearchFilterTypeEnum, relation: string, field: string, value: any, condition= SearchFilterConditionEnum.WHERE)
    {        
        let filter = new filterType(field, value, condition)        
        return {[relation]: filter.process()[0]}
    }

}