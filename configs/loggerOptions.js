export const level = process.env.LOG_LEVEL || "info";
export const transport = {
  target: "pino-pretty",
};
export const serializers = {
  res: function (reply) {
    return {
      statusCode: reply.statusCode,
      //responseTime: reply.elapsedTime,
    };
  },
};

export default { level, serializers };
