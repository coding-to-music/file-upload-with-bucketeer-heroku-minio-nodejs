import { AWSError, S3 } from 'aws-sdk';
import { StorageService } from './storage-service';

export const s3ServiceS3Factory = ({
  s3,
  urlExpirationSeconds,
}: {
  s3: S3;
  urlExpirationSeconds: number;
}): StorageService => ({
  getSignedURLForUpload: async (bucket, key, contentType) => {
    return await s3.getSignedUrlPromise('putObject', {
      Bucket: bucket,
      Key: key,
      Expires: urlExpirationSeconds,
      CacheControl: 'max-age=0',
      ContentType: contentType && decodeURIComponent(contentType),
    });
  },

  createPublicBucketIfNotExists: async (bucket) => {
    const policyID = `${bucket}-public-get-policy`;
    const policy = `{
      "Version": "2012-10-17",
      "Statement": [
        {
          "Sid": "${policyID}",
          "Effect": "Allow",
          "Principal": {"AWS": "*"},
          "Action": [ "s3:GetObject", "s3:PutObject" ],
          "Resource": ["arn:aws:s3:::${bucket}/*" ]
        }
      ]
    }`;

    const bucketExists = await (async () => {
      try {
        await s3.headBucket({ Bucket: bucket }).promise();
        return true;
      } catch (e) {
        const error = e as AWSError;
        if (error.code === 'NotFound') {
          return false;
        }
        throw e;
      }
    })();

    if (!bucketExists) {
      await s3.createBucket({ Bucket: bucket }).promise();
    }

    // Set CORS
    try {
      await s3
        .putBucketCors({
          Bucket: bucket,
          CORSConfiguration: {
            CORSRules: [
              {
                AllowedHeaders: ['*'],
                ExposeHeaders: ['ETag', 'x-amz-meta-custom-header'],
                AllowedMethods: ['HEAD', 'GET', 'PUT', 'POST', 'DELETE'],
                AllowedOrigins: ['*'],
              },
            ],
          },
        })
        .promise();
    } catch (e) {
      // MinIO (used for local env) doest not support this, CORS is * by default
      const error = e as AWSError;
      if (error.code !== 'NotImplemented') {
        throw error;
      }
    }

    // Set public read
    await s3
      .putBucketPolicy({
        Bucket: bucket,
        Policy: policy,
      })
      .promise();
  },
});
