'use client';

import QuizCard from './QuizCard';

// Extracted from original hardcoded dataset
const QUIZ_DATA: import('@/types/quiz').ExternalQuiz[] = [
  { title: "Alloy Interactive Game 🎮", description: "Play the interactive ZEP alloy game and test your knowledge in a fun way.", platform: "zep", url: "https://zep.us/play/2eg9Xq", topic: "8.1 Alloys", emoji: "🎮" },
  { title: "Alloy Knowledge Check ⚡", description: "Discover how alloys are made and why they outperform pure metals in industries.", platform: "kahoot", url: "https://kahoot.it/challenge/06692994", topic: "8.1 Alloys", emoji: "⚡" },
  { title: "The Alloy Challenge 💣", description: "Compete in quizzes and puzzles to match alloys with their components, properties, and applications.", platform: "wayground", url: "https://app.wayground.io/play/54", topic: "8.1 Alloys", emoji: "💣" },
  { title: "Glass Fundamentals", description: "Learn about the types of glass and their specific industrial uses.", platform: "kahoot", url: "https://kahoot.it/challenge/06692994", topic: "8.2 Glass", emoji: "🔍" },
  { title: "Ceramics Overview", description: "Explore traditional and advanced ceramics and their unique properties.", platform: "wayground", url: "https://app.wayground.io/play/54", topic: "8.3 Ceramics", emoji: "🏺" },
  { title: "Composites Deep Dive", description: "Understand how composite materials are formed by combining different substances.", platform: "zep", url: "https://zep.us/play/8rP1oO", topic: "8.4 Composites", emoji: "🏗️" }
];

export default function QuizGrid({ activeFilter }: { activeFilter: string }) {
  const filtered = activeFilter === 'All' 
    ? QUIZ_DATA 
    : QUIZ_DATA.filter(q => q.topic === activeFilter);

  if (filtered.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 border-dashed">
        No quizzes found for {activeFilter}. Try generating one with AI!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filtered.map((quiz, idx) => (
        <QuizCard key={`${quiz.title}-${idx}`} quiz={quiz} index={idx} />
      ))}
    </div>
  );
}
