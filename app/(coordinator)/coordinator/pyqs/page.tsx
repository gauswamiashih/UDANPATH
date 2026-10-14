"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Trash2,
  ExternalLink,
  Search,
  Download,
  Filter,
  CheckCircle2,
  X,
  FileCode,
  Calendar,
  Layers,
  BookMarked,
} from "lucide-react";
import {
  getCoordinatorResources,
  saveCoordinatorResources,
  ResourceItem,
} from "@/lib/coordinatorService";

export default function CoordinatorPYQsPage() {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [stage, setStage] = useState("Official Question Paper");
  const [type, setType] = useState<"pyq" | "solution" | "notes">("pyq");
  const [examName, setExamName] = useState("GATE CSE");
  const [url, setUrl] = useState("");
  const [fileSize, setFileSize] = useState("4.2 MB");

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = () => {
    setResources(getCoordinatorResources());
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to remove this paper/resource?")) return;
    const updated = resources.filter((item) => item.id !== id);
    saveCoordinatorResources(updated);
    setResources(updated);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    const newItem: ResourceItem = {
      id: "res_" + Date.now(),
      examId: examName.toLowerCase().replace(/\s+/g, '-'),
      title: title.trim(),
      year: year.trim() || "2025",
      stage: stage.trim() || "Official Question Paper",
      type: type,
      examName: examName,
      url: url.trim(),
      fileSize: fileSize.trim() || "3.5 MB",
      isFree: true,
      status: "Live",
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updated = [newItem, ...resources];
    saveCoordinatorResources(updated);
    setResources(updated);

    // Reset and close
    setTitle("");
    setUrl("");
    setIsAddModalOpen(false);
  };

  const filteredResources = resources.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.year ? item.year.includes(searchQuery) : false) ||
      (item.examName && item.examName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === "ALL" || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-emerald-900/30 via-teal-900/20 to-slate-900/40 border border-emerald-500/20 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              Upload PYQs & Resources
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                CRUD Library
              </span>
            </h1>
            <p className="text-sm text-slate-400">
              Manage previous year question papers, official answer keys, and reference PDFs synchronized with student detail views.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium shadow-lg shadow-emerald-500/25 transition-all text-sm shrink-0"
        >
          <Plus className="w-4 h-4" /> Upload / Add PYQ Paper
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 ml-1 shrink-0" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Type:
          </span>
          {["ALL", "pyq", "solution", "notes"].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all shrink-0 ${
                typeFilter === t
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {t === "ALL" ? "All Files" : t}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search papers by year, title, exam..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-800/90 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Grid of PYQs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800">
            <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-300 font-medium">No PYQ resources found</p>
            <p className="text-xs text-slate-500 mt-1">
              Add a new paper or clear your search criteria to see stored resources.
            </p>
          </div>
        ) : (
          filteredResources.map((res) => {
            const isSolution = res.type === "solution";
            const isNotes = res.type === "notes";

            return (
              <div
                key={res.id}
                className="group relative flex flex-col justify-between p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90 transition-all duration-200"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        isSolution
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          : isNotes
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}
                    >
                      {res.type.toUpperCase()}
                    </span>

                    <span className="text-xs font-mono font-medium text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {res.year}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
                    {res.title}
                  </h3>

                  {/* Metadata */}
                  <div className="mt-2 space-y-1 text-xs text-slate-400">
                    <p className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-slate-300">{res.examName || "GATE CSE"}</span>
                      <span className="text-slate-600">•</span>
                      <span>{res.stage}</span>
                    </p>
                    {res.fileSize && (
                      <p className="text-[11px] text-slate-500 font-mono">Size: {res.fileSize}</p>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" /> Open / Download
                  </a>

                  <button
                    onClick={() => handleDelete(res.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete Resource"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add PYQ Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Upload / Add PYQ Material</h3>
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
                  Paper / Material Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GATE CSE 2025 Shift-1 Official Question Paper"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Target Exam
                  </label>
                  <select
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="GATE CSE">GATE Computer Science</option>
                    <option value="UPSC CSE">UPSC Civil Services</option>
                    <option value="SSC CGL">SSC CGL</option>
                    <option value="CAT">CAT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Year Tag
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="2025"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Resource Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="pyq">Question Paper (PYQ)</option>
                    <option value="solution">Answer Key / Solutions</option>
                    <option value="notes">Reference Notes / Formula Sheet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Stage / Shift
                  </label>
                  <input
                    type="text"
                    placeholder="Shift-1 / Prelims / Mains"
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  PDF / Solution Document URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://gate2026.iitr.ac.in/papers/cs_2025.pdf"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Estimated File Size
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3.8 MB"
                  value={fileSize}
                  onChange={(e) => setFileSize(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
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
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 transition-all"
                >
                  Publish Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
