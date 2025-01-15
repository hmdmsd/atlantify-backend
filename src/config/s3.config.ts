export const s3Config = {
  endpoint: process.env.S3_ENDPOINT || 'https://garage.deuxfleurs.fr',
  region: process.env.S3_REGION || 'garage',
  accessKeyId: process.env.S3_ACCESS_KEY || 'GKa8bf55babca0f2e4c588c7b6',
  secretAccessKey:
    process.env.S3_SECRET_KEY ||
    'd3a330bd1dd024c2053292cba525bac007075f2bd1d8a3b8c7fa9036976e6d92',
  bucket: process.env.S3_BUCKET || 'atlantify',
};
export const s3Credentials = {
  accessKeyId: process.env.S3_ACCESS_KEY || '',
  secretAccessKey: process.env.S3_SECRET_KEY || '',
};
