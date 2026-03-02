import { numericFields } from "../fields";
import { SearchFilterType } from "../search-filter-type";

export class In extends SearchFilterType {
    public process(): any {
        if (!Array.isArray(this.value)) {
            if (this.value === '_null') {
                this.value = [null]
            } else {
                this.value = [this.value]
            }
        }

        let transformedValue = this.value;
        let orValue: undefined | Record<string, null> = undefined        
        if (numericFields.includes(this.field)) {
            transformedValue = this.value
            .filter(v => {
                if (v === '_null' || v === null) {
                    orValue = { [this.field]: null };
                    return false;
                }
                return true;
            })
            .map(v => Number(v));
        }        

        const orStatement = [
            {
                [this.field]: {
                    in: transformedValue
                },
            },
            orValue
        ].filter(Boolean);
        
        this.filterQuery.push({
            AND: [
                {
                    OR: orStatement
                }
            ]
        })

        return this.filterQuery;
    }
}