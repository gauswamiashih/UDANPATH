"use client";

import { useState, useEffect } from "react";
import {
  Scale,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Filter,
  CheckCircle2,
  GraduationCap,
  AlertCircle,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  getCoordinatorEligibility,
  saveCoordinatorEligibilityList,
  EligibilityRule,
} from "@/lib/coordinatorService";

export default function CoordinatorEligibilityPage() {
  const [rules, setRules] = useState<EligibilityRule[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [examName, setExamName] = useState("GATE (Graduate Aptitude Test)");
  const [qualifyingDegree, setQualifyingDegree] = useState("");
  const [minPercentage, setMinPercentage] = useState("Passing marks (No minimum aggregate percentage specified)");
  const [ageLimit, setAgeLimit] = useState("No upper or lower age limit");
  const [categoryRelaxation, setCategoryRelaxation] = useState("Standard fee concession for SC/ST/PwD/Female candidates");
  const [branches, setBranches] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = () => {
    setRules(getCoordinatorEligibility());
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this eligibility criterion?")) return;
    const updated = rules.filter((r) => r.id !== id);
    saveCoordinatorEligibilityList(updated);
    setRules(updated);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim() || !qualifyingDegree.trim()) return;

    const branchesArray = branches
      .split(",")
      .map((b) => b.trim())
      .filter(Boolean);

    const newRule: EligibilityRule = {
      id: "elig_" + Date.now(),
      examId: examName.toLowerCase().replace(/\s+/g, '-'),
      examName: examName.trim(),
      qualifyingDegree: qualifyingDegree.trim(),
      requiredDegrees: [qualifyingDegree.trim()],
      minPercentage: minPercentage.trim() || "Pass class",
      minimumPercentage: 0,
      ageLimit: ageLimit.trim() || "No age limit",
      categoryRelaxation: categoryRelaxation.trim() || "As per central government norms",
      branches: branchesArray.length > 0 ? branchesArray : ["All Recognized Engineering Branches"],
      eligibleBranches: branchesArray.length > 0 ? branchesArray : ["All Recognized Engineering Branches"],
      notes: notes.trim(),
      status: "Published",
      updatedAt: new Date().toLocaleDateString(),
    };

    const updated = [newRule, ...rules];
    saveCoordinatorEligibilityList(updated);
    setRules(updated);

    // Reset and close
    setQualifyingDegree("");
    setBranches("");
    setNotes("");
    setIsAddModalOpen(false);
  };

  const filteredRules = rules.filter((r) => {
    const q = searchQuery.toLowerCase();
    const exam = (r.examName || "").toLowerCase();
    const degree = (r.qualifyingDegree || r.requiredDegrees?.join(" ") || "").toLowerCase();
    const branchList = r.branches || r.eligibleBranches || [];
    return (
      exam.includes(q) ||
      degree.includes(q) ||
      branchList.some((b: string) => b.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-slate-900/40 border border-purple-500/20 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              Configure Eligibility Rules
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                CRUD Rules Engine
              </span>
            </h1>
            <p className="text-sm text-slate-400">
              Establish degree requirements, age limits, category relaxation norms, and eligible streams for competitive examinations.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium shadow-lg shadow-purple-500/25 transition-all text-sm shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Eligibility Rule
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Active Examinations: ({rules.length} configured)
          </span>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search exam, degree, branch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-800/90 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {filteredRules.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800">
            <Scale className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-300 font-medium">No eligibility rules found</p>
            <p className="text-xs text-slate-500 mt-1">
              Configure a new criteria rule using the button above.
            </p>
          </div>
        ) : (
          filteredRules.map((rule) => (
            <div
              key={rule.id}
              className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90 transition-all duration-200"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-800/70">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{rule.examName}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Qualifying Degree Requirement:{" "}
                      <span className="text-slate-200 font-semibold">
                        {rule.qualifyingDegree || rule.requiredDegrees?.join(", ") || "Bachelor's Degree"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  <button
                    onClick={() => handleDelete(rule.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete Rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Grid of parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 text-xs">
                {/* Age Criteria */}
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800/60">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Age Boundaries
                  </p>
                  <p className="text-slate-200 font-medium">
                    {rule.ageLimit || `${rule.minimumAge ?? 18} - ${rule.maximumAge ?? 32} years`}
                  </p>
                </div>

                {/* Min Percentage */}
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800/60">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Minimum Percentage
                  </p>
                  <p className="text-slate-200 font-medium">
                    {rule.minPercentage || (typeof rule.minimumPercentage === "number" && rule.minimumPercentage === 0 ? "Passing Marks (No min percentage)" : `${rule.minimumPercentage}%`)}
                  </p>
                </div>

                {/* Category Relaxation */}
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800/60">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-purple-400" /> Category Relaxation
                  </p>
                  <p className="text-slate-200 font-medium">
                    {typeof rule.categoryRelaxation === "string"
                      ? rule.categoryRelaxation
                      : typeof rule.ageRelaxation === "object"
                      ? Object.entries(rule.ageRelaxation).map(([k, v]) => `${k}: +${v} yrs`).join(", ")
                      : "Standard Govt Norms"}
                  </p>
                </div>
              </div>

              {/* Eligible Branches */}
              <div className="mt-4 pt-3 border-t border-slate-800/40">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Eligible Branches / Specializations:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(rule.branches || rule.eligibleBranches || []).map((b: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700/80 text-slate-300 text-xs font-medium"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Extra Notes */}
              {rule.notes && (
                <div className="mt-3 p-3 rounded-xl bg-blue-950/20 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
                  <span>{rule.notes}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Eligibility Rule Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Scale className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Add Eligibility Criterion</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Target Examination
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UPSC CSE / GATE CSE / SSC CGL"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500 placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Qualifying Degree & Standing
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B.E. / B.Tech / M.Sc / Final & 3rd-year enrolled students"
                  value={qualifyingDegree}
                  onChange={(e) => setQualifyingDegree(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500 placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Age Limit / Boundary
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 21 - 32 years or No age limit"
                    value={ageLimit}
                    onChange={(e) => setAgeLimit(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500 placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Minimum Percentage / CGPA
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Passing marks / 60% minimum"
                    value={minPercentage}
                    onChange={(e) => setMinPercentage(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500 placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Category Relaxation Norms
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5 years relaxation for SC/ST, 3 years for OBC, standard fee waiver"
                  value={categoryRelaxation}
                  onChange={(e) => setCategoryRelaxation(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500 placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Eligible Branches / Streams (comma-separated)
                </label>
                <textarea
                  rows={2}
                  placeholder="Computer Science, IT, Electronics, Electrical, Mathematics, Data Science"
                  value={branches}
                  onChange={(e) => setBranches(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500 placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Special Guidelines / Notification Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Candidates in their pre-final year are eligible to apply."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500 placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-purple-500/25 transition-all"
                >
                  Save Criterion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
