// Simple adaptive rating and spaced repetition helpers

export type EloUpdateInput = {
  rating: number; // current rating
  correct: boolean;
  opponent?: number; // difficulty proxy (1000-1600)
};

export function updateElo({ rating, correct, opponent = 1200 }: EloUpdateInput) {
  const K = 24; // learning rate
  const expected = 1 / (1 + Math.pow(10, (opponent - rating) / 400));
  const score = correct ? 1 : 0;
  const next = rating + K * (score - expected);
  return Math.max(800, Math.min(2000, next));
}

// Spaced repetition schedule (simplified SM-2)
export function nextReviewDate(current: Date, streak: number, correct: boolean) {
  const base = new Date(current);
  let days: number;
  if (!correct) {
    days = 1; // immediate short review
  } else {
    if (streak <= 1) days = 1;
    else if (streak === 2) days = 3;
    else days = Math.min(30, Math.round(Math.pow(1.9, streak))); // grows quickly
  }
  base.setDate(base.getDate() + days);
  return base;
}

export function difficultyFromQuizLevel(level?: string) {
  // Map level to opponent ELO baseline
  switch ((level || '').toUpperCase()) {
    case 'XII': return 1350;
    case 'XI': return 1250;
    case 'X': return 1150;
    default: return 1200;
  }
}
