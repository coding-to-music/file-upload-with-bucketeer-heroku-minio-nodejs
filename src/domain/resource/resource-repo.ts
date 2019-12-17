import { Resource } from './resource';
import { ListResult } from '../list/list';

export interface ResourceRepo extends AddableResourceRepo<Resource> {}

export interface ReadableResourceRepo<T extends Resource> {
  getByID(resourceID: string): Promise<T | undefined>;
}

export interface RemovableResourceRepo<T extends Resource> extends ReadableResourceRepo<T> {
  removeByID(resourceID: string): Promise<void>;
}

export interface AddableResourceRepo<T extends Resource> {
  addResource(resource: T | T[]): Promise<void>;
}

export interface UpdatableResourceRepo<Updates extends object> {
  updateResourceByID(resourceID: Resource['id'], updates: Updates): Promise<void>;
}

export interface MultipleReadableResourceRepo<T extends Resource, ListOptions> {
  getMultiplePaged(listOptions: ListOptions): Promise<ListResult<T>>;
}
