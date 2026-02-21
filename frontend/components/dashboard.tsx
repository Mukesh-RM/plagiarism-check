"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { apiPost } from "../lib/api";

type AnalyzeResponse = {
  aiScore: number;
  humanScore: number;
  confidence: string;
  sentenceBreakdown: Array<{ sentence: string; aiProbability: number }>;
};

type HumanizeResponse = {
  original: { text: string; analysis: AnalyzeResponse };
  final: { text: string; analysis: AnalyzeResponse; iteration: number };
  improvement: number;
};

export function Dashboard() {
  const [token, setToken] = useState("");
  const [text, setText] = useState("");
  const [tone, setTone] = useState("casual");
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
  const [humanized, setHumanized] = useState<HumanizeResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const highlighted = useMemo(
    () => analysis?.sentenceBreakdown.filter((s) => s.aiProbability >= 70) ?? [],
    [analysis]
  );

  const onAnalyze = async () => {
    setLoading(true);
    try {
      const res = await apiPost<AnalyzeResponse>("/api/analysis/analyze", { text }, token);
      setAnalysis(res);
      setHumanized(null);
    } finally {
      setLoading(false);
    }
  };

  const onHumanize = async () => {
    setLoading(true);
    try {
      const res = await apiPost<HumanizeResponse>("/api/analysis/humanize", { text, tone }, token);
      setHumanized(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-3xl font-semibold">AI Detection + Humanizer SaaS</h1>
      <p className="mt-2 text-slate-400">Analyze, humanize, and export report-ready output.</p>

      <div className="mt-6 grid gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4">
        <input
          className="rounded-md bg-slate-800 p-2"
          placeholder="JWT token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <textarea
          className="min-h-40 rounded-md bg-slate-800 p-3"
          placeholder="Paste text to analyze..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <select className="w-52 rounded-md bg-slate-800 p-2" value={tone} onChange={(e) => setTone(e.target.value)}>
          <option value="casual">Casual</option>
          <option value="academic">Academic</option>
          <option value="professional">Professional</option>
        </select>
        <div className="flex gap-3">
          <button className="rounded-md bg-indigo-500 px-4 py-2" onClick={onAnalyze} disabled={loading || !text}>
            Analyze
          </button>
          <button className="rounded-md bg-emerald-500 px-4 py-2" onClick={onHumanize} disabled={loading || !text}>
            Humanize
          </button>
        </div>
      </div>

      {analysis && (
        <motion.section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="text-xl font-semibold">Detection Score</h2>
          <p>AI Score: {analysis.aiScore}% | Human Score: {analysis.humanScore}%</p>
          <p>Confidence: {analysis.confidence}</p>
          <h3 className="mt-3 font-medium">Highlighted AI-like Sentences</h3>
          <ul className="mt-2 space-y-2 text-sm text-slate-300">
            {highlighted.map((item, idx) => (
              <li key={`${item.aiProbability}-${idx}`}>({item.aiProbability}%) {item.sentence}</li>
            ))}
          </ul>
        </motion.section>
      )}

      {humanized && (
        <motion.section className="mt-6 grid gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4 md:grid-cols-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <article>
            <h3 className="font-semibold">Original</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{humanized.original.text}</p>
            <p className="mt-2 text-sm">AI Score: {humanized.original.analysis.aiScore}%</p>
          </article>
          <article>
            <h3 className="font-semibold">Humanized</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{humanized.final.text}</p>
            <p className="mt-2 text-sm">AI Score: {humanized.final.analysis.aiScore}%</p>
            <p className="text-sm text-emerald-400">Improvement: {humanized.improvement}%</p>
          </article>
        </motion.section>
      )}
    </main>
  );
}
