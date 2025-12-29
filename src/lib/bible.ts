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

export const tagalogToEnglishBookMap: { [key: string]: string } = {
  "Genesis": "Genesis",
  "Exodo": "Exodus",
  "Levitico": "Leviticus",
  "Mga Bilang": "Numbers",
  "Deuteronomio": "Deuteronomy",
  "Josue": "Joshua",
  "Mga Hukom": "Judges",
  "Ruth": "Ruth",
  "1 Samuel": "1 Samuel",
  "2 Samuel": "2 Samuel",
  "1 Mga Hari": "1 Kings",
  "2 Mga Hari": "2 Kings",
  "1 Mga Cronica": "1 Chronicles",
  "2 Mga Cronica": "2 Chronicles",
  "Ezra": "Ezra",
  "Nehemias": "Nehemiah",
  "Esther": "Esther",
  "Job": "Job",
  "Mga Awit": "Psalms",
  "Mga Kawikaan": "Proverbs",
  "Mangangaral": "Ecclesiastes",
  "Ang Awit ni Solomon": "Song of Solomon",
  "Isaias": "Isaiah",
  "Jeremias": "Jeremiah",
  "Mga Panaghoy": "Lamentations",
  "Ezekiel": "Ezekiel",
  "Daniel": "Daniel",
  "Hosea": "Hosea",
  "Joel": "Joel",
  "Amos": "Amos",
  "Obadias": "Obadiah",
  "Jonas": "Jonah",
  "Mikas": "Micah",
  "Nahum": "Nahum",
  "Habacuc": "Habakkuk",
  "Zefanias": "Zephaniah",
  "Hagai": "Haggai",
  "Zacarias": "Zechariah",
  "Malakias": "Malachi",
  "Mateo": "Matthew",
  "Marcos": "Mark",
  "Lucas": "Luke",
  "Juan": "John",
  "Mga Gawa": "Acts",
  "Mga Taga Roma": "Romans",
  "1 Mga Taga Corinto": "1 Corinthians",
  "2 Mga Taga Corinto": "2 Corinthians",
  "Mga Taga Galacia": "Galatians",
  "Mga Taga Efeso": "Ephesians",
  "Mga Taga Filipos": "Philippians",
  "Mga Taga Colosas": "Colossians",
  "1 Mga Taga Tesalonica": "1 Thessalonians",
  "2 Mga Taga Tesalonica": "2 Thessalonians",
  "1 Timoteo": "1 Timothy",
  "2 Timoteo": "2 Timothy",
  "Tito": "Titus",
  "Filemon": "Philemon",
  "Mga Hebreo": "Hebrews",
  "Santiago": "James",
  "1 Pedro": "1 Peter",
  "2 Pedro": "2 Peter",
  "1 Juan": "1 John",
  "2 Juan": "2 John",
  "3 Juan": "3 John",
  "Judas": "Jude",
  "Pahayag": "Revelation"
};


// This is an approximation. For a more accurate chapter count, this would also need to be fetched or stored.
export const bookChapters: { [key: string]: number } = {
    "Genesis": 50, "Exodus": 40, "Leviticus": 27, "Numbers": 36, "Deuteronomy": 34, "Joshua": 24, "Judges": 21, "Ruth": 4, 
    "1 Samuel": 31, "2 Samuel": 24, "1 Kings": 22, "2 Kings": 25, "1 Chronicles": 29, "2 Chronicles": 36, "Ezra": 10, 
    "Nehemiah": 13, "Esther": 10, "Job": 42, "Psalms": 150, "Proverbs": 31, "Ecclesiastes": 12, "Song of Solomon": 8, 
    "Isaiah": 66, "Jeremiah": 52, "Lamentations": 5, "Ezekiel": 48, "Daniel": 12, "Hosea": 14, "Joel": 3, "Amos": 9, 
    "Obadiah": 1, "Jonah": 4, "Micah": 7, "Nahum": 3, "Habakkuk": 3, "Zephaniah": 3, "Haggai": 2, "Zechariah": 14, "Malachi": 4,
    "Matthew": 28, "Mark": 16, "Luke": 24, "John": 21, "Acts": 28, "Romans": 16, "1 Corinthians": 16, "2 Corinthians": 13, 
    "Galatians": 6, "Ephesians": 6, "Philippians": 4, "Colossians": 4, "1 Thessalonians": 5, "2 Thessalonians": 3, 
    "1 Timothy": 6, "2 Timothy": 4, "Titus": 3, "Philemon": 1, "Hebrews": 13, "James": 5, "1 Peter": 5, "2 Peter": 3, 
    "1 John": 5, "2 John": 1, "3 John": 1, "Jude": 1, "Revelation": 22
};
