import { PrismaModels } from "./all-models.type";

export type SeederData<T> = {
    model: PrismaModels;
    data: T[];
};