import { and, cosineDistance, desc, eq, gt, sql } from 'drizzle-orm';
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { db } from '../../db/connection.ts';
import { schema } from '../../db/schema/index.ts';
import { generateAnswer, generateEmbeddings } from '../../services/gemini.ts';

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

      const embeddings = await generateEmbeddings(question);

      const similarity = sql<number>`1 - (${cosineDistance(schema.audioChunks.embeddings, embeddings)})`;

      const chunks = await db
        .select({
          id: schema.audioChunks.id,
          transcription: schema.audioChunks.transcription,
          similarity,
        })
        .from(schema.audioChunks)
        .where(and(eq(schema.audioChunks.roomId, id), gt(similarity, 0.7)))
        .orderBy(record => desc(record.similarity))
        .limit(3);

      let answer: string | null = null;

      if (chunks.length > 0) {
        answer = await generateAnswer(
          question,
          chunks.map(chunk => chunk.transcription)
        );
      }

      const result = await db
        .insert(schema.questions)
        .values({ question, roomId: id, answer })
        .returning();

      const savedQuestion = result[0];

      if (!savedQuestion) {
        return reply.status(400).send({
          error: 'Failed to create question',
        });
      }

      return reply.status(201).send({
        id: savedQuestion.id,
        answer,
      });
    }
  );
};
