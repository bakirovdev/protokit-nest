import { SearchFilterType } from "../search-filter-type";

export class BetweenDate extends SearchFilterType
{
    public process(): any
    {        
        this.value = Array.isArray(this.value) ? this.value : (this.value ? [this.value] : []);        

        let betweenData: {
            gte: string|undefined,
            lte: string|undefined
        } = {gte: undefined, lte: undefined}

        if (this.value[0]) {
            betweenData.gte = new Date(this.value[0]).toISOString();
        }

        if(this.value[1]){
            betweenData.lte = new Date(this.value[1]).toISOString();
        }

        this.filterQuery.push({
            [this.field]: betweenData
        })
        return this.filterQuery;
    }
}