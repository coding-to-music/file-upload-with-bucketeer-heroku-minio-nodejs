export interface StorageService {
  getSignedURLForUpload(bucket: string, key: string, contentType?: string): Promise<string>;
  createPublicBucketIfNotExists(bucket: string): Promise<void>;
}
