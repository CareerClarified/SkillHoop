import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, FileText, Briefcase, Target, Zap, CheckCircle2, Sparkles, 
  ArrowRight, TrendingUp, Activity, BookOpen, MessageSquare, Brain,
  FileCheck, Calendar
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import StatsOverview from '../components/dashboard/StatsOverview';
import AnalyticsCharts from '../components/dashboard/AnalyticsCharts';
import RecentActivity from '../components/dashboard/RecentActivity';

// MissionCard Component
interface MissionCardProps {
  title: string;
  description: string;
  actionLink: string;
  isLocked: boolean;
  isCompleted: boolean;
  icon: React.ReactNode;
  count?: number;
}

function MissionCard({ title, description, actionLink, isLocked, isCompleted, icon, count }: MissionCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!isLocked) {
      navigate(actionLink);
    } else {
      navigate('/pricing');
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      {/* Icon and Status */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-indigo-600">
          {icon}
        </div>
        {isLocked && (
          <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
            <Lock className="w-3 h-3" />
            <span>Locked</span>
          </div>
        )}
        {!isLocked && isCompleted && (
          <div className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            <span>Active</span>
          </div>
        )}
        {!isLocked && !isCompleted && (
          <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
            <Sparkles className="w-3 h-3" />
            <span>Start Here</span>
          </div>
        )}
      </div>

      {/* Title and Description */}
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 mb-4 line-clamp-2">{description}</p>

      {/* Count Display for Completed Missions */}
      {isCompleted && count !== undefined && (
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-600">{count}</span>
            <span className="text-sm text-slate-500">
              {count === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleClick}
        className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
          isLocked
            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700'
            : isCompleted
            ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700'
            : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'
        }`}
      >
        {isLocked ? 'Upgrade to Unlock' : isCompleted ? 'Manage' : 'Create'}
      </button>
    </div>
  );
}

export default function DashboardHome() {
  const [resumeCount, setResumeCount] = useState<number>(0);
  const [jobCount, setJobCount] = useState<number>(0);
  const [brandScore, setBrandScore] = useState<number | null>(null);
  const [creditsLeft, setCreditsLeft] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [userTier, setUserTier] = useState<'free' | 'pro' | 'ultimate'>('free');
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [jobsThisWeek, setJobsThisWeek] = useState<number>(0);
  const [dailyLimit, setDailyLimit] = useState<number>(0);
  const [usedToday, setUsedToday] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fetch all required data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Fetch user profile (name, tier, daily_limit)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, tier, daily_limit')
          .eq('id', user.id)
          .single();

        if (!profileError && profile) {
          setUserName(profile.full_name || user.email?.split('@')[0] || 'User');
          setUserTier((profile.tier as 'free' | 'pro' | 'ultimate') || 'free');
          setDailyLimit(profile.daily_limit ?? 0);
        } else {
          setUserName(user.email?.split('@')[0] || 'User');
        }

        // Fetch resume count and latest ATS score
        const { data: resumes, error: resumeError } = await supabase
          .from('resumes')
          .select('id, ats_score, atsScore')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (!resumeError && resumes) {
          setResumeCount(resumes.length);
          if (resumes.length > 0) {
            // Try both field name variations
            const latestResume = resumes[0] as any;
            const score = latestResume.ats_score ?? latestResume.atsScore ?? null;
            if (score !== null && score !== undefined) {
              setAtsScore(Number(score));
            }
          }
        }

        // Fetch job applications count and this week's count
        const { count: jobCountResult, error: jobError } = await supabase
          .from('job_applications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (!jobError) {
          setJobCount(jobCountResult || 0);
        }

        // Get jobs applied this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const oneWeekAgoISO = oneWeekAgo.toISOString();

        const { count: jobsThisWeekResult, error: jobsWeekError } = await supabase
          .from('job_applications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', oneWeekAgoISO);

        if (!jobsWeekError) {
          setJobsThisWeek(jobsThisWeekResult || 0);
        }

        // Fetch latest brand score
        const { data: brandAudit, error: brandError } = await supabase
          .from('brand_audits')
          .select('brand_score')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (brandError && brandError.code !== 'PGRST116') {
          console.error('Error fetching brand score:', brandError);
        } else if (brandAudit?.brand_score) {
          const score = brandAudit.brand_score as { overall?: number };
          setBrandScore(score?.overall ?? null);
        }

        // Get used_today from ai_usage_logs
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayISO = today.toISOString();

        const { count: usedTodayResult, error: usageError } = await supabase
          .from('ai_usage_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', todayISO);

        if (!usageError) {
          const used = usedTodayResult || 0;
          setUsedToday(used);
          const limit = profile?.daily_limit ?? 0;
          setCreditsLeft(Math.max(0, limit - used));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Determine focus widget content
  const getFocusWidget = () => {
    if (resumeCount === 0) {
      return {
        title: 'Build your Master Resume',
        description: 'Create your first professional resume to get started',
        link: '/dashboard/resume-studio',
        icon: <FileText className="w-8 h-8" />
      };
    } else if (brandScore === null) {
      return {
        title: 'Audit your Personal Brand',
        description: 'Analyze your brand across LinkedIn, GitHub, and portfolio',
        link: '/dashboard/brand-audit',
        icon: <Target className="w-8 h-8" />
      };
    } else if (jobCount === 0) {
      return {
        title: 'Track your first Job Application',
        description: 'Start tracking applications and get smart insights',
        link: '/dashboard/job-finder',
        icon: <Briefcase className="w-8 h-8" />
      };
    } else {
      return {
        title: 'Explore Upskilling Sprints',
        description: 'Level up your skills with personalized learning paths',
        link: '/dashboard',
        icon: <TrendingUp className="w-8 h-8" />
      };
    }
  };

  const focusWidget = getFocusWidget();
  const creditsPercentage = dailyLimit > 0 ? (usedToday / dailyLimit) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section - Focus Widget */}
      <div 
        className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-300"
        onClick={() => navigate(focusWidget.link)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{getGreeting()}, {userName}.</h1>
            <div className="mt-6">
              <div className="flex items-center gap-3 mb-2">
                {focusWidget.icon}
                <h2 className="text-2xl font-semibold">{focusWidget.title}</h2>
              </div>
              <p className="text-indigo-100 text-lg mb-4">{focusWidget.description}</p>
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-all">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Career Vitality Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Resume Health Card */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Resume Health</h3>
            </div>
          </div>
          {atsScore !== null ? (
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-indigo-600">{atsScore}</span>
                <span className="text-sm text-slate-500">ATS Score</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    atsScore >= 80 ? 'bg-green-500' : atsScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${atsScore}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="text-slate-600">
              <p className="text-lg font-medium">No Resume Found</p>
              <p className="text-sm mt-1">Create your first resume to see your ATS score</p>
            </div>
          )}
        </div>

        {/* Application Velocity Card */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Application Velocity</h3>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold text-green-600">{jobsThisWeek}</span>
              <span className="text-sm text-slate-500">Jobs Applied this week</span>
            </div>
            <p className="text-sm text-slate-600 mt-2">Total: {jobCount} applications</p>
          </div>
        </div>

        {/* AI Credits Card */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900">AI Credits</h3>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold text-purple-600">{creditsLeft ?? 0}</span>
              <span className="text-sm text-slate-500">remaining today</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, creditsPercentage)}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">{usedToday} / {dailyLimit} used</p>
          </div>
        </div>
      </div>

      {/* Tools Grid - Core Features */}
      <div ref={quickActionsRef}>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MissionCard
            title="Resume Studio"
            description="Create and manage professional resumes tailored to your target roles"
            actionLink="/dashboard/resume-studio"
            isLocked={false}
            isCompleted={resumeCount > 0}
            icon={<FileText className="w-6 h-6" />}
            count={resumeCount}
          />
          <MissionCard
            title="Job Tracker"
            description="Track and manage your job applications with smart insights"
            actionLink="/dashboard/job-finder"
            isLocked={false}
            isCompleted={jobCount > 0}
            icon={<Briefcase className="w-6 h-6" />}
            count={jobCount}
          />
          <MissionCard
            title="Brand Audit"
            description="Analyze your personal brand across LinkedIn, GitHub, and portfolio"
            actionLink="/dashboard/brand-audit"
            isLocked={false}
            isCompleted={brandScore !== null}
            icon={<Target className="w-6 h-6" />}
            count={brandScore !== null ? 1 : 0}
          />
          <MissionCard
            title="Cover Letter"
            description="Generate personalized cover letters for each application"
            actionLink="/dashboard/application-tailor"
            isLocked={false}
            isCompleted={false}
            icon={<MessageSquare className="w-6 h-6" />}
          />
          <MissionCard
            title="Interview Prep"
            description="Practice with AI-powered mock interviews and get feedback"
            actionLink="/dashboard/interview-prep"
            isLocked={userTier === 'free'}
            isCompleted={false}
            icon={<Brain className="w-6 h-6" />}
          />
          <MissionCard
            title="Content Engine"
            description="Generate professional content for LinkedIn, articles, and more"
            actionLink="/dashboard/content-engine"
            isLocked={userTier === 'free' || userTier === 'pro'}
            isCompleted={false}
            icon={<BookOpen className="w-6 h-6" />}
          />
        </div>
      </div>

      {/* Analytics & Stats Section */}
      {!isLoading && (resumeCount > 0 || jobCount > 0 || brandScore !== null) && (
        <div className="mt-8">
          <StatsOverview />
          <AnalyticsCharts />
        </div>
      )}

      {/* Recent Activity - Always visible */}
      <div className="mt-8">
        <RecentActivity />
      </div>
    </div>
  );
}
