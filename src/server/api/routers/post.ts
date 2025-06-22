import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ input }) => {
      // TODO: Implement your data storage logic here
      return {
        id: Date.now(),
        name: input.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }),

  getLatest: publicProcedure.query(async () => {
    // TODO: Implement your data retrieval logic here
    return null;
  }),
});
