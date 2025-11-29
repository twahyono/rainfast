import { pipeline } from "node:stream/promises";
import fsPromise from "node:fs/promises";
import fs from "node:fs";
import path from "node:path";
import { v1 as uuidv1 } from "uuid";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function routes(fastify, opts) {
  //fastify.addHook("onRequest", fastify.authenticate);
  fastify.register(import("@fastify/multipart"), {
    limits: {
      fieldNameSize: 100, // Max field name size in bytes
      fieldSize: 100, // Max field value size in bytes
      fields: 10, // Max number of non-file fields
      fileSize: 1000000, // For multipart forms, the max file size in bytes
      files: 5, // Max number of file fields
      headerPairs: 2000, // Max number of header key=>value pairs
      parts: 1000, // For multipart forms, the max number of parts (fields + files)
    },
  });

  fastify.get(
    "/:id",
    {
      schema: {
        params: { type: "object", properties: { id: { type: "string" } } },
      },
    },

    async function (request, reply) {
      try {
        const id = request.params.id;
        console.log(id);
        /**
         * @type {import('@azure/storage-blob').BlobBlockClient}
         */
        const blockBlobClient = fastify.azureBlobClient.getBlockBlobClient(id);
        const downloadBlockBlobResponse = await blockBlobClient.download();
        console.log(downloadBlockBlobResponse);
        reply.header("Content-Type", "application/octet-stream");
        return reply.send(downloadBlockBlobResponse.readableStreamBody);
      } catch (e) {
        fastify.log.error(e);
        throw e;
      }
    }
  );

  // upload single file
  fastify.post(
    "/upload",

    async function (request, reply) {
      const data = await request.file();

      data.file; // stream
      data.fields; // other parsed parts
      data.fieldname;
      data.filename;
      data.encoding;
      data.mimetype;

      await pipeline(
        data.file,
        fs.createWriteStream(path.join("/upload", data.filename))
      );
      // check if file truncated because it break size limit
      if (data.file.truncated) {
        reply.send(new fastify.multipartErrors.FilesLimitError());
      }
      reply.send({ message: "File uploaded." });
    }
  );

  // upload single file
  fastify.post(
    "/upload/azure",

    async function (request, reply) {
      const data = await request.file();

      data.file; // stream
      data.fields; // other parsed parts
      console.log(data.filename);
      data.filename;
      data.encoding;
      data.mimetype;
      const splitName = data.filename.split(".");
      const ext = "." + splitName[splitName.length - 1];
      const blobName = uuidv1() + ext;
      console.log(fastify.azureBlobClient);
      const blockBlobClient =
        fastify.azureBlobClient.getBlockBlobClient(blobName);
      const res = await blockBlobClient.uploadStream(data.file);
      // check if file truncated because it break size limit
      if (data.file.truncated) {
        reply.send(new fastify.multipartErrors.FilesLimitError());
      }
      reply.send({
        message: "File uploaded.",
        filename: blockBlobClient.name,
        url: blockBlobClient.url,
      });
    }
  );

  // upload multiple file
  fastify.post(
    "/upload/files",

    async function (request, reply) {
      const parts = request.files();
      for await (const part of parts) {
        const filename = part.filename;
        await pipeline(
          part.file,
          fs.createWriteStream(path.join("upload", filename))
        );
      }
      reply.send({ message: "File uploaded." });
    }
  );

  fastify.get(
    "/streams/:filename",
    {
      schema: {
        params: {
          type: "object",
          properties: { filename: { type: "string" } },
        },
      },
    },
    async function (request, reply) {
      try {
        const filename = request.params.filename;
        await new Promise((res) => setTimeout(res, 100));
        const stream = fs.createReadStream(path.join("/upload/" + filename));
        reply.header("Content-Type", "application/octet-stream");
        return reply.send(stream);
      } catch (e) {
        fastify.log.error(e);
        throw e;
      }
    }
  );

  fastify.get(
    "/buffer/:filename",
    {
      schema: {
        params: {
          type: "object",
          properties: { filename: { type: "string" } },
        },
      },
    },
    async function (request, reply) {
      try {
        const filename = request.params.filename;
        await new Promise((res) => setTimeout(res, 100));
        const fileBuffer = await fsPromise.readFile(
          path.join(__dirname, "../../../upload/" + filename)
        );
        reply.header("Content-Type", "application/octet-stream");
        return reply.send(fileBuffer);
      } catch (err) {
        reply.send(err);
      }
    }
  );
}

export default routes;
