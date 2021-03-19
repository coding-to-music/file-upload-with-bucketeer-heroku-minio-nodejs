import { Resource } from './resource';

export interface ResourceRepo extends AddableResourceRepo<Resource> {}

export interface ReadableResourceRepo<T extends Resource> {
  getByID(resourceID: string): Promise<T | null>;
}

export interface RemovableResourceRepo<T extends Resource> extends ReadableResourceRepo<T> {
  removeByID(resourceID: string): Promise<void>;
}

export interface AddableResourceRepo<T extends Resource> {
  addResource(resource: T | T[]): Promise<void>;
}

export interface UpdatableResourceRepo<TUpdates extends Record<string, unknown>> {
  updateResourceByID(resourceID: Resource['id'], updates: TUpdates): Promise<void>;
}
