import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { db } from '../../db/connection.ts';
import { schema } from '../../db/schema/index.ts';

export const createQuestionRoute: FastifyPluginCallbackZod = app => {
  app.post(
    '/rooms/:id/questions',
    {
      schema: {
        body: z.object({
          question: z.string().min(1),
        }),
        params: z.object({
          id: z.guid(),
        }),
      },
    },
    async (request, reply) => {
      const { question } = request.body;
      const { id } = request.params;

      const result = await db
        .insert(schema.questions)
        .values({ question, roomId: id })
        .returning();

      const savedQuestion = result[0];

      if (!savedQuestion) {
        throw new Error('Failed to create question');
      }

      return reply.status(201).send({
        id: savedQuestion.id,
      });
    }
  );
};
