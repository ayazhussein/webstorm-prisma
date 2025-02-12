import { z } from 'zod';

export const zodId = z.string().uuid();
export type Id = z.infer<typeof zodId>;
export type Schema = z.AnyZodObject;
