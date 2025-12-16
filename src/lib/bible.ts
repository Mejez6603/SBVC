import kjv from './kjv.json';
import adb from './adb1905.json';
import tcb from './tcb2015.json';

type BibleData = {
  [book: string]: {
    [chapter: string]: {
      [verse: string]: string;
    };
  };
};

const kjvData = kjv as BibleData;
const adbData = adb as BibleData;
const tcbData = tcb as BibleData;

export const bibleVersions: { [key: string]: BibleData } = {
  KJV: kjvData,
  ADB: adbData,
  TCB: tcbData,
};

export const oldTestamentBooks = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", 
  "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", 
  "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", 
  "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", 
  "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi"
];

export const newTestamentBooks = [
  "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", 
  "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", 
  "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", 
  "1 John", "2 John", "3 John", "Jude", "Revelation"
];

const allBooks = [...oldTestamentBooks, ...newTestamentBooks];

export const bookChapters: { [key: string]: number } = {};

allBooks.forEach(book => {
  if (kjvData[book]) {
    bookChapters[book] = Object.keys(kjvData[book]).length;
  }
});
