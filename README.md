# FinTrack

## Overview

*FinTrack is a comprehensive financial tracking application designed to help users effectively manage their personal and financial goals. With its intuitive interface and robust functionality, FinTrack empowers users to take control of their finances, track income and expenses, plan budgets, set savings goals, and monitor loans—all in one unified platform.*

*Whether you're looking to optimize spending, save for future milestones, or gain insights into your financial habits, FinTrack provides the tools to make informed decisions and stay financially organized.*

## Key technologies/dependencies:

### Core:
- [Node.js](https://nodejs.org/uk) - JavaScript runtime;
- [Typescript](https://www.typescriptlang.org/) - programming language;
- [Fastify](https://fastify.dev/) - HTTP framework;

### Database:
- [PostgreSQL](https://www.postgresql.org/) - database;
- [Prisma](https://www.prisma.io/) - database ORM;

### File storage:
- [Cloudinary](https://cloudinary.com/) - image and video api platform;

### Mail service:
- [Nodemailer](https://www.nodemailer.com/);

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
1. `npm install`;
2. Create .env file from .env.example;
3. Launch docker compose with `docker compose up` command.