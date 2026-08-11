'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { 
  getMasterEducationLevels, 
  getMasterDegrees, 
  getMasterBranches, 
  getMasterStreams, 
  getMasterInterests, 
  getMasterCareerGoals,
  saveUserProfile
} from '@/lib/dbService';
import { 
  User, Calendar, MapPin, Award, CheckCircle, 
  ChevronLeft, ChevronRight, BookOpen, GraduationCap, Clock, Languages, HelpCircle
} from 'lucide-react';

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Master Data State
  const [masterEduLevels, setMasterEduLevels] = useState<any[]>([]);
  const [masterDegrees, setMasterDegrees] = useState<any[]>([]);
  const [masterStreams, setMasterStreams] = useState<any[]>([]);
  const [masterBranches, setMasterBranches] = useState<any[]>([]);
  const [masterInterests, setMasterInterests] = useState<any[]>([]);
  const [masterGoals, setMasterGoals] = useState<any[]>([]);

  // Profile Form State
  const [profile, setProfile] = useState({
    // Basic
    fullName: '',
    dob: '',
    gender: '',
    category: 'GENERAL',
    state: '',
    city: '',
    // Education
    educationLevelId: '',
    educationLevelName: '',
    degreeId: '',
    degreeName: '',
    streamId: '',
    streamName: '',
    branchId: '',
    branchName: '',
    // Academic
    status: '',
    semester: '',
    cgpa: '',
    // Interests & Goals
    interests: [] as string[],
    goalId: '',
    goalName: '',
    // Prep & Study Preferences
    preparationStatus: '',
    studyHours: '',
    mode: '',
    language: '',
    targetYear: ''
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        if (session.user.user_metadata?.full_name) {
          setProfile(p => ({ ...p, fullName: session.user.user_metadata.full_name }));
        }
      } else {
        setUser({ id: 'dummy-user-id', email: 'aspirant@udanpath.in' });
      }
    };
    checkUser();
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    try {
      const [levels, interests, goals] = await Promise.all([
        getMasterEducationLevels(),
        getMasterInterests(),
        getMasterCareerGoals()
      ]);
      setMasterEduLevels(levels || []);
      setMasterInterests(interests || []);
      setMasterGoals(goals || []);
    } catch (e) {
      console.error("Failed to load master data", e);
    }
  };

  const handleEduLevelChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const levelId = e.target.value;
    const level = masterEduLevels.find(l => l.id === levelId);
    setProfile(p => ({ ...p, educationLevelId: levelId, educationLevelName: level?.name || '', degreeId: '', streamId: '', branchId: '' }));
    
    if (levelId) {
      const [degrees, streams] = await Promise.all([
        getMasterDegrees(levelId),
        getMasterStreams(levelId)
      ]);
      setMasterDegrees(degrees || []);
      setMasterStreams(streams || []);
      setMasterBranches([]); // Reset branches
    }
  };

  const handleDegreeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const degreeId = e.target.value;
    const degree = masterDegrees.find(d => d.id === degreeId);
    setProfile(p => ({ ...p, degreeId, degreeName: degree?.name || '', branchId: '' }));
    
    if (degreeId) {
      const branches = await getMasterBranches(degreeId);
      setMasterBranches(branches || []);
    }
  };

  const handleInterestToggle = (id: string) => {
    setProfile(p => {
      const newInterests = p.interests.includes(id) 
        ? p.interests.filter(i => i !== id)
        : [...p.interests, id];
      return { ...p, interests: newInterests };
    });
  };

  const handleNext = () => { if (step < 10) setStep(step + 1); };
  const handleBack = () => { if (step > 1) setStep(step - 1); };

  const handleSubmit = async () => {
    setLoading(true);
    // Save locally
    localStorage.setItem('udanpath_onboarding_profile', JSON.stringify(profile));

    // Save to normalized tables via API
    if (user && user.id !== 'dummy-user-id') {
      await saveUserProfile(user.id, profile);
    }
    
    setLoading(false);
    router.push('/dashboard');
  };

  const stepLabels = [
    "Basic Info", "Education Level", "Academic Details", "Interests", 
    "Career Goals", "Prep Status", "Location", "Study Preferences", 
    "Review", "Complete"
  ];
  const totalSteps = 10;
  const pctComplete = Math.round((step / totalSteps) * 100);

  const updateProfile = (key: keyof typeof profile, value: any) => {
    setProfile(p => ({ ...p, [key]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 relative overflow-hidden select-none">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-xl bg-card border border-border rounded-2xl p-8 shadow-xl relative z-10">
        
        {/* Progress header */}
        <div className="flex justify-between items-center border-b border-border pb-4 mb-6">
          <div className="flex flex-col">
            <span className="text-[0.72rem] font-bold text-text-subtle uppercase tracking-wider">Advanced Onboarding</span>
            <strong className="text-[1.05rem] font-extrabold mt-0.5">
              Step {step} of {totalSteps} — {stepLabels[step - 1]}
            </strong>
          </div>
          <span className="text-sm font-bold text-primary">{pctComplete}%</span>
        </div>

        <div className="w-full bg-background h-1.5 rounded-full overflow-hidden mb-8">
          <div className="bg-primary h-full transition-all duration-300 rounded-full" style={{ width: `${pctComplete}%` }}></div>
        </div>

        {/* STEP 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold mb-1">Let's start with the basics</h3>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted">Full Name</label>
              <input type="text" value={profile.fullName} onChange={(e) => updateProfile('fullName', e.target.value)} placeholder="Enter your full name" className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary font-semibold" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted">Date of Birth</label>
                <input type="date" value={profile.dob} onChange={(e) => updateProfile('dob', e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary font-semibold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted">Gender (Optional)</label>
                <select value={profile.gender} onChange={(e) => updateProfile('gender', e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary font-semibold">
                  <option value="">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted">Category (Used for official eligibility rules)</label>
              <select value={profile.category} onChange={(e) => updateProfile('category', e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary font-semibold">
                <option value="GENERAL">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
                <option value="PWD">PWD</option>
                <option value="NOT_SPECIFIED">Prefer not to specify</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 2: Education Level */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold mb-1">Current Education Level</h3>
            <p className="text-xs text-text-muted">Select your highest level of education to personalize exams and streams.</p>
            <div className="space-y-1.5">
              <select value={profile.educationLevelId} onChange={handleEduLevelChange} className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary font-semibold">
                <option value="">-- Select Education Level --</option>
                {masterEduLevels.map(lvl => (
                  <option key={lvl.id} value={lvl.id}>{lvl.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* STEP 3: Academic Background */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold mb-1">Academic Specifics</h3>
            
            {masterDegrees.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted">Degree</label>
                <select value={profile.degreeId} onChange={handleDegreeChange} className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary font-semibold">
                  <option value="">-- Select Degree --</option>
                  {masterDegrees.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            )}

            {masterBranches.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted">Branch / Specialization</label>
                <select value={profile.branchId} onChange={(e) => {
                  const branch = masterBranches.find(b => b.id === e.target.value);
                  setProfile(p => ({ ...p, branchId: e.target.value, branchName: branch?.name || '' }));
                }} className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary font-semibold">
                  <option value="">-- Select Branch --</option>
                  {masterBranches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            )}

            {masterStreams.length > 0 && masterDegrees.length === 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted">Stream</label>
                <select value={profile.streamId} onChange={(e) => {
                  const stream = masterStreams.find(s => s.id === e.target.value);
                  setProfile(p => ({ ...p, streamId: e.target.value, streamName: stream?.name || '' }));
                }} className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary font-semibold">
                  <option value="">-- Select Stream --</option>
                  {masterStreams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted">Status</label>
                <select value={profile.status} onChange={(e) => updateProfile('status', e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary font-semibold">
                  <option value="">Select Status</option>
                  <option value="Currently Studying">Currently Studying</option>
                  <option value="Completed">Completed</option>
                  <option value="Dropped">Dropped / Gap Year</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted">Aggregate (CGPA/%)</label>
                <input type="number" step="0.1" value={profile.cgpa} onChange={(e) => updateProfile('cgpa', e.target.value)} placeholder="e.g. 8.5" className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary font-semibold" />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Interests */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold mb-1">Sectors of Interest</h3>
            <p className="text-xs text-text-muted mb-4">Select the sectors you would like to target for preparation recommendations:</p>
            <div className="max-h-60 overflow-y-auto pr-2 grid grid-cols-1 gap-2">
              {masterInterests.map(item => {
                const checked = profile.interests.includes(item.id);
                return (
                  <label key={item.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer select-none transition-colors ${checked ? 'bg-primary-light border-primary text-foreground' : 'bg-background border-border hover:bg-card-hover'}`}>
                    <input type="checkbox" checked={checked} onChange={() => handleInterestToggle(item.id)} className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">{item.category}: {item.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: Career Goals */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold mb-1">Primary Career Goal</h3>
            <div className="space-y-1.5">
              <select value={profile.goalId} onChange={(e) => {
                const goal = masterGoals.find(g => g.id === e.target.value);
                setProfile(p => ({ ...p, goalId: e.target.value, goalName: goal?.name || '' }));
              }} className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary font-semibold">
                <option value="">-- Select Your Dream Job --</option>
                {masterGoals.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* STEP 6: Prep Status */}
        {step === 6 && (
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold mb-1">Preparation Status</h3>
            <div className="space-y-1.5">
              <select value={profile.preparationStatus} onChange={(e) => updateProfile('preparationStatus', e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary font-semibold">
                <option value="">-- Select Status --</option>
                <option value="Not Started">Not Started / Just Exploring</option>
                <option value="Started Recently">Started Recently</option>
                <option value="Foundation Stage">Foundation Stage</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Revision & Mocks">Revision & Mocks Stage</option>
                <option value="Exam Ready">Exam Ready</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 7: Location */}
        {step === 7 && (
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold mb-1">Location Details</h3>
            <p className="text-xs text-text-muted">Used for offline coaching and state exam eligibility.</p>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted">State</label>
                <input type="text" value={profile.state} onChange={(e) => updateProfile('state', e.target.value)} placeholder="e.g. Gujarat" className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary font-semibold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted">City / District</label>
                <input type="text" value={profile.city} onChange={(e) => updateProfile('city', e.target.value)} placeholder="e.g. Ahmedabad" className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary font-semibold" />
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: Study Preferences */}
        {step === 8 && (
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold mb-1">Study Preferences</h3>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted">Daily Study Commitment</label>
              <select value={profile.studyHours} onChange={(e) => updateProfile('studyHours', e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary font-semibold">
                <option value="">Select Time</option>
                <option value="< 1 Hour">Less than 1 Hour</option>
                <option value="2-4 Hours">2 - 4 Hours</option>
                <option value="4-6 Hours">4 - 6 Hours</option>
                <option value="6-8 Hours">6 - 8 Hours</option>
                <option value="8+ Hours">8+ Hours (Intensive)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted">Preferred Mode</label>
              <select value={profile.mode} onChange={(e) => updateProfile('mode', e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary font-semibold">
                <option value="">Select Mode</option>
                <option value="Self Study">Self Study</option>
                <option value="Online Course">Online Course</option>
                <option value="Offline Coaching">Offline Coaching</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted">Preferred Language</label>
              <select value={profile.language} onChange={(e) => updateProfile('language', e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary font-semibold">
                <option value="">Select Language</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                <option value="Hinglish">Hinglish</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 9: Review */}
        {step === 9 && (
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold mb-1">Review Profile</h3>
            <p className="text-xs text-text-muted">Ensure everything is correct before generating your personalized path.</p>
            <div className="bg-background border border-border rounded-xl p-4 space-y-2.5 text-sm leading-relaxed font-semibold">
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-text-muted text-xs">Name:</span>
                <span>{profile.fullName || 'Not provided'}</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-text-muted text-xs">Location:</span>
                <span>{profile.city ? `${profile.city}, ` : ''}{profile.state || 'Not provided'}</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-text-muted text-xs">Education:</span>
                <span className="text-right">
                  {profile.educationLevelName} 
                  {profile.degreeName && ` - ${profile.degreeName}`} 
                  {profile.branchName && ` (${profile.branchName})`}
                  {profile.streamName && ` (${profile.streamName})`}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-text-muted text-xs">Career Goal:</span>
                <span>{profile.goalName || 'Not decided'}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-text-muted text-xs">Preparation:</span>
                <span>{profile.preparationStatus || 'Not started'} ({profile.mode})</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 10: Complete */}
        {step === 10 && (
          <div className="space-y-4 text-center py-6">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-extrabold mb-2">Profile Complete!</h3>
            <p className="text-sm text-text-muted">We have everything we need to personalize your UdanPath.</p>
          </div>
        )}

        {/* Action Button Navigation */}
        <div className="flex gap-4 mt-8 border-t border-border pt-5">
          {step > 1 && step < totalSteps && (
            <button onClick={handleBack} disabled={loading} className="flex-1 btn btn-secondary py-2.5 justify-center font-bold text-sm">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </button>
          )}

          {step < totalSteps - 1 ? (
            <button onClick={handleNext} className="flex-1 btn btn-primary py-2.5 justify-center font-bold text-sm shadow-md">
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          ) : step === totalSteps - 1 ? (
            <button onClick={handleNext} disabled={loading} className="flex-[1.5] btn btn-primary py-2.5 justify-center font-bold text-sm shadow-md bg-gradient-to-br from-primary to-secondary border-none text-white hover:brightness-110">
              Confirm & Continue
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} className="flex-1 btn btn-primary py-2.5 justify-center font-bold text-sm shadow-md bg-gradient-to-br from-primary to-secondary border-none text-white hover:brightness-110">
              {loading ? <span>Saving...</span> : <span className="flex items-center gap-1.5">Go to Dashboard <ChevronRight className="w-4 h-4" /></span>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
