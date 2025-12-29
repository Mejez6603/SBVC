'use server';
/**
 * @fileOverview Provides a local search for Bible passages across multiple versions.
 *
 * - searchBible - A function that searches for passages in local Bible files (KJV, ADB, TCB).
 * - SearchBibleInput - The input type for the searchBible function.
 * - SearchBibleOutput - The return type for the searchBible function.
 */

import { z } from 'genkit';
import path from 'path';
import fs from 'fs/promises';
import { oldTestamentBooks, newTestamentBooks } from '@/lib/bible';

const PassageSchema = z.object({
    reference: z.string().describe('The Bible passage reference (e.g., "John 3:16").'),
    text: z.string().describe('The full text of the Bible passage.').optional(),
});

const SearchBibleInputSchema = z.object({
  topic: z.string().describe('The text to search for in the Bible.'),
});
export type SearchBibleInput = z.infer<typeof SearchBibleInputSchema>;

const SearchBibleOutputSchema = z.object({
  kjv: z.array(PassageSchema).describe('An array of found Bible passages in KJV.'),
  adb: z.array(PassageSchema).describe('An array of found Bible passages in ADB1905.'),
  tcb: z.array(PassageSchema).describe('An array of found Bible passages in TCB2015.'),
});
export type SearchBibleOutput = z.infer<typeof SearchBibleOutputSchema>;

const allBooks = [...oldTestamentBooks, ...newTestamentBooks];
const bibleVersions = ['kjv', 'adb', 'tcb'];

const bibleDataCache: { [version: string]: { [book: string]: any } } = {};

async function loadBook(version: string, bookName: string) {
  if (!bookName) return null;
  const bookFileName = bookName.toLowerCase().replace(/\s/g, '') + '.json';
  if (bibleDataCache[version] && bibleDataCache[version][bookFileName]) {
    return bibleDataCache[version][bookFileName];
  }

  const bibleDir = path.join(process.cwd(), 'public', 'bible', version);
  const filePath = path.join(bibleDir, bookFileName);

  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const bookData = JSON.parse(fileContent);

    if (!bibleDataCache[version]) {
      bibleDataCache[version] = {};
    }
    bibleDataCache[version][bookFileName] = bookData;

    return bookData;
  } catch (e) {
    // console.error(`Could not read or parse ${bookFileName} for version ${version}:`, e);
    return null;
  }
}

export async function searchBible(input: SearchBibleInput): Promise<SearchBibleOutput> {
  const searchTerm = input.topic.toLowerCase();
  const results = {
    kjv: [] as z.infer<typeof PassageSchema>[],
    adb: [] as z.infer<typeof PassageSchema>[],
    tcb: [] as z.infer<typeof PassageSchema>[],
  };

  if (!searchTerm) {
    return results;
  }

  const foundReferences = new Set<string>();

  // Search all versions and collect unique references
  for (const version of bibleVersions) {
    for (const bookName of allBooks) {
      const bookData = await loadBook(version, bookName);
      if (!bookData) continue;

      for (const chapter in bookData) {
        for (const verse in bookData[chapter]) {
          const verseText = bookData[chapter][verse];
          if (verseText.toLowerCase().includes(searchTerm)) {
            const reference = `${bookName} ${chapter}:${verse}`;
            foundReferences.add(reference);
          }
        }
      }
    }
  }

  const sortedReferences = Array.from(foundReferences).sort((a, b) => {
      const aMatch = a.match(/(\d?\s?[a-zA-Z\s]+)\s(\d+):(\d+)/);
      const bMatch = b.match(/(\d?\s?[a-zA-Z\s]+)\s(\d+):(\d+)/);

      if (!aMatch || !bMatch) return 0;

      const [, aBookName, aChapter, aVerse] = aMatch;
      const [, bBookName, bChapter, bVerse] = bMatch;
      
      const aBookIndex = allBooks.indexOf(aBookName.trim());
      const bBookIndex = allBooks.indexOf(bBookName.trim());

      if (aBookIndex !== bBookIndex) {
          return aBookIndex - bBookIndex;
      }
      if (parseInt(aChapter) !== parseInt(bChapter)) {
          return parseInt(aChapter) - parseInt(bChapter);
      }
      return parseInt(aVerse) - parseInt(bVerse);
  });


  // Now, for each unique reference, get the text from all three versions
  for (const reference of sortedReferences) {
    const match = reference.match(/(\d?\s?[a-zA-Z\s]+)\s(\d+):(\d+)/);
    if (!match) continue;

    const [, bookName, chapter, verse] = match;
    
    const kjvBookData = await loadBook('kjv', bookName.trim());
    const adbBookData = await loadBook('adb', bookName.trim());
    const tcbBookData = await loadBook('tcb', bookName.trim());

    results.kjv.push({ 
        reference, 
        text: kjvBookData?.[chapter]?.[verse] 
    });
    results.adb.push({ 
        reference, 
        text: adbBookData?.[chapter]?.[verse] 
    });
    results.tcb.push({ 
        reference, 
        text: tcbBookData?.[chapter]?.[verse] 
    });
  }

  return results;
}
