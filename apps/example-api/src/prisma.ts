import { type Prisma, PrismaClient } from '@prisma/client/example-api-db/index.js';

import { env } from './env.js';


export enum PRISMA_ERROR_CODES {
    RECORD_NOT_FOUND = 'P2025',
}

function softDelete<Model, Args extends object>(
    this: Model,
    args: Prisma.Exact<Args, Prisma.Args<Model, 'delete'>>,
): Promise<Prisma.Result<Model, Args, 'update'>> {
    // @ts-expect-error: Requires more types from Prisma
    return this.update({
        ...args,
        data: {
            isDeleted: true,
            deletedAt: new Date(),
        },
    });
}

function softDeleteMany<Model, Args extends object>(
    this: Model,
    args?: Prisma.Exact<Args, Prisma.Args<Model, 'deleteMany'>>,
): Promise<Prisma.Result<Model, Args, 'updateMany'>> {
    // @ts-expect-error: Requires more types from Prisma
    return this.updateMany({
        ...args,
        data: {
            isDeleted: true,
            deletedAt: new Date(),
        },
    });
}

function softRestore<Model, Args extends object>(
    this: Model,
    args: Prisma.Exact<Args, Prisma.Args<Model, 'delete'>>,
): Promise<Prisma.Result<Model, Args, 'update'>> {
    // @ts-expect-error: Requires more types from Prisma
    return this.update({
        ...args,
        data: {
            isDeleted: false,
            deletedAt: null,
        },
    });
}

function softRestoreMany<Model, Args extends object>(
    this: Model,
    args?: Prisma.Exact<Args, Prisma.Args<Model, 'deleteMany'>>,
): Promise<Prisma.Result<Model, Args, 'updateMany'>> {
    // @ts-expect-error: Requires more types from Prisma
    return this.updateMany({
        ...args,
        data: {
            isDeleted: false,
            deletedAt: null,
        },
    });
}

const getPrismaConfig = (): Prisma.PrismaClientOptions => {
    try {
        const {
            CORE_DB_PASSWORD,
            CORE_DB_HOSTNAME,
            CORE_DB_USERNAME,
            CORE_DB_NAME,
            CORE_DB_PORT,
        } = env;
        return {
            datasourceUrl: `postgresql://${CORE_DB_USERNAME}:${CORE_DB_PASSWORD}@${CORE_DB_HOSTNAME}:${CORE_DB_PORT}/${CORE_DB_NAME}`,
            errorFormat: 'minimal',
        };
    } catch (e) {
        return {};
    }
};


// Inspired by Prisma docs:
// - https://www.prisma.io/docs/concepts/components/prisma-client/client-extensions/model
// - https://www.prisma.io/docs/concepts/components/prisma-client/client-extensions/type-utilities
// - https://www.npmjs.com/package/@prisma-extensions/soft-delete
const prisma = new PrismaClient(getPrismaConfig()).$extends({
    name: '@example/soft-delete',
    model: {
        $allModels: {
            softDelete,
            softDeleteMany,
            softRestore,
            softRestoreMany,
        },
    },
});

export default prisma;
