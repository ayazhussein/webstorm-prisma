import { type z } from 'zod';

import { Id, type Schema } from './base-schema.js';

export interface CrudService<Model extends z.infer<Schema>> {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  create: (input: any) => Promise<Model>;
  delete: (id: Id, input?: any) => unknown;
  get: (id: Id, input?: any) => Promise<Model | null>; // Return null if no record found
  getMany?: (input: any) => Promise<Model[]>; // Return empty array if no records found
  update: (id: Id, input: any) => Promise<Model>;
  /* eslint-enable @typescript-eslint/no-explicit-any */
}
