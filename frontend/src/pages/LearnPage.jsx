import SiteHeader from "../components/layout/SiteHeader.jsx";
import { Link } from "react-router-dom";

const lessons = [
  {
    title: "How the board works",
    body: "Each player starts with 16 pieces on an 8x8 board. White moves first, then players alternate turns.",
  },
  {
    title: "Winning the game",
    body: "Deliver checkmate, force resignation, or claim a win on time. Draws happen by stalemate, agreement, or repetition.",
  },
  {
    title: "Piece movement basics",
    body: "Pawns move forward, knights jump in L-shapes, bishops move diagonally, rooks move in straight lines, queens combine both, and kings move one square.",
  },
  {
    title: "Online etiquette",
    body: "Respect your opponent, avoid spamming moves, and use resign or draw offers when a position is clearly over.",
  },
];

export default function LearnPage() {
  return (
    <div className="min-h-svh bg-cream text-ink flex flex-col">
      <SiteHeader />
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 flex-1">
        <header className="mb-10 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Learn Chess
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Start with the essentials</h1>
          <p className="mt-4 text-ink/70">
            A quick guide before you jump into live matchmaking.
          </p>
        </header>

        <div className="grid gap-5">
          {lessons.map((lesson) => (
            <article
              key={lesson.title}
              className="rounded-2xl border border-accent bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold">{lesson.title}</h2>
              <p className="mt-3 text-ink/70 leading-relaxed">{lesson.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/signup"
            className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-cream transition-opacity hover:opacity-90"
          >
            Create account
          </Link>
          <Link
            to="/play"
            className="rounded-full border border-accent px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-ink/20"
          >
            Play now
          </Link>
        </div>
      </main>
    </div>
  );
}
