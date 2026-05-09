import { Link } from 'react-router-dom'
import SiteHeader from '../components/layout/SiteHeader.jsx'

export default function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col bg-cream text-ink">
      <SiteHeader />
      <main className="flex flex-1 flex-col justify-center px-5 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Play online
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Minimal chess.{' '}
            <span className="text-primary">Serious matches.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-ink/70">
            Pair with opponents, track games, and focus on the board—not the
            noise.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/signup"
              className="inline-flex rounded-full bg-primary px-6 py-3 text-sm font-medium text-cream transition-opacity hover:opacity-90"
            >
              Create account
            </Link>
            <Link
              to="/login"
              className="inline-flex rounded-full border border-accent bg-cream px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-ink/20"
            >
              I have an account
            </Link>
          </div>
        </div>
        <div className="mx-auto mt-20 grid max-w-4xl gap-6 sm:grid-cols-3">
          {[
            {
              title: 'Matchmaking',
              body: 'Queue and get paired when both players are ready.',
            },
            {
              title: 'Live games',
              body: 'Socket-backed updates so every move lands in real time.',
            },
            {
              title: 'Clean UI',
              body: 'Cream fields, deep ink type, and a single accent red.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-accent bg-cream p-6 text-left"
            >
              <h2 className="text-base font-semibold text-ink">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
