import client from "prom-client";
import fp from "fastify-plugin";
const register = new client.Registry();

// Example metric: HTTP request counter
const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "path", "status"],
});

const httpRequestDurationSeconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "path", "status"],
  buckets: [0.1, 0.3, 0.5, 1, 3, 5],
});
// Add metrics to registry
register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestDurationSeconds);
// Optional: default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

export default fp(function (fastify, opts, done) {
  fastify.decorate("metrics", register);
  fastify.addHook("onResponse", async (req, res) => {
    httpRequestsTotal.inc({
      method: req.method,
      path: req.url,
      status: res.statusCode,
    });

    const duration = res.elapsedTime;
    httpRequestDurationSeconds.observe(
      {
        method: req.method,
        path: req.url,
        status: res.statusCode,
      },
      duration
    );
  });
  done();
});
