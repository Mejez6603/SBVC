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

const PassageSchema = z.object({
    reference: z.string().describe('The Bible passage reference (e.g., "John 3:16").'),
    text: z.string().describe('The full text of the Bible passage.'),
});

const SuggestRelevantPassagesOutputSchema = z.object({
  passages: z.array(PassageSchema).describe('An array of suggested Bible passages related to the topic, including reference and text.'),
});
export type SuggestRelevantPassagesOutput = z.infer<typeof SuggestRelevantPassagesOutputSchema>;

export async function suggestRelevantPassages(input: SuggestRelevantPassagesInput): Promise<SuggestRelevantPassagesOutput> {
  return suggestRelevantPassagesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRelevantPassagesPrompt',
  input: {schema: SuggestRelevantPassagesInputSchema},
  output: {schema: SuggestRelevantPassagesOutputSchema},
  prompt: `You are a knowledgeable guide to the Bible. A user is interested in the topic "{{{topic}}}". Suggest several relevant Bible passages. For each passage, provide both the reference and the full text of the verse(s). Return the list of passages as a JSON array of objects, where each object has a "reference" and a "text" field. Focus on direct quotations. Omit commentary.`,
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
