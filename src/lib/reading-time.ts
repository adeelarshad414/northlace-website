const WORDS_PER_MINUTE = 200;

export const getReadingTime = (wordCount: number) => {
  if (wordCount <= 0) {
    return 0;
  }

  return Math.ceil(wordCount / WORDS_PER_MINUTE);
};
