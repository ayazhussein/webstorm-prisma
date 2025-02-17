import { PrismaService } from './base-prisma.js';
import { Id } from './base-schema.js';
import { z } from 'zod';
import prisma from './prisma.js';

const model = z.object({
  name: z.string().nullish(),
  email: z.string().email(),
  id: z.string().uuid(),
});
type Model = typeof model;
type ModelSchema = z.infer<typeof model>;

export class DemoExtending extends PrismaService<Model, typeof prisma.user> {
  create = async (input: ModelSchema) => {
    return this.delegate.findFirstOrThrow({
      where: {

      }
    })
  };
  update = async (id: Id, input: ModelSchema) => {
    await this.delegate.update({
      where: {
        id
      },
      data: {
        email: input.email
      }
    })
    return this.delegate.findFirstOrThrow({
      where: {

      }
    })
  }
}
