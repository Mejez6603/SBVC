'use server';
/**
 * @fileOverview Provides suggestions for Bible passages related to a specific topic.
 *
 * - suggestRelevantPassages - A function that suggests relevant Bible passages based on a topic.
 * - SuggestRelevantPassagesInput - The input type for the suggestRelevantPassages function.
 * - SuggestRelevantPassagesOutput - The return type for the suggestRelevantPassages function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRelevantPassagesInputSchema = z.object({
  topic: z.string().describe('The topic for which to suggest Bible passages.'),
});
export type SuggestRelevantPassagesInput = z.infer<typeof SuggestRelevantPassagesInputSchema>;

const SuggestRelevantPassagesOutputSchema = z.object({
  passages: z.array(z.string()).describe('An array of suggested Bible passages related to the topic.'),
});
export type SuggestRelevantPassagesOutput = z.infer<typeof SuggestRelevantPassagesOutputSchema>;

export async function suggestRelevantPassages(input: SuggestRelevantPassagesInput): Promise<SuggestRelevantPassagesOutput> {
  return suggestRelevantPassagesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRelevantPassagesPrompt',
  input: {schema: SuggestRelevantPassagesInputSchema},
  output: {schema: SuggestRelevantPassagesOutputSchema},
  prompt: `You are a knowledgeable guide to the Bible. A user is interested in the topic "{{{topic}}}". Suggest several relevant Bible passages. Return the list of passages as a JSON array of strings. Focus on direct quotations or short summaries of passages. Omit commentary.`,
});

const suggestRelevantPassagesFlow = ai.defineFlow(
  {
    name: 'suggestRelevantPassagesFlow',
    inputSchema: SuggestRelevantPassagesInputSchema,
    outputSchema: SuggestRelevantPassagesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
