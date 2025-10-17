import { BlobServiceClient } from "@azure/storage-blob";
import { configDotenv } from "dotenv";
import fp from "fastify-plugin";

configDotenv();

export default fp(function (fastify, opts, done) {
  const { containerName, azureStorageConnectionString } = opts;
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    azureStorageConnectionString
  );
  // Get a reference to a container
  const containerClient = blobServiceClient.getContainerClient(containerName);
  // Create the container
  containerClient.createIfNotExists().then((r) => {
    fastify.decorate("azureBlobClient", containerClient);
    done();
  });
});
