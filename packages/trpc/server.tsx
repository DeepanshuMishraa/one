import 'server-only';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { cache } from 'react';
import { createTRPCContext } from './init';
import { makeQueryClient } from './query-client';
import { appRouter } from './routers/_app';

export const getQueryClient = cache(makeQueryClient);

// Server-side TRPC client
export const trpcServer = appRouter.createCaller(createTRPCContext());

// Client-side TRPC proxy
export const trpcClient = createTRPCProxyClient({
  links: [
    httpBatchLink({
      url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/trpc',
    }),
  ],
});
