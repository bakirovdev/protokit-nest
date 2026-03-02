import { numericFields } from "../fields";
import { SearchFilterType } from "../search-filter-type";

export class Equal extends SearchFilterType
{
    public process(): any
    {   
        if (this.value === '_null') {
            this.value = null;
        }

        let transformedValue = this.value;
        if (numericFields.includes(this.field)) {
            transformedValue = Number(this.value)
        }

        this.filterQuery.push({
            [this.field]: transformedValue
        })
        
        return this.filterQuery;
    }
}