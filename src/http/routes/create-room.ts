import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { db } from '../../db/connection.ts';
import { schema } from '../../db/schema/index.ts';

export const createRoomRoute: FastifyPluginCallbackZod = app => {
  app.post(
    '/rooms',
    {
      schema: {
        body: z.object({
          name: z.string().min(1),
          description: z.string().optional(),
        }),
      },
    },
    async (request, reply) => {
      const { name, description } = request.body;

      const result = await db
        .insert(schema.rooms)
        .values({ name, description })
        .returning();

      const savedRoom = result[0];

      if (!savedRoom) {
        return reply.status(400).send({
          error: 'Failed to create room',
        });
      }

      return reply.status(201).send({
        id: savedRoom.id,
      });
    }
  );
};
