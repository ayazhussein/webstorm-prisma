import { type Prisma } from '@prisma/client/example-api-db/index.js';

import prisma from './prisma.js';
import { z } from 'zod';
import { Id, Schema } from './base-schema.js';
import { CrudService } from './base-crud.js';


interface ToOneToOneRelationshipInput {
  id?: Id;
}

interface ToOneToManyRelationshipInput {
  ids?: Id[];
  overwrite?: boolean;
}

interface PrismaConnection {
  id: Id;
}

interface OneToOneRelationship {
  connect?: PrismaConnection;
}

interface OneToManyRelationship {
  connect?: PrismaConnection[];
  set?: PrismaConnection[];
}

type ToRelationshipInput =
  | ToOneToOneRelationshipInput
  | ToOneToManyRelationshipInput;

type Relationship = OneToOneRelationship | OneToManyRelationship;

// Delegate (the thing the repo uses to access data)

type PrismaClient = typeof prisma; // Support extensions
type ModelName = Uncapitalize<Prisma.ModelName>;

export interface PrismaServiceDeleteInput {
  force?: boolean;
}

// Service

export interface PrismaServiceInput<ModelSchema extends Schema> {
  modelSchema: ModelSchema;
  delegate: PrismaClient[ModelName];
}

export abstract class PrismaService<
  ModelSchema extends Schema,
  Delegate extends PrismaClient[ModelName],
> implements CrudService<z.infer<ModelSchema>> {
  readonly delegate: Delegate;
  readonly prisma: PrismaClient = prisma;
  readonly modelSchema: Schema;

  constructor(input: PrismaServiceInput<ModelSchema>) {
    const { delegate, modelSchema } = input;

    // @ts-expect-error The delegates all have different signatures
    this.delegate = delegate;
    this.modelSchema = modelSchema;
  }

  // Delegate implementation of these methods to extending classes
  abstract create: CrudService<z.infer<ModelSchema>>['create'];
  abstract update: CrudService<z.infer<ModelSchema>>['update'];

  async delete(id: Id, input?: PrismaServiceDeleteInput): Promise<z.infer<ModelSchema>> {
    let record;

    const { force } = input || {};
    const condition = {
      where: {
        id,
      },
    };

    if (force) {
      // @ts-expect-error The delegates all have different signatures but delete() using just id is compatible between all delegates
      record = await this.delegate.delete(condition);
    } else {
      record = await this.delegate.softDelete(condition);
    }

    return this.toModel(record);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get = async (id: Id, _input?: any): Promise<z.infer<ModelSchema> | null> => {
    // @ts-expect-error The delegates all have different signatures but findUnique() using just id is compatible between all delegates
    const record = await this.delegate.findUnique({
      where: {
        id,
      },
    });

    return record ? this.toModel(record) : null;
  };

  // Formats the delegate's response as expected by the model
  toModel: (input: Record<string, unknown>) => z.infer<ModelSchema> = (
    input,
  ) => {
    return this.modelSchema.parse(input);
  };

  // We overload to support one-to-one and one-to-many relationships
  toRelationship(input: ToOneToOneRelationshipInput): OneToOneRelationship;
  toRelationship(input: ToOneToManyRelationshipInput): OneToManyRelationship;
  toRelationship(input: ToRelationshipInput): Relationship | undefined {
    // If one-to-one relationship...
    if ('id' in input) {
      const { id } = input;

      if (!id) {
        return; // Returning undefined avoids overwrite existing relationships
      }

      return {
        connect: {
          id,
        },
      };
      // Else, if one-to-many relationship
    } else if ('ids' in input) {
      const { ids, overwrite } = input;

      if (!ids) {
        return; // Returning undefined avoids overwrite existing relationships
      }

      const operationName = overwrite ? 'set' : 'connect';

      return {
        [operationName]: ids.map((id) => {
          return { id };
        }),
      };

      // Else, throw as a fallback
    } else {
      throw new Error('Bad input passed to toRelationship()');
    }
  }
}
