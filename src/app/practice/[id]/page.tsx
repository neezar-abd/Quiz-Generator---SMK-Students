'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

type MCQ = { id: string; question: string; options: string[]; answerIndex: number; explanation?: string };

export default function PracticeAdaptive() {
  const params = useParams();
  const quizId = params.id as string;
  const [topic, setTopic] = useState<string>('');
  const [level, setLevel] = useState<string>('');
  const [q, setQ] = useState<MCQ | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<{ correct: boolean; answer: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ended, setEnded] = useState(false);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [attempted, setAttempted] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalMcq, setTotalMcq] = useState<number | null>(null);

  // Fetch first question and topic (best-effort: topic from URL search or fallback)
  useEffect(() => {
    const url = new URL(window.location.href);
    const t = url.searchParams.get('topic') || '';
    const lv = url.searchParams.get('level') || '';
    setTopic(t);
    setLevel(lv);
    // start fresh session
    setEnded(false);
    setSeenIds([]);
    setAttempted(0);
    setCorrectCount(0);
    setTotalMcq(null);
    fetchNext(quizId, t, []);
  }, [quizId]);

  const fetchNext = async (id: string, t: string, exclude: string[] = [], excludeId?: string) => {
    setLoading(true);
    try {
      setError(null);
      const url = new URL(`/api/adaptive/next`, window.location.origin);
      url.searchParams.set('quizId', id);
      url.searchParams.set('topic', t);
      if (excludeId) url.searchParams.set('excludeId', excludeId);
      if (exclude.length) url.searchParams.set('exclude', exclude.join(','));
      const res = await fetch(url.toString());
      if (!res.ok) {
        if (res.status === 401) {
          setError('Anda belum login. Silakan login terlebih dahulu.');
        } else if (res.status === 404) {
          setError('Kuis tidak ditemukan atau tidak memiliki soal MCQ.');
        } else {
          const text = await res.text();
          setError(`Gagal memuat soal: ${res.status} ${text}`);
        }
        setQ(null);
        return;
      }
      const data = await res.json();
      if (data?.meta?.totalMcq != null) setTotalMcq(Number(data.meta.totalMcq) || 0);
      if (!data.question) {
        // No question returned: end of session
        setQ(null);
        setEnded(true);
        return;
      }
      setQ(data.question);
      // Track seen
      setSeenIds(prev => (prev.includes(data.question.id) ? prev : [...prev, data.question.id]));
      setSelected(null);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    if (!q || selected == null) return;
    const correct = selected === q.answerIndex;
    setResult({ correct, answer: q.answerIndex });
    setAttempted(prev => prev + 1);
    if (correct) setCorrectCount(prev => prev + 1);
    try {
      await fetch('/api/adaptive/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId, mcqId: q.id, topic: topic || 'General', correct, answerIndex: selected, level }),
      });
    } catch {
      setError('Pencatatan jawaban gagal. Pastikan database sudah tersinkron (prisma db push).');
    }
  };

  const restart = () => {
    setEnded(false);
    setSeenIds([]);
    setAttempted(0);
    setCorrectCount(0);
    setQ(null);
    setSelected(null);
    setResult(null);
    fetchNext(quizId, topic || '', []);
  };

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="mx-auto max-w-2xl bg-white border border-black/10 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Adaptive Practice</h1>
          <Link href={`/quiz/${quizId}`} className="text-sm text-black/60 hover:text-black">Back to quiz</Link>
        </div>

        {loading && <div className="text-black/60">Loading question…</div>}

        {error && (
          <div className="mb-4 p-3 border border-red-200 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {ended && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Sesi Selesai</h2>
            <div className="text-black/80">
              {totalMcq != null ? (
                <>
                  <p>Total Soal: {totalMcq}</p>
                  <p>Dicoba: {attempted} • Benar: {correctCount} • Salah: {Math.max(0, attempted - correctCount)}</p>
                  <p className="font-medium">Skor: {attempted > 0 ? Math.round((correctCount / attempted) * 100) : 0}%</p>
                </>
              ) : (
                <>
                  <p>Dicoba: {attempted}</p>
                  <p>Benar: {correctCount}</p>
                  <p className="font-medium">Skor: {attempted > 0 ? Math.round((correctCount / attempted) * 100) : 0}%</p>
                </>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={restart} className="px-4 py-2 rounded-lg bg-black text-white">Mulai Ulang</button>
              <Link href={`/quiz/${quizId}`} className="px-4 py-2 rounded-lg border border-black/20 hover:bg-black/5">Kembali ke Kuis</Link>
              <Link href="/dashboard" className="px-4 py-2 rounded-lg border border-black/20 hover:bg-black/5">Dashboard</Link>
            </div>
          </div>
        )}

        {q && (
          <div>
            <div className="font-medium mb-4">{q.question}</div>
            <div className="grid gap-2">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={`text-left px-4 py-3 rounded-lg border transition-colors ${selected === i ? 'border-black bg-black/5' : 'border-black/20 hover:bg-black/5'}`}
                >
                  <span className="mr-2 font-mono">{String.fromCharCode(65 + i)}.</span>{opt}
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={submit}
                disabled={selected == null}
                className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50"
              >
                Submit
              </button>
              {result && (
                <>
                  <span className={result.correct ? 'text-green-600' : 'text-red-600'}>
                    {result.correct ? 'Correct!' : 'Incorrect.'}
                  </span>
                  {q.explanation && (
                    <span className="text-black/60"> Explanation: {q.explanation}</span>
                  )}
                  <button
                    onClick={() => fetchNext(quizId, topic, seenIds, q.id)}
                    className="ml-auto px-3 py-2 text-sm border border-black/20 rounded-lg hover:bg-black/5"
                  >
                    Next
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {!loading && !q && !ended && (
          <div className="text-black/70">
            <p className="mb-3">Belum ada soal yang bisa dipraktikkan.</p>
            <div className="flex items-center gap-3">
              <Link href="/upload" className="px-4 py-2 rounded-lg bg-black !text-white">
                Buat Kuis Dulu
              </Link>
              <Link href="/dashboard" className="px-4 py-2 rounded-lg border border-black/20 hover:bg-black/5">
                Lihat Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
