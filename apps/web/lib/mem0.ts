import MemoryClient from 'mem0ai';

export const client = new MemoryClient({ apiKey: process.env.MEM0_API_KEY as string });
