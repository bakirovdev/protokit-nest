import { SearchFilterType } from "../search-filter-type";

export class Like extends SearchFilterType {
    public process(): any {
        const value = Array.isArray(this.value) ? this.value[0] : this.value
        this.filterQuery.push({
            [this.field]: {
                contains: value,
                mode: 'insensitive'
            }
        })        
        
        return this.filterQuery;
    }
}