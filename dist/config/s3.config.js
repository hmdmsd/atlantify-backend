"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Credentials = exports.s3Config = void 0;
exports.s3Config = {
    bucket: process.env.S3_BUCKET_NAME || 'atlantify.deuxfleurs.fr',
    region: process.env.S3_REGION || 'eu-west-1',
    endpoint: process.env.S3_ENDPOINT || 'https://garage.deuxfleurs.fr',
    maxFileSize: 5 * 1024 * 1024, // 5MB limit
    allowedAudioTypes: ['audio/mpeg', 'audio/ogg', 'audio/wav'],
};
exports.s3Credentials = {
    accessKeyId: process.env.S3_ACCESS_KEY || '',
    secretAccessKey: process.env.S3_SECRET_KEY || '',
};
