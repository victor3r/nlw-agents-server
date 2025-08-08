# NLW Agents

Project developed during Rocketseat's NLW AI event, focusing on creating an API for managing AI agents and rooms.

## Technologies

- [Fastify](https://fastify.io/) - Fast and low overhead web framework
- [DrizzleORM](https://orm.drizzle.team/) - TypeScript ORM
- [PostgreSQL](https://www.postgresql.org/) - Database
- [Zod](https://zod.dev/) - TypeScript-first schema validation
- [TypeScript](https://www.typescriptlang.org/) - Type safety and developer experience
- [Biome](https://biomejs.dev/) - Code formatting and linting

## Setup

1. **Install dependencies**

```bash
npm install
```

2. **Configure environment**
   Create a `.env` file with:

```
PORT=3333
DATABASE_URL="postgresql://user:password@localhost:5432/nlw_agents"
```

3. **Setup Database**

```bash
# Start PostgreSQL with Docker
docker compose up -d

# Seed the database (optional)
npm run db:seed
```

4. **Run the project**

```bash
# Development mode
npm run dev

# Production mode
npm run start
```

## Project Structure

- `src/`
  - `db/` - Database configuration and migrations
  - `http/routes/` - API endpoints
  - `server.ts` - Application entry point

## Features

- Room management system
- REST API with type safety
- Database persistence with Drizzle ORM
- Input validation using Zod schemas

## API Routes

- `GET /rooms` - List all rooms

## License

This project is under the MIT license.
