export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function generateMatchId(): string {
  return Array.from({ length: 6 }, () =>
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(Math.floor(Math.random() * 36))
  ).join('');
}

export function getLevelTitle(quizScore: number): string {
  if (quizScore >= 80) return 'Master Chemist';
  if (quizScore >= 50) return 'Advanced Chemist';
  if (quizScore >= 20) return 'Apprentice Chemist';
  return 'Novice Chemist';
}

export function calcTotalXP(data: { quizScore?: number; streak?: number; xp?: number }): number {
  return Math.round(((data.quizScore || 0) * 8) + ((data.streak || 0) * 15) + (data.xp || 0));
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
