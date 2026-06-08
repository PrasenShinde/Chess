import { useParams } from "react-router-dom";
import SiteHeader from "../components/layout/SiteHeader.jsx";

export default function Playing() {
  const { roomId } = useParams();

  return (
    <div className="min-h-svh bg-cream text-ink flex flex-col">
      <SiteHeader />
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 flex-1 flex flex-col items-center">
        <header className="mb-8 text-center border-b border-accent w-full pb-6">
          <h1 className="text-2xl font-bold">Game Session</h1>
          <p className="text-ink/60 font-mono mt-2 text-sm">Room ID: {roomId}</p>
        </header>

        <div className="w-full max-w-4xl aspect-square bg-[#E5E0D8] border border-accent rounded-xl shadow-sm flex items-center justify-center">
          <p className="text-2xl font-bold text-ink/40">Active Game Board (Coming Soon)</p>
        </div>
      </main>
    </div>
  );
}
