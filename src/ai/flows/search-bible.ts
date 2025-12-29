'use server';
/**
 * @fileOverview Provides a local search for Bible passages.
 *
 * - searchBible - A function that searches for passages in the local KJV Bible files.
 * - SearchBibleInput - The input type for the searchBible function.
 * - SearchBibleOutput - The return type for the searchBible function.
 */

import { z } from 'genkit';
import path from 'path';
import fs from 'fs/promises';
import { oldTestamentBooks, newTestamentBooks } from '@/lib/bible';

const PassageSchema = z.object({
    reference: z.string().describe('The Bible passage reference (e.g., "John 3:16").'),
    text: z.string().describe('The full text of the Bible passage.'),
});

const SearchBibleInputSchema = z.object({
  topic: z.string().describe('The text to search for in the Bible.'),
});
export type SearchBibleInput = z.infer<typeof SearchBibleInputSchema>;

const SearchBibleOutputSchema = z.object({
  passages: z.array(PassageSchema).describe('An array of found Bible passages.'),
});
export type SearchBibleOutput = z.infer<typeof SearchBibleOutputSchema>;

const allBooks = [...oldTestamentBooks, ...newTestamentBooks];

export async function searchBible(input: SearchBibleInput): Promise<SearchBibleOutput> {
  const searchTerm = input.topic.toLowerCase();
  const results: z.infer<typeof PassageSchema>[] = [];

  if (!searchTerm) {
    return { passages: [] };
  }

  const bibleDir = path.join(process.cwd(), 'public', 'bible', 'kjv');

  for (const bookName of allBooks) {
    const bookFileName = bookName.toLowerCase().replace(/\s/g, '') + '.json';
    const filePath = path.join(bibleDir, bookFileName);

    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const bookData = JSON.parse(fileContent);

      for (const chapter in bookData) {
        for (const verse in bookData[chapter]) {
          const verseText = bookData[chapter][verse];
          if (verseText.toLowerCase().includes(searchTerm)) {
            results.push({
              reference: `${bookName} ${chapter}:${verse}`,
              text: verseText,
            });
          }
        }
      }
    } catch (e) {
      // It's okay if a book file doesn't exist, just skip it.
      // console.error(`Could not read or parse ${bookFileName}:`, e);
    }
  }

  return { passages: results };
}
