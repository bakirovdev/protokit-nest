export type PaginationOptions = {
    page?: number;
    perPage?: number;
    
}

export type PaginatedResult<T> = {
    data: T[]
    meta: {
        total?: number
        totalPage?: number
        page: number
        perPage: number
        nextPage: boolean    
    }
}

export type PaginateFunction = <T, K>(model: any, args?: K, options?: PaginationOptions) => Promise<PaginatedResult<T>>

export const paginator = (defaultOptions: PaginationOptions): PaginateFunction => {
    return  async (model, args: any = {where: undefined}, options) => {
        const page = Number(options?.page) || defaultOptions.page || 1;
        const perPage = Number(options?.perPage) || defaultOptions.perPage || 20
        
        const skip = page > 0  ? perPage * (page-1) : 0;

        const [total, data] = await Promise.all([
            model.count({ where: args.where }),
            model.findMany({
                ...args,
                skip,
                take: perPage,
            })
        ]);

        const totalPage = Math.ceil(total / perPage);

        return {
            data,
            meta: {
                total,
                totalPage,
                perPage,
                page,
                nextPage: page < totalPage ? true : false,
            }
        }
    }
}