export const detectPlagiarism = (text: string) => {
  const snippets = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.split(" ").length > 7)
    .slice(0, 5);

  // placeholder approach: returns candidate snippets for external search pipelines.
  return {
    plagiarismScore: 0,
    matchedSources: [] as Array<{ snippet: string; source: string; similarity: number }>,
    snippetsForSearch: snippets
  };
};
