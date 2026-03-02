import { Prisma, PrismaClient } from '@prisma/client';

export const softDeleteModels = new Set([
  'User',
  'Post'
]);

const SOFT_DELETE_DATA = { is_deleted: true } as const;

const readOperations = new Set(['findUnique', 'findFirst', 'findMany']);
const deleteOperations = new Set(['delete', 'deleteMany']);

const hasIsDeletedCondition = (where: any): boolean => {
  if (!where) return false;
  if (where.is_deleted !== undefined) return true;

  for (const key of ['AND', 'OR', 'NOT']) {
    const val = where[key];
    if (!val) continue;
    if (Array.isArray(val)) {
      if (val.some(hasIsDeletedCondition)) return true;
    } else if (hasIsDeletedCondition(val)) {
      return true;
    }
  }

  return false;
};

const isSoftDeleteModel = (name: string | undefined): name is string =>
  !!name && softDeleteModels.has(name);

export const softDeleteExtension = (prisma: PrismaClient) => {
  return Prisma.defineExtension({
    model: {
      $allModels: {
        async softDelete<T>(
          this: T,
          where: Prisma.Args<T, 'delete'>['where']
        ) {
          const context = Prisma.getExtensionContext(this);
          if (isSoftDeleteModel(context.$name)) {
            return (context as any).update({ where, data: SOFT_DELETE_DATA });
          }
          return (context as any).delete({ where });
        },

        async softDeleteMany<T>(
          this: T,
          where: Prisma.Args<T, 'deleteMany'>['where']
        ) {
          const context = Prisma.getExtensionContext(this);
          if (isSoftDeleteModel(context.$name)) {
            return (context as any).updateMany({ where, data: SOFT_DELETE_DATA });
          }
          return (context as any).deleteMany({ where });
        },
      },
    },
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!isSoftDeleteModel(model)) return query(args);

          const a = args as any;

          if (readOperations.has(operation) && a?.where) {
            if (!hasIsDeletedCondition(a.where)) {
              a.where = { ...a.where, is_deleted: false };
            }
          }

          if (deleteOperations.has(operation) && a?.where) {
            const modelClient = (prisma as any)[model.charAt(0).toLowerCase() + model.slice(1)];
            const op = operation === 'delete' ? 'update' : 'updateMany';
            return modelClient[op]({ where: a.where, data: SOFT_DELETE_DATA });
          }

          return query(args);
        },
      },
    },
  });
};
