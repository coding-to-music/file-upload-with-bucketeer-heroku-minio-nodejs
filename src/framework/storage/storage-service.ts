export enum SignedURLMethod {
  PUT = 'PUT',
  GET = 'GET',
}

export interface StorageService {
  getSignedURLForUpload(bucket: string, key: string, method: SignedURLMethod, contentType?: string): Promise<string>;
  isExistingBlob(bucket: string, key: string): Promise<boolean>;
  createPublicBucketIfNotExists(bucket: string): Promise<void>;
}
