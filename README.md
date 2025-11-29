This project will help you quickly start building RESTful API with Fastify and Prisma ORM.

### Features:

1. API Routes, with example
2. JWT Authorization, with example: protect per route or per endpoint
3. Simple Authentication with email and password
4. Prisma database connection already configured you just need to provide a correct connection to your database
5. OpenAPI ready with documentation generated based on routes and json schema
6. Password hashing with bcrypt
7. Expose metrics for Prometheus
8. Implement rate limit with @fastify/rate-limit

## Getting Started

First, setup your local database. Example environment variable file provided: .env.example. Rename it to .env.  
Then install package:

```bash
npm install
```

Migrate Prisma model and generate Prisma Client:

```bash
npx prisma migrate dev
# run below command if you need to generate your Prisma client
npx prisma generate
```

Open [http://localhost:8080](http://localhost:8080) with your browser to see the result.


### OpenAPI Doc
For OpenAPI Doc open [http://localhost:8080/documentation](http://localhost:8080/documentation) 



