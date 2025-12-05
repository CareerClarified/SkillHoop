import LandingNavbar from '../components/landing/LandingNavbar';
import LandingHero from '../components/landing/LandingHero';
import ScrollSyncedCarousel from '../components/landing/ScrollSyncedCarousel';
import LandingFeatures from '../components/landing/LandingFeatures';
import LandingFooter from '../components/landing/LandingFooter';

export default function LandingPage() {
  // Data arrays from legacy code
  const useCases = [
    {
      title: 'AI Post Generator',
      desc: 'Generate authentic LinkedIn posts in minutes with AI that learns your voice and expertise.',
      tags: ['AI'],
      image: 'https://placehold.co/600x400/4f46e5/white?text=AI+Post+Generator',
    },
    {
      title: 'Professional Carousel Maker',
      desc: 'Create stunning multi-slide carousels with professional templates and AI content generation.',
      tags: ['Design'],
      image: 'https://placehold.co/600x400/be185d/white?text=Carousel+Maker',
    },
    {
      title: 'Content Repurposing Engine',
      desc: 'Transform existing articles, videos, and podcasts into multiple LinkedIn post formats.',
      tags: ['Content'],
      image: 'https://placehold.co/600x400/059669/white?text=Repurposing+Engine',
    },
    {
      title: 'Thought Leadership Engine',
      desc: 'Build authority with AI-powered content strategy and trending topic identification.',
      tags: ['Strategy'],
      image: 'https://placehold.co/600x400/d97706/white?text=Leadership+Engine',
    },
  ];

  const useCases2 = [
    {
      title: 'Smart Resume Studio',
      desc: 'AI-powered resume optimization with real-time ATS scoring and master/campaign resume management.',
      tags: ['Resume'],
      image: 'https://placehold.co/600x400/1d4ed8/white?text=Resume+Studio',
    },
    {
      title: 'Application Tailor',
      desc: 'Create laser-focused applications tailored to specific job postings with AI analysis.',
      tags: ['Applications'],
      image: 'https://placehold.co/600x400/9333ea/white?text=Application+Tailor',
    },
    {
      title: 'Job Finder & Tracker',
      desc: 'AI-powered job discovery with Kanban-style application pipeline management.',
      tags: ['Jobs'],
      image: 'https://placehold.co/600x400/c026d3/white?text=Job+Tracker',
    },
    {
      title: 'Interview Prep Kit',
      desc: 'AI mock interviews, question banks, and performance analytics for interview mastery.',
      tags: ['Interview'],
      image: 'https://placehold.co/600x400/db2777/white?text=Interview+Prep',
    },
  ];

  const useCases3 = [
    {
      title: 'Skill Radar',
      desc: 'Live market intelligence tracking rising skills and high-ROI learning opportunities.',
      tags: ['Radar'],
      image: 'https://placehold.co/600x400/7c3aed/white?text=Skill+Radar',
    },
    {
      title: 'Learning Sprints',
      desc: 'Focused 2-3 week learning missions with tangible deliverables and portfolio artifacts.',
      tags: ['Sprints'],
      image: 'https://placehold.co/600x400/6d28d9/white?text=Learning+Sprints',
    },
    {
      title: 'Certification Planning',
      desc: 'Strategic certification roadmap with study guides and market value analysis.',
      tags: ['Certs'],
      image: 'https://placehold.co/600x400/5b21b6/white?text=Cert+Planning',
    },
    {
      title: 'Skill Benchmarking',
      desc: 'Real-time comparison against market demand with weekly alignment scoring.',
      tags: ['Benchmark'],
      image: 'https://placehold.co/600x400/4c1d95/white?text=Benchmarking',
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900">
      <LandingNavbar />

      <main className="flex-grow">
        <LandingHero />

        {/* Render the 3 Carousels with their specific IDs and Data */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ScrollSyncedCarousel useCases={useCases} id="carousel1" />

          <div className="py-12 text-center">
            <h3 className="text-3xl font-bold">Land Your Dream Job Faster</h3>
          </div>

          <ScrollSyncedCarousel useCases={useCases2} id="carousel2" />

          <div className="py-12 text-center">
            <h3 className="text-3xl font-bold">Stay Ahead of Market Demands</h3>
          </div>

          <ScrollSyncedCarousel useCases={useCases3} id="carousel3" />
        </div>

        <LandingFeatures />
      </main>

      <LandingFooter />
    </div>
  );
}
