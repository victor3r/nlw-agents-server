import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { db } from '../../db/connection.ts';
import { schema } from '../../db/schema/index.ts';
import { generateEmbeddings, transcribeAudio } from '../../services/gemini.ts';

export const uploadAudioRoute: FastifyPluginCallbackZod = app => {
  app.post(
    '/rooms/:id/audio',
    {
      schema: {
        params: z.object({
          id: z.guid(),
        }),
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const audio = await request.file();

      if (!audio) {
        return reply.status(409).send({
          error: 'No audio file uploaded',
        });
      }

      const audioBuffer = await audio.toBuffer();
      const audioAsBase64 = audioBuffer.toString('base64');

      const transcription = await transcribeAudio(
        audioAsBase64,
        audio.mimetype
      );

      const embeddings = await generateEmbeddings(transcription);

      const result = await db
        .insert(schema.audioChunks)
        .values({ roomId: id, embeddings, transcription })
        .returning();

      const savedAudioChunk = result[0];

      if (!savedAudioChunk) {
        return reply.status(400).send({
          error: 'Failed to create audio chunk',
        });
      }

      return reply.status(201).send({ id: savedAudioChunk.id });
    }
  );
};
