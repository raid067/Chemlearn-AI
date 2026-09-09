'use client';

import QuizCard from './QuizCard';

// Extracted from original hardcoded dataset
const QUIZ_DATA: import('@/types/quiz').ExternalQuiz[] = [
  {
    title: "Alloy Interactive Game🎮",
    description: "Play the interactive ZEP alloy game and test your knowledge in a fun way.",
    platform: "zep",
    url: "https://quiz.zep.us/en/play/3PlvVn",
    topic: "8.1 Alloys",
    emoji: "🎮"
  },
  {
    title: "Alloy Knowledge Check⚡",
    description: "Discover how alloys are made and why they outperform pure metals in industries.",
    platform: "wayground",
    url: "https://wayground.com/assessment/6a201c79dafa64bc6c8030ff?source=lesson_share",
    topic: "8.1 Alloys",
    emoji: "⚡"
  },
  {
    title: "The Alloy Challenge💣",
    description: "Compete in quizzes and puzzles to match alloys with their components, properties, and applications.",
    platform: "kahoot",
    url: "https://create.kahoot.it/share/alloy-chapter-8-chemistry-form-4/de80f811-f0c0-4af9-9b67-8299d81f9a3d",
    topic: "8.1 Alloys",
    emoji: "💣"
  },
  {
    title: "Glass Learning Adventure🚀",
    description: "Explore the science behind glass production, properties, and everyday industrial applications effectively.",
    platform: "zep",
    url: "https://quiz.zep.us/en/play/N3LxKB",
    topic: "8.2 Glass",
    emoji: "🚀"
  },
  {
    title: "Glass Composition Challenge🧪",
    description: "Discover different types of glass and their unique properties, uses, and advantages today.",
    platform: "wayground",
    url: "https://wayground.com/quiz/6a1fb1a434e091a01d7a65dc",
    topic: "8.2 Glass",
    emoji: "🧪"
  },
  {
    title: "Understanding Modern Glass🔭",
    description: "Discover different glass types and their importance in everyday products and innovations.",
    platform: "kahoot",
    url: "https://create.kahoot.it/share/composition-of-glasses-and-its-uses-quiz/0de2a22e-dbdc-4dde-ab6b-0eebf251ec36",
    topic: "8.2 Glass",
    emoji: "🔭"
  },
  {
    title: "Ceramics Game Adventure🌟",
    description: "Discover the unique characteristics of ceramics and their importance in everyday applications.",
    platform: "zep",
    url: "https://quiz.zep.us/en/play/gGaYva",
    topic: "8.3 Ceramics",
    emoji: "🌟"
  },
  {
    title: "Ceramics Master Quiz🏆",
    description: "Challenge yourself with questions covering ceramic composition, properties, and industrial uses effectively.",
    platform: "wayground",
    url: "https://wayground.com/quiz/6a200355d035b7da125d9316",
    topic: "8.3 Ceramics",
    emoji: "🏆"
  },
  {
    title: "Ceramics Discovery Game🏺",
    description: "Learn about ceramic materials, their uses, and manufacturing processes through interactive gameplay.",
    platform: "kahoot",
    url: "https://create.kahoot.it/share/ceramics/b06df91c-9b6b-497f-84e3-ac22827666e0",
    topic: "8.3 Ceramics",
    emoji: "🏺"
  },
  {
    title: "Composite Knowledge Quest⚗️",
    description: "Test your understanding of composite structures, applications, and advantages through interactive challenges.",
    platform: "zep",
    url: "https://quiz.zep.us/en/play/lp3vWq",
    topic: "8.4 Composites",
    emoji: "⚗️"
  },
  {
    title: "Composite Materials Challenge💡",
    description: "Strengthen your knowledge of composites through engaging questions and practical real-world examples.",
    platform: "wayground",
    url: "https://wayground.com/assessment/6a202ca7005da20de47aed2b?source=lesson_share",
    topic: "8.4 Composites",
    emoji: "💡"
  },
  {
    title: "Composite Trivia Challenge🎯",
    description: "Compete with your classmates to solve questions, puzzles, and tasks about composite materials and their applications.",
    platform: "kahoot",
    url: "https://kahoot.it/solo?quizId=dabc1a27-04b8-4967-b60f-4f37f163e2a5",
    topic: "8.4 Composites",
    emoji: "🎯"
  }
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
