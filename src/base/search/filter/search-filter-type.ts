import { SearchFilterConditionEnum } from "./enums/search-filter-condition.enum";

export abstract class SearchFilterType 
{
    protected condition: SearchFilterConditionEnum;

    constructor(        
        protected field: string,
        protected value: any,
        condition: SearchFilterConditionEnum,
        protected filterQuery: object[] = [],
    ){
        this.condition = condition
    }

    public abstract process(): any;

}