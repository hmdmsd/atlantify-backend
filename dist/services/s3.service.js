"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const s3_config_1 = require("../config/s3.config");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class S3Service {
    constructor() {
        this.s3 = new aws_sdk_1.default.S3({
            endpoint: s3_config_1.s3Config.endpoint,
            region: s3_config_1.s3Config.region,
            accessKeyId: s3_config_1.s3Credentials.accessKeyId,
            secretAccessKey: s3_config_1.s3Credentials.secretAccessKey,
            s3ForcePathStyle: true, // Needed for S3-compatible services like Deuxfleurs Garage
        });
    }
    /**
     * Uploads a file to S3.
     * @param localFilePath - Path to the file on the local system.
     * @param key - S3 object key (path in the bucket).
     * @returns The S3 URL of the uploaded file.
     */
    uploadFile(localFilePath, key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const fileContent = fs_1.default.readFileSync(localFilePath);
                yield this.s3
                    .putObject({
                    Bucket: s3_config_1.s3Config.bucket,
                    Key: key,
                    Body: fileContent,
                    ContentType: this.getMimeType(localFilePath),
                })
                    .promise();
                console.log(`File uploaded to S3: ${key}`);
                return `${s3_config_1.s3Config.endpoint}/${s3_config_1.s3Config.bucket}/${key}`;
            }
            catch (error) {
                console.error('Error uploading file to S3:', error);
                throw new Error('Failed to upload file to S3.');
            }
            finally {
                // Optionally delete the local file after uploading
                fs_1.default.unlinkSync(localFilePath);
            }
        });
    }
    /**
     * Deletes a file from S3.
     * @param key - S3 object key (path in the bucket).
     */
    deleteFile(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.s3
                    .deleteObject({
                    Bucket: s3_config_1.s3Config.bucket,
                    Key: key,
                })
                    .promise();
                console.log(`File deleted from S3: ${key}`);
            }
            catch (error) {
                console.error('Error deleting file from S3:', error);
                throw new Error('Failed to delete file from S3.');
            }
        });
    }
    /**
     * Retrieves a file's signed URL for direct download.
     * @param key - S3 object key (path in the bucket).
     * @param expiresInSeconds - Expiration time for the signed URL (default: 3600 seconds).
     * @returns The signed URL for downloading the file.
     */
    getSignedUrl(key_1) {
        return __awaiter(this, arguments, void 0, function* (key, expiresInSeconds = 3600) {
            try {
                const signedUrl = this.s3.getSignedUrl('getObject', {
                    Bucket: s3_config_1.s3Config.bucket,
                    Key: key,
                    Expires: expiresInSeconds,
                });
                console.log(`Generated signed URL: ${signedUrl}`);
                return signedUrl;
            }
            catch (error) {
                console.error('Error generating signed URL:', error);
                throw new Error('Failed to generate signed URL.');
            }
        });
    }
    /**
     * Determines the MIME type of a file based on its extension.
     * @param filePath - Path to the file.
     * @returns The MIME type as a string.
     */
    getMimeType(filePath) {
        const ext = path_1.default.extname(filePath).toLowerCase();
        const mimeTypes = {
            '.mp3': 'audio/mpeg',
            '.ogg': 'audio/ogg',
            '.wav': 'audio/wav',
        };
        return mimeTypes[ext] || 'application/octet-stream';
    }
}
exports.S3Service = S3Service;
