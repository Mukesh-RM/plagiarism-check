const splitSentences = (text: string) =>
  text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

const wordTokens = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);

const shannonEntropy = (words: string[]) => {
  const counts = new Map<string, number>();
  words.forEach((w) => counts.set(w, (counts.get(w) ?? 0) + 1));
  const total = words.length || 1;
  return [...counts.values()].reduce((acc, c) => {
    const p = c / total;
    return acc - p * Math.log2(p);
  }, 0);
};

const variance = (values: number[]) => {
  if (!values.length) return 0;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return values.reduce((acc, v) => acc + (v - avg) ** 2, 0) / values.length;
};

const passiveRatio = (text: string) => {
  const passiveHits = (text.match(/\b(was|were|been|being|is|are|be)\s+\w+ed\b/gi) ?? []).length;
  const sentences = splitSentences(text).length || 1;
  return passiveHits / sentences;
};

export const analyzeText = (text: string) => {
  const sentences = splitSentences(text);
  const words = wordTokens(text);
  const uniqueWords = new Set(words).size;
  const sentenceLengths = sentences.map((s) => wordTokens(s).length);

  const entropy = shannonEntropy(words);
  const burstiness = Math.min(1, variance(sentenceLengths) / 40);
  const lexicalRichness = words.length ? uniqueWords / words.length : 0;
  const repetition = Math.max(0, 1 - lexicalRichness * 2);
  const passiveness = Math.min(1, passiveRatio(text));

  // lightweight perplexity proxy: lower entropy + low lexical richness => more AI-like
  const perplexityProxy = 1 - Math.min(1, entropy / 6);

  const aiLikelihood = Math.min(
    1,
    0.42 * perplexityProxy + 0.26 * (1 - burstiness) + 0.2 * repetition + 0.12 * passiveness
  );

  const aiScore = Math.round(aiLikelihood * 100);
  const humanScore = 100 - aiScore;

  const sentenceBreakdown = sentences.map((sentence) => {
    const len = wordTokens(sentence).length;
    const localVarPenalty = Math.min(1, Math.abs(len - (sentenceLengths[0] ?? len)) / 40);
    const repetitive = (sentence.match(/\b(\w+)\b(?=.*\b\1\b)/gi) ?? []).length > 1;
    const aiProbability = Math.round((aiLikelihood * 0.75 + (repetitive ? 0.15 : 0) + (1 - localVarPenalty) * 0.1) * 100);

    return {
      sentence,
      aiProbability: Math.max(0, Math.min(100, aiProbability))
    };
  });

  return {
    aiScore,
    humanScore,
    confidence: aiScore > 75 ? "High" : aiScore > 45 ? "Medium" : "Low",
    metrics: {
      perplexityProxy: Number(perplexityProxy.toFixed(3)),
      burstiness: Number(burstiness.toFixed(3)),
      lexicalRichness: Number(lexicalRichness.toFixed(3)),
      passiveVoiceRatio: Number(passiveness.toFixed(3)),
      repetitionIndex: Number(repetition.toFixed(3))
    },
    sentenceBreakdown
  };
};
