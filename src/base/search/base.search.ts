import { SearchFilter } from "./search-filter";
import { PrismaModels } from "@src/prisma/types";
import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "@src/prisma/prisma.service";
import { PaginateFunction, paginator } from "@src/helpers/pagination.helper";

const paginate: PaginateFunction = paginator({ perPage: 10 });
type GenerateArgParamType = {
    where?: Record<string, any>,
    select?: Record<string, any>,
    orderBy?: Record<string, any>[],
    include?: Record<string, any>
}
type GeneratedArgType = {
    args: {
        select: Record<string, any> | null,
        where: Record<string, any> | null,
        orderBy: Record<string, any> | null
    },
    pg: {
        perPage: number,
        page: number
    }
}

@Injectable()
export class BaseSearch {
    @Inject(PrismaService)
    protected prisma: PrismaService;

    protected model: PrismaModels;
    public relations: string[];
    public filters: {};
    public perPage: number = 20;
    public page: number = 1;
    public orders: string[];

    public safeSelect = {};
    protected whereConditions: any[] = [];
    protected include: {}
    protected acceptedOrders: object[] = []
    public deleted: object | undefined = undefined;


    setModel(model: any): this {
        this.model = model;
        return this;
    }

    setInclude(relations: string | string[]): this {
        let relationsArray = Array.isArray(relations) ? relations : [relations];
        relationsArray = this.arrayIntersect(relationsArray, this.relations)
        this.include = { ...this.include, ...this.buildInclude(relationsArray) }

        return this;
    }

    setFilter(paramFilters: object): this {
        const filter = new SearchFilter(this.filters, paramFilters);
        this.whereConditions.push(...filter.process())
        return this
    }

    setOrders(orders: object): this {
        if (orders) {
            Object.entries(orders).forEach(([order, value]: ['string', 'string']) => {
                if (this.orders.includes(order)) {
                    this.acceptedOrders.push({
                        [order]: value
                    })
                }
            });            
        }
        return this
    }

    setDeleted(param: string): this {
        if (param === 'true') {
            this.deleted = {
                is_deleted: true
            }
        } else {
            this.deleted = undefined
        }

        return this;
    }

    setPg(perPage?: number, page: number = 1): this {
        this.perPage = perPage || this.perPage;
        this.page = page;
        return this;
    }

    private buildInclude(approvedRelations: string[]): any {
        if (approvedRelations.length === 0) return undefined;

        const include: any = {};

        approvedRelations.forEach(relation => {
            const parts = relation.split('.');
            let current = include;

            parts.forEach((part, index) => {
                let userSelect: undefined | object = undefined;
                if (part === 'user' || part === 'users') {
                    userSelect = {
                        id: true,
                        email: true,
                        type: true,
                        created_at: true,
                        updated_at: true,
                        is_deleted: true,
                    }
                }

                if (index === parts.length - 1) {
                    // Last part in the chain
                    current[part] = userSelect ? { select: userSelect } : true;
                } else {
                    // Intermediate part - need to go deeper
                    if (!current[part] || current[part] === true) {
                        // Initialize or convert `true` to nested structure
                        current[part] = { select: {} };
                    }

                    // Ensure include object exists
                    if (!current[part].select) {
                        current[part].select = {};
                    }

                    current = current[part].select;
                }
            });
        });

        return include;
    }

    async findMany(data: GenerateArgParamType) {
        const args = this.generateArg(data);
        return await this.prisma[this.model].findMany(args.args);
    }

    async findFirst(data: GenerateArgParamType) {
        const args = this.generateArg(data);

        return await this.prisma[this.model].findFirst(args.args);
    }

    async paginate(data: GenerateArgParamType) {
        const args = this.generateArg(data);
        const result = paginate<any, any>(
            this.prisma[this.model],
            args.args,
            args.pg
        )
        return result;
    }

    setSelect(additional = {}): undefined | object {
        let selects = { ...this.safeSelect, ...additional };
        return selects ? selects : undefined;
    }

    public generateArg(data: GenerateArgParamType = {}): GeneratedArgType {
        let select = { ...(data.select || {}), ...this.safeSelect };
        if (data.where) {
            this.whereConditions.push(data.where)
        }
        const args = {
            select: {
                ...select,
                ...this.include,
                ...(data.include || {}),
            },
            where: {
                'AND': this.whereConditions,
                ...this.deleted
            },
            orderBy: [...this.acceptedOrders, ...(data.orderBy || [])]
        };

        const pg = {
            perPage: this.perPage,
            page: this.page
        }
        return { args, pg }
    }

    arrayIntersect<T>(arr1: T[], arr2: T[]): T[] {
        return arr1.filter(value => arr2.includes(value));
    }

    where<T>(condition: T): this {
        if (!this.whereConditions) {
            this.whereConditions = [];
        }
        this.whereConditions.push(condition);        
        return this;
    }

    addInclude(data: Record<string, any>){
        this.include = {...this.include, ...data}
    }

    orWhere<T>(condition: T) {
        this.whereConditions.push({ OR: condition });
        return this;
    }
}