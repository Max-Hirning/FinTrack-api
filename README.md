# Template overview

## Key technologies/dependencies:
- TypeScript - programming language;
- Node.js - JavaScript runtime;
- Fastify - HTTP framework;
- PostgreSQL - database;
- Prisma - database ORM;
- Zod - validation;
- Swagger - API documentation + authentication.

## Project structure
```
├── commitlint.config.js
├── docker-compose.yml
├── Dockerfile
├── nodemon.json
├── package.json
├── package-lock.json
├── src
│   ├── bootstrap - Fastify plugins / additional server set up
│   │   └── swagger.ts
│   ├── business 
│   │   ├── lib - third-party libraries
│   │   │   ├── errors
│   │   │   │   └── index.ts
│   │   │   ├── hashing.ts
│   │   │   └── validation - Zod validation schemas for services and routes
│   │   │       └── example
│   │   │           └── index.ts
│   │   └── services - core application business logic
│   │       └── example
│   │           ├── example.service.ts
│   │           └── index.ts
│   ├── config.ts
│   ├── database
│   │   ├── prisma
│   │   │   ├── prisma.ts
│   │   │   └── schema.prisma
│   │   └── repositories - database repositories layer with all the queries and methods
│   │       ├── generate.repository.ts
│   │       ├── index.ts
│   │       └── user.repository.ts
│   ├── index.ts
│   ├── routes - Fastify HTTP routes & handlers (aka controllers)
│   │   ├── application.ts
│   │   ├── example
│   │   │   ├── example.handler.ts
│   │   │   ├── example.route.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   └── types
│       └── index.d.ts
├── tsconfig.json
└── tsconfig.tsbuildinfo
```

## Project start-up
1. `npm install` - install the dependencies locally;
2. Create .env file from .env.example;
3. Launch docker compose with `docker compose up` command.

## Running Prisma migrations
Since the Node.js server and PostgreSQL database run inside Docker containers, the network connection to the database is established through [docker compose network](https://docs.docker.com/compose/networking/).
The host name for the database url from Node.js container is `postgresdb` (which is equal to the compose service name).

To connect to the database and run migrations from the host machine (outside Docker container), you need to change the database url host name to `localhost` or `0.0.0.0`.

In short:
1. Launch docker containers - `docker compose up`;
2. Update .env `DATABASE_URL` host from `postgresdb` to `localhost`;
3. Run `npm run prisma:migrate:create` - create SQL migration file;
4. Name your new migration and verify the SQL code generated;
5. Run `npm run prisma:migrate:apply` - apply the migration to the database;
6. Update .env `DATABASE_URL` back to `postgresdb` so that Node.js container can connect to the database after rebuild.
#   F i n T r a c k - a p i . 2 . 0  
 