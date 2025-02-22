import { BlobServiceClient } from '@azure/storage-blob';

if (!process.env.AZURE_STORAGE_CONNECTION_STRING) {
  throw new Error('Azure Storage Connection string not found');
}

export const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);

export const containerClient = blobServiceClient.getContainerClient(
  process.env.AZURE_STORAGE_CONTAINER_NAME || 'images'
);

export async function getImageUrl(blobName: string): Promise<string> {
  const blobClient = containerClient.getBlobClient(blobName);
  return blobClient.url;
}