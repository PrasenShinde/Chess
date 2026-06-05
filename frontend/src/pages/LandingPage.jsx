import HeroSection from '../components/HeroSection.jsx';
import SiteHeader from '../components/layout/SiteHeader.jsx';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-cream text-ink">
      <div className="absolute top-0 left-0 w-full z-50">
        <SiteHeader />
      </div>
      <main className="flex-1">
        <HeroSection />
      </main>
    </div>
  );
}
