'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { 
  User, Calendar, MapPin, Award, CheckCircle, 
  ChevronLeft, ChevronRight, BookOpen, GraduationCap, Clock, Languages, HelpCircle
} from 'lucide-react';

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Step 1: Basic
  const [name, setName] = useState('Aspirant');
  const [dob, setDob] = useState('2004-01-01');
  const [state, setState] = useState('Gujarat');
  const [category, setCategory] = useState('GENERAL');

  // Step 2: Education
  const [degree, setDegree] = useState('B.Tech');
  const [branch, setBranch] = useState('Computer Engineering');
  const [semester, setSemester] = useState('Graduated');

  // Step 3: Academics
  const [pct10, setPct10] = useState('85');
  const [pct12, setPct12] = useState('82');
  const [cgpa, setCgpa] = useState('8.2');

  // Step 4: Interests
  const [interests, setInterests] = useState<string[]>(['Government', 'Engineering']);

  // Step 5: Career Goal
  const [goal, setGoal] = useState('ISRO Scientist');

  // Step 6: Preferences
  const [studyHours, setStudyHours] = useState('6-8 Hours');
  const [language, setLanguage] = useState('English');
  const [mode, setMode] = useState('Online');

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        if (session.user.user_metadata?.full_name) {
          setName(session.user.user_metadata.full_name);
        }
      } else {
        // Dev fallback if not logged in
        setUser({ id: 'dummy-user-id', email: 'aspirant@udanpath.in' });
      }
    };
    checkUser();
  }, []);

  const handleInterestToggle = (val: string) => {
    if (interests.includes(val)) {
      setInterests(interests.filter(i => i !== val));
    } else {
      setInterests([...interests, val]);
    }
  };

  const handleNext = () => {
    if (step < 7) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const profile = {
      fullName: name,
      dob,
      category,
      education: degree,
      branch,
      cgpa: parseFloat(cgpa) || 8.0,
      semester,
      percent10: pct10,
      percent12: pct12,
      interests,
      goal,
      state,
      dreamJob: goal,
      studyHours,
      language,
      mode,
      onboardingCompleted: true,
      completedAt: new Date().toISOString()
    };

    // Save locally
    localStorage.setItem('udanpath_onboarding_profile', JSON.stringify(profile));

    // Save to Supabase student_profiles table
    if (user && user.id !== 'dummy-user-id') {
      try {
        const { error } = await supabase.from('student_profiles').insert([{
          user_id: user.id,
          date_of_birth: dob,
          category,
          state,
          highest_qualification: degree,
          stream: branch,
          percentage_aggregate: parseFloat(cgpa) || 8.0,
          target_exam_categories: interests,
        }]);

        if (error) console.error('Error saving profile to Supabase:', error.message);
      } catch (err) {
        console.error('Database connection failed, saved profile locally.', err);
      }
    }

    setLoading(false);
    router.push('/dashboard');
  };

  const stepLabels = [
    "Basic Details",
    "Education Qualification",
    "Academic Background",
    "Target Interests",
    "Career Goals",
    "Preparation Preference",
    "Profile Summary"
  ];

  const pctComplete = Math.round((step / 7) * 100);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 relative overflow-hidden select-none">
      
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-8 shadow-xl relative z-10">
        
        {/* Progress header */}
        <div className="flex justify-between items-center border-b border-border pb-4 mb-6">
          <div className="flex flex-col">
            <span className="text-[0.72rem] font-bold text-text-subtle uppercase tracking-wider">Onboarding Wizard</span>
            <strong className="text-[1.05rem] font-extrabold mt-0.5">
              Step {step} of 7 — {stepLabels[step - 1]}
            </strong>
          </div>
          <span className="text-sm font-bold text-primary">{pctComplete}%</span>
        </div>

        <div className="w-full bg-background h-1.5 rounded-full overflow-hidden mb-8">
          <div 
            className="bg-primary h-full transition-all duration-300 rounded-full"
            style={{ width: `${pctComplete}%` }}
          ></div>
        </div>

        {/* STEP 1: Basic Details */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold mb-1">Tell us about yourself</h3>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-subtle" />
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted">Date of Birth</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-subtle" />
                <input 
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted">State Domicile</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-subtle" />
                  <input 
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Gujarat"
                    className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors font-semibold"
                >
                  <option value="GENERAL">GENERAL</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Education */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold mb-1">Educational Background</h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted">Highest Degree</label>
              <select 
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors font-semibold"
              >
                <option value="B.Tech">B.Tech / B.E. (Engineering)</option>
                <option value="Graduate">Graduate (B.A / B.Sc / B.Com)</option>
                <option value="12th">12th Pass (Higher Secondary)</option>
                <option value="10th">10th Pass (Secondary)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted">Branch / Stream Specialization</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-subtle" />
                <input 
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g. Mechanical, Commerce"
                  className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted">Semester / Year status</label>
              <select 
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors font-semibold"
              >
                <option value="Semester 7">Semester 7 / 4th Year</option>
                <option value="Semester 8">Semester 8 / Final Year</option>
                <option value="Graduated">Graduated / Completed</option>
                <option value="12th Pass">Passed 12th</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 3: Academics */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold mb-1">Academic Performance</h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted">10th Standard Marks (%)</label>
              <input 
                type="number"
                value={pct10}
                onChange={(e) => setPct10(e.target.value)}
                placeholder="e.g. 85"
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted">12th Standard Marks (%)</label>
              <input 
                type="number"
                value={pct12}
                onChange={(e) => setPct12(e.target.value)}
                placeholder="e.g. 82"
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted">College CGPA (10 Scale) or aggregate %</label>
              <input 
                type="number"
                step="0.1"
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                placeholder="e.g. 8.2"
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors font-semibold"
              />
            </div>
          </div>
        )}

        {/* STEP 4: Interests */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold mb-1">Target Exam Categories</h3>
            <p className="text-xs text-text-muted mb-4">Select the sectors you would like to target for preparation recommendations:</p>

            <div className="grid grid-cols-1 gap-2">
              {[
                { key: 'Government', label: '🏛️ Government Technical Jobs (ISRO, DRDO)' },
                { key: 'Engineering', label: '💻 Engineering / Core Tech Jobs' },
                { key: 'Banking', label: '💳 Banking & Public Sector Financial' },
                { key: 'Civil Services', label: '👔 UPSC Civil Services' },
                { key: 'Defence', label: '🪖 Defence Officers (NDA / CDS)' },
                { key: 'Medical', label: '🩺 Medical & Health services' }
              ].map(item => {
                const checked = interests.includes(item.key);
                return (
                  <label 
                    key={item.key}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer select-none transition-colors ${
                      checked 
                        ? 'bg-primary-light border-primary text-foreground' 
                        : 'bg-background border-border hover:bg-card-hover'
                    }`}
                  >
                    <input 
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleInterestToggle(item.key)}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-sm font-semibold">{item.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: Career Goal */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold mb-1">Set Career Goal</h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted">Target Dream Job</label>
              <select 
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors font-semibold"
              >
                <option value="ISRO Scientist">ISRO Scientist / Engineer</option>
                <option value="DRDO Scientist">DRDO Defence Scientist</option>
                <option value="IAS Officer">IAS Officer (Civil Services)</option>
                <option value="Software Engineer Google">Software Engineer (Google/FAANG)</option>
                <option value="Bank PO">Bank Probationary Officer</option>
                <option value="Other">Other Custom Target</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 6: Preferences */}
        {step === 6 && (
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold mb-1">Preparation Preferences</h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted">Daily Study Commitment</label>
              <select 
                value={studyHours}
                onChange={(e) => setStudyHours(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors font-semibold"
              >
                <option value="6-8 Hours">6 - 8 Hours / Day (Intensive)</option>
                <option value="4-6 Hours">4 - 6 Hours / Day</option>
                <option value="2-4 Hours">2 - 4 Hours / Day (Part-time)</option>
                <option value="8+ Hours">8+ Hours / Day (Dedicated)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted">Preferred Study Medium Language</label>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors font-semibold"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Gujarati">Gujarati (ગુજરાતી)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted">Learning Mode</label>
              <select 
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors font-semibold"
              >
                <option value="Online">Online Self-Paced + Live</option>
                <option value="Hybrid">Hybrid (Online + Offline Mocks)</option>
                <option value="Offline">Offline Classroom Coaching</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 7: Summary Review */}
        {step === 7 && (
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold mb-1">Verify Your Profile</h3>
            <p className="text-xs text-text-muted">Review your information before generating your UdanPath.</p>

            <div className="bg-background border border-border rounded-xl p-4 space-y-2.5 text-sm leading-relaxed font-semibold">
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-text-muted text-xs">Name:</span>
                <span>{name} ({category})</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-text-muted text-xs">Domicile State:</span>
                <span>{state}</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-text-muted text-xs">Degree Major:</span>
                <span>{degree} in {branch}</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-text-muted text-xs">Academic Status:</span>
                <span>CGPA: {cgpa} | 10th: {pct10}% | 12th: {pct12}%</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-text-muted text-xs">Dream Goal:</span>
                <span>{goal}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-text-muted text-xs">Study Method:</span>
                <span>{studyHours}/day in {language} ({mode})</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Button Navigation */}
        <div className="flex gap-4 mt-8 border-t border-border pt-5">
          {step > 1 && (
            <button 
              onClick={handleBack}
              disabled={loading}
              className="flex-1 btn btn-secondary py-2.5 justify-center font-bold text-sm"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </button>
          )}

          {step < 7 ? (
            <button 
              onClick={handleNext}
              className="flex-1 btn btn-primary py-2.5 justify-center font-bold text-sm shadow-md"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="flex-[1.5] btn btn-primary py-2.5 justify-center font-bold text-sm shadow-md bg-gradient-to-br from-primary to-secondary border-none text-white hover:brightness-110"
            >
              {loading ? (
                <span>Generating Roadmap...</span>
              ) : (
                <span className="flex items-center gap-1.5">
                  Generate My UdanPath <CheckCircle className="w-4 h-4" />
                </span>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
