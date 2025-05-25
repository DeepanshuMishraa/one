import { openai } from "./ai";

export const generateEmbeddings = async (value: string) => {
  const input = value.trim();

  if (!input) {
    console.warn('Attempted to generate embedding for empty input');
    return [{ content: '', embedding: [] }];
  }

  console.log('Generating embedding for:', input);

  try {
    const embedding = await openai.embeddings.create({
      model: "text-embedding-004",
      input: input
    });

    if (!embedding.data[0]?.embedding) {
      console.error('No embedding generated for input:', input);
      throw new Error('No embedding generated');
    }

    console.log('Successfully generated embedding with dimensions:', embedding.data[0].embedding.length);
    return [{ content: input, embedding: embedding.data[0].embedding }];
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}


