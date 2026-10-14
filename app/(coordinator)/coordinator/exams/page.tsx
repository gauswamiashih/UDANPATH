'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Target, Plus, Trash2, Search, Filter, ExternalLink, 
  Building2, GraduationCap, Globe, CheckCircle2, AlertTriangle, 
  X, RefreshCw, Sparkles, Layers, BookOpen, ShieldCheck, ChevronRight
} from 'lucide-react';
import { 
  Exam, 
  getMasterExams, 
  addMasterExam, 
  deleteMasterExam, 
  resetMasterExams 
} from '@/lib/coordinatorService';

export default function ManageExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'danger' } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    short_name: '',
    organization: '',
    category: 'Engineering',
    eligibility_tag: 'B.E. / B.Tech / Graduate',
    description: '',
    officialWebsite: '',
    minimum_age: 21,
    maximum_age: 32,
    application_status: 'Active',
    salary_range: '₹85,000 - ₹1,40,000 / month'
  });

  const loadExams = () => {
    const list = getMasterExams();
    setExams(list);
  };

  useEffect(() => {
    loadExams();

    const handleUpdate = (e: any) => {
      if (e.detail) {
        setExams(e.detail);
      } else {
        loadExams();
      }
    };

    window.addEventListener('udanpath_exams_updated', handleUpdate);
    return () => window.removeEventListener('udanpath_exams_updated', handleUpdate);
  }, []);

  const showNotification = (message: string, type: 'success' | 'danger' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.organization.trim()) {
      showNotification('Please fill in required fields (Exam Name & Conducting Body)', 'danger');
      return;
    }

    const newShortName = formData.short_name.trim() || formData.name.split(' ')[0].toUpperCase();
    const newId = newShortName.toLowerCase().replace(/[^a-z0-9]/g, '-');

    const newExamObj: Partial<Exam> = {
      id: newId,
      dbId: newId,
      name: formData.name.trim(),
      short_name: newShortName,
      title: formData.name.trim(),
      code: newShortName,
      organization: formData.organization.trim(),
      conductingBody: formData.organization.trim(),
      category: formData.category,
      category_name: formData.category,
      category_id: null,
      description: formData.description.trim() || `${formData.name} is a premier national examination conducted by ${formData.organization}.`,
      officialWebsite: formData.officialWebsite.trim() || 'https://upsc.gov.in',
      application_status: formData.application_status,
      minimum_age: Number(formData.minimum_age) || 18,
      maximum_age: Number(formData.maximum_age) || 32,
      qualification_levels: [formData.eligibility_tag || 'Graduate'],
      degrees: [formData.eligibility_tag || 'Graduate'],
      branches: ['All Relevant Streams'],
      eligible_branches: ['All Relevant Streams'],
      nationality: 'Indian',
      salary_information: {
        pay_scale: formData.salary_range,
        approx_in_hand_monthly: 85000
      }
    };

    const updated = addMasterExam(newExamObj);
    setExams(updated);
    showNotification(`Exam "${formData.name}" registered successfully! Instantly synced to Student Discover & Dashboard.`);
    setIsAddModalOpen(false);
    // Reset form
    setFormData({
      name: '',
      short_name: '',
      organization: '',
      category: 'Engineering',
      eligibility_tag: 'B.E. / B.Tech / Graduate',
      description: '',
      officialWebsite: '',
      minimum_age: 21,
      maximum_age: 32,
      application_status: 'Active',
      salary_range: '₹85,000 - ₹1,40,000 / month'
    });
  };

  const confirmDelete = () => {
    if (!examToDelete) return;
    const deletedName = examToDelete.name || examToDelete.title || examToDelete.short_name;
    const updated = deleteMasterExam(examToDelete.id);
    setExams(updated);
    showNotification(`Exam "${deletedName}" permanently deleted from master catalog and student portals.`, 'danger');
    setExamToDelete(null);
  };

  const handleResetCatalog = () => {
    if (confirm('Are you sure you want to reset the master competitive exams catalog to default presets?')) {
      const def = resetMasterExams();
      setExams(def);
      showNotification('Master exams catalog restored to official default dataset.');
    }
  };

  // Filter exams
  const filteredExams = exams.filter(exam => {
    const examName = (exam.name || exam.title || '').toLowerCase();
    const shortName = (exam.short_name || exam.code || '').toLowerCase();
    const org = (exam.organization || exam.conductingBody || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = examName.includes(query) || shortName.includes(query) || org.includes(query);

    const matchesCategory = selectedCategory === 'all' || 
      (exam.category && exam.category.toLowerCase() === selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'Engineering', 'Civil Services', 'Defense', 'Medical', 'Banking'];

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-xl border text-xs font-bold shadow-lg flex items-center justify-between animate-in slide-in-from-top-4 ${
          notification.type === 'danger' 
            ? 'bg-danger/10 border-danger/30 text-danger' 
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'danger' ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="opacity-70 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-card to-card-hover border border-border p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[0.68rem] font-extrabold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              Exam Catalog Master Console
            </span>
            <span className="text-xs text-text-muted">• Real-Time Student Sync</span>
          </div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Manage Competitive Exams
          </h1>
          <p className="text-xs text-text-muted mt-1 max-w-2xl">
            Register new target examinations or delete obsolete ones. All actions immediately synchronize across student discovery catalog, recommendation engine, and ATS profile.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetCatalog}
            className="px-3.5 py-2.5 rounded-xl border border-border bg-background hover:bg-card-hover text-text-muted hover:text-foreground text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            title="Reset catalog to official defaults"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Register / Add Target Exam</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-[0.68rem] font-bold text-text-subtle uppercase">Total Master Exams</p>
          <p className="text-2xl font-black text-foreground mt-1">{exams.length}</p>
          <span className="text-[0.65rem] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live in Student View
          </span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-[0.68rem] font-bold text-text-subtle uppercase">Engineering Domain</p>
          <p className="text-2xl font-black text-primary mt-1">
            {exams.filter(e => (e.category || '').toLowerCase() === 'engineering').length}
          </p>
          <span className="text-[0.65rem] text-text-muted">GATE, ISRO, BARC, ESE</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-[0.68rem] font-bold text-text-subtle uppercase">Civil Services</p>
          <p className="text-2xl font-black text-amber-400 mt-1">
            {exams.filter(e => (e.category || '').toLowerCase().includes('civil')).length}
          </p>
          <span className="text-[0.65rem] text-text-muted">UPSC CSE, State PSC</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-[0.68rem] font-bold text-text-subtle uppercase">Active Applications</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {exams.filter(e => (e.application_status || '').toLowerCase() === 'active').length}
          </p>
          <span className="text-[0.65rem] text-text-muted">Open for aspirants</span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border p-3.5 rounded-2xl">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle" />
          <input
            type="text"
            placeholder="Search by exam name, short code, or authority..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize whitespace-nowrap transition-all ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-background hover:bg-card-hover border border-border text-text-muted hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Master Exams Listing Table / Cards */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-foreground flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <span>Active Master Catalog ({filteredExams.length} Exams)</span>
          </h2>
          <span className="text-[0.7rem] text-text-muted">
            All registered exams reflect immediately in student discovery
          </span>
        </div>

        {filteredExams.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center mb-3">
              <Target className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-foreground">No competitive exams found</p>
            <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
              No exams matched your search or category filter. You can add a new exam or reset to default catalog.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn btn-primary text-xs font-bold px-4 py-2 rounded-xl mt-4"
            >
              Add New Target Exam
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {filteredExams.map((exam) => {
              const displayName = exam.name || exam.title || 'Target Exam';
              const displayCode = exam.short_name || exam.code || exam.id.toUpperCase();
              const conducting = exam.conductingBody || exam.organization || 'Exam Authority';
              const category = exam.category || 'General';
              const website = exam.officialWebsite || 'https://upsc.gov.in';
              const status = exam.application_status || 'Active';
              const edu = exam.qualification_levels?.[0] || exam.degrees?.[0] || 'Graduate';

              return (
                <div 
                  key={exam.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-card-hover/40 transition-colors group"
                >
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary font-black text-xs">
                        {displayCode}
                      </span>
                      <h3 className="text-sm font-extrabold text-foreground truncate">
                        {displayName}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-extrabold uppercase tracking-wide bg-background border border-border text-text-muted">
                        {category}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[0.62rem] font-extrabold uppercase ${
                        status.toLowerCase() === 'active' 
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                          : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                      }`}>
                        {status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-text-subtle" />
                        {conducting}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-text-subtle" />
                        Min Eligibility: <strong className="text-foreground">{edu}</strong>
                      </span>
                      <span className="text-[0.7rem] text-text-subtle">
                        Age: {exam.minimum_age || 18} - {exam.maximum_age || 32} yrs
                      </span>
                    </div>

                    {exam.description && (
                      <p className="text-xs text-text-muted line-clamp-2 max-w-3xl pt-0.5">
                        {exam.description}
                      </p>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border/40">
                    <a
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl border border-border bg-background hover:bg-card-hover text-text-muted hover:text-primary transition-colors text-xs font-medium flex items-center gap-1"
                      title="Visit official authority portal"
                    >
                      <Globe className="w-4 h-4" />
                      <span className="hidden lg:inline text-[0.7rem]">Website</span>
                    </a>

                    {/* Delete Exam Button with Red Trash Icon */}
                    <button
                      onClick={() => setExamToDelete(exam)}
                      className="p-2 sm:px-3 sm:py-2 rounded-xl border border-danger/30 bg-danger/10 hover:bg-danger/20 text-danger transition-all text-xs font-bold flex items-center gap-1.5 group/del"
                      title="Permanently remove exam from master catalog"
                    >
                      <Trash2 className="w-4 h-4 text-danger group-hover/del:scale-110 transition-transform" />
                      <span className="hidden sm:inline">Delete Exam</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ==================== REGISTER / ADD NEW TARGET EXAM MODAL ==================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-card/90">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Target className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-foreground">Register Target Competitive Exam</h3>
                  <p className="text-[0.68rem] text-text-muted">Master entry will immediately reflect across student portal</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg border border-border hover:bg-card-hover"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateExam} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Exam Name */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-text-muted">
                    Exam Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. ISRO Scientist/Engineer 'SC' (ICRB)"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Short Code */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted">
                    Short Code / Acronym <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.short_name}
                    onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
                    placeholder="e.g. ISRO ICRB or GATE 2027"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Conducting Authority */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted">
                    Conducting Authority <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="e.g. ISRO / Dept of Space"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Category / Domain */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted">
                    Category / Domain
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-primary"
                  >
                    <option value="Engineering">Engineering & Technology</option>
                    <option value="Civil Services">Civil Services & Administration</option>
                    <option value="PSU">Public Sector Undertakings (PSU)</option>
                    <option value="Defense">Defense & Armed Forces</option>
                    <option value="Medical">Medical & Life Sciences</option>
                    <option value="Banking">Banking & Financial Services</option>
                  </select>
                </div>

                {/* Application Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted">
                    Application Status
                  </label>
                  <select
                    value={formData.application_status}
                    onChange={(e) => setFormData({ ...formData, application_status: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-primary"
                  >
                    <option value="Active">Active (Open for applications)</option>
                    <option value="Upcoming">Upcoming (Announced)</option>
                    <option value="Closed">Closed for this cycle</option>
                  </select>
                </div>

                {/* Eligibility Tag */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-text-muted">
                    Eligibility Tag & Required Degrees
                  </label>
                  <input
                    type="text"
                    value={formData.eligibility_tag}
                    onChange={(e) => setFormData({ ...formData, eligibility_tag: e.target.value })}
                    placeholder="e.g. B.E. / B.Tech (ECE/CSE/ME) with min. 65% marks"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Age Criteria */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted">
                    Minimum Age (Years)
                  </label>
                  <input
                    type="number"
                    value={formData.minimum_age}
                    onChange={(e) => setFormData({ ...formData, minimum_age: Number(e.target.value) })}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted">
                    Maximum Age (General)
                  </label>
                  <input
                    type="number"
                    value={formData.maximum_age}
                    onChange={(e) => setFormData({ ...formData, maximum_age: Number(e.target.value) })}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Website Link */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-text-muted">
                    Official Website Link
                  </label>
                  <input
                    type="url"
                    value={formData.officialWebsite}
                    onChange={(e) => setFormData({ ...formData, officialWebsite: e.target.value })}
                    placeholder="https://isro.gov.in/careers"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Short Description */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-text-muted">
                    Short Description & Career Scope
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide a comprehensive summary of exam format, posts offered, and career benefits..."
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-primary"
                  />
                </div>

              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-text-muted hover:bg-card-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary px-5 py-2.5 text-xs font-bold rounded-xl shadow-md"
                >
                  Register Exam in Master Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== DELETE CONFIRMATION MODAL ==================== */}
      {examToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-card border border-danger/30 rounded-2xl shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-danger/10 text-danger mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-foreground">
                Delete Target Examination?
              </h3>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                Are you sure you want to permanently remove <strong className="text-foreground">"{examToDelete.name || examToDelete.title || examToDelete.short_name}"</strong> from the master catalog?
              </p>
            </div>

            <div className="p-3 bg-danger/5 border border-danger/20 rounded-xl text-[0.72rem] text-danger text-left">
              ⚠️ <strong>Immediate Effect:</strong> This exam will vanish instantly from student discovery, recommendations, and preparation roadmaps.
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setExamToDelete(null)}
                className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-text-muted hover:bg-card-hover"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-danger text-white text-xs font-bold hover:bg-danger/90 shadow-md flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Permanent Deletion</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
