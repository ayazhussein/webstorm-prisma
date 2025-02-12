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

export class DemoExtending extends PrismaService<Model, typeof prisma.user> {
  create = async (input: unknown) => {
    return this.delegate.findFirstOrThrow({
      where: {

      }
    })
  };
  update = async (id: Id, input: unknown) => {
    await this.delegate.update({
      where: {
        id
      },
      data: {
        email: input['email'],
      }
    })
    return this.delegate.findFirstOrThrow({
      where: {

      }
    })
  }
}
