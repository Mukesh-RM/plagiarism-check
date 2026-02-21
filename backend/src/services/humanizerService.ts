import { analyzeText } from "./detectionService.js";
import { openai } from "./openAiClient.js";

const HUMANIZER_PROMPT = `You are an expert human writer.
Rewrite the following text to sound completely human-written.

Requirements:
- Increase sentence variation (burstiness)
- Avoid robotic patterns
- Add subtle emotional tone
- Avoid predictable transitions
- Reduce repetitive phrasing
- Use conversational phrasing occasionally
- Keep meaning intact
- Do NOT sound academic unless original text is academic
- Avoid AI-like smooth perfection
- Add natural flow and imperfections
- Maintain readability
- Make it undetectable by AI detectors.`;

const heuristicHumanize = (text: string) => {
  return text
    .replace(/Furthermore/gi, "On top of that")
    .replace(/Moreover/gi, "Also")
    .replace(/In conclusion/gi, "So basically")
    .replace(/\btherefore\b/gi, "so")
    .split(/(?<=[.!?])\s+/)
    .map((sentence, i) => (i % 3 === 0 ? `${sentence} Honestly, that's the big thing.` : sentence))
    .join(" ");
};

const rewriteWithModel = async (text: string, tone = "casual") => {
  if (!openai) return heuristicHumanize(text);

  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input: `${HUMANIZER_PROMPT}\n\nTone: ${tone}\n\nText:\n"""\n${text}\n"""`
  });

  return response.output_text || heuristicHumanize(text);
};

export const humanizeWithLoop = async (text: string, tone?: string) => {
  const baseline = analyzeText(text);
  let currentText = text;
  let best = { text, analysis: baseline, iteration: 0 };

  for (let i = 1; i <= 3; i += 1) {
    currentText = await rewriteWithModel(currentText, tone);
    const analysis = analyzeText(currentText);
    if (analysis.aiScore < best.analysis.aiScore) {
      best = { text: currentText, analysis, iteration: i };
    }
    if (analysis.aiScore <= 30) {
      best = { text: currentText, analysis, iteration: i };
      break;
    }
  }

  return {
    original: { text, analysis: baseline },
    final: best,
    improvement: Math.max(0, baseline.aiScore - best.analysis.aiScore)
  };
};
