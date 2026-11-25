"use client";

import { useState, useEffect } from "react";
import {
  GraduationCap,
  Plus,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  X,
  Star,
  Users,
  Clock,
  Sparkles,
  Tag,
  DollarSign,
} from "lucide-react";
import {
  getCoordinatorCourses,
  saveCoordinatorCourses,
  CuratedCourse,
} from "@/lib/coordinatorService";

export default function CoordinatorCoursesPage() {
  const [courses, setCourses] = useState<CuratedCourse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [provider, setProvider] = useState("");
  const [instructor, setInstructor] = useState("");
  const [duration, setDuration] = useState("6 Months");
  const [price, setPrice] = useState("₹9,999");
  const [originalPrice, setOriginalPrice] = useState("₹19,999");
  const [rating, setRating] = useState("4.8");
  const [reviewsCount, setReviewsCount] = useState("1,200+");
  const [examCategory, setExamCategory] = useState("GATE CSE");
  const [badge, setBadge] = useState("Popular");
  const [featuresInput, setFeaturesInput] = useState("");
  const [affiliateUrl, setAffiliateUrl] = useState("https://example.com/batch");

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = () => {
    setCourses(getCoordinatorCourses());
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to remove this curated course/batch?")) return;
    const updated = courses.filter((c) => c.id !== id);
    saveCoordinatorCourses(updated);
    setCourses(updated);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !provider.trim()) return;

    const featuresArray = featuresInput
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    const newCourse: CuratedCourse = {
      id: "course_" + Date.now(),
      examId: examCategory.toLowerCase().replace(/\s+/g, '-'),
      name: title.trim(),
      title: title.trim(),
      provider: provider.trim(),
      instructor: instructor.trim() || "Top Subject Experts",
      duration: duration.trim() || "6 Months",
      price: price.trim() || "₹9,999",
      originalPrice: originalPrice.trim() || "₹19,999",
      rating: parseFloat(rating) || 4.8,
      reviewsCount: reviewsCount.trim() || "1,000+",
      examCategory: examCategory.trim() || "GATE CSE",
      examName: examCategory.trim() || "GATE CSE",
      badge: badge.trim() || "Featured",
      features:
        featuresArray.length > 0
          ? featuresArray
          : [
              "500+ Hours Live & Recorded Sessions",
              "Topic-wise DPPs & Video Solutions",
              "15 Full-length Mock Tests with All-India Ranking",
            ],
      highlights:
        featuresArray.length > 0
          ? featuresArray
          : [
              "500+ Hours Live & Recorded Sessions",
              "Topic-wise DPPs & Video Solutions",
            ],
      courseUrl: affiliateUrl.trim() || "https://example.com/course",
      affiliateUrl: affiliateUrl.trim() || "https://example.com/course",
      status: "Live",
      updatedAt: new Date().toLocaleDateString(),
    };

    const updated = [newCourse, ...courses];
    saveCoordinatorCourses(updated);
    setCourses(updated);

    // Reset and close
    setTitle("");
    setProvider("");
    setFeaturesInput("");
    setIsAddModalOpen(false);
  };

  const filteredCourses = courses.filter((c) => {
    const title = c.title || c.name || "";
    const category = c.examCategory || c.examName || "";
    const instructor = c.instructor || "";
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === "ALL" || category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const uniqueCategories = Array.from(
    new Set(courses.map((c) => c.examCategory || c.examName).filter((x): x is string => Boolean(x)))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-amber-900/30 via-orange-900/20 to-slate-900/40 border border-amber-500/20 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              Curate Courses & Batches
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                CRUD Catalog
              </span>
            </h1>
            <p className="text-sm text-slate-400">
              Manage recommended coaching batches, faculty details, and course discounts synced directly with the Student Courses portal.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-medium shadow-lg shadow-amber-500/25 transition-all text-sm shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New Course Recommendation
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 ml-1 shrink-0" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Target Exam:
          </span>
          <button
            onClick={() => setCategoryFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all shrink-0 ${
              categoryFilter === "ALL"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            All Exams
          </button>
          {uniqueCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                categoryFilter === cat
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                  : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search provider, batch, faculty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-800/90 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Course List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800">
            <GraduationCap className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-300 font-medium">No courses found</p>
            <p className="text-xs text-slate-500 mt-1">
              Add a new coaching batch recommendation to populate the catalog.
            </p>
          </div>
        ) : (
          filteredCourses.map((c) => (
            <div
              key={c.id}
              className="group flex flex-col justify-between rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90 transition-all duration-200 overflow-hidden"
            >
              <div className="p-5">
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {c.examCategory || c.examName || "GATE CSE"}
                  </span>
                  {c.badge && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      {c.badge}
                    </span>
                  )}
                </div>

                {/* Course Title & Provider */}
                <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                  {c.title || c.name}
                </h3>
                <p className="text-xs font-medium text-slate-400 mt-1">
                  By <span className="text-slate-300">{c.provider}</span> • Faculty:{" "}
                  <span className="text-slate-300">{c.instructor}</span>
                </p>

                {/* Duration & Rating */}
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {c.duration}
                  </span>
                  <span className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {c.rating} ({c.reviewsCount || "1,000+ reviews"})
                  </span>
                </div>

                {/* Key Highlights */}
                <div className="mt-4 pt-3 border-t border-slate-800/60 space-y-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Key Features:
                  </p>
                  <ul className="space-y-1">
                    {(c.features || c.highlights || []).slice(0, 3).map((f: string, i: number) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Footer: Price & Actions */}
              <div className="p-4 bg-slate-950/40 border-t border-slate-800/60 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-bold text-white">{c.price}</span>
                    {c.originalPrice && (
                      <span className="text-xs text-slate-500 line-through">
                        {c.originalPrice}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-medium">Verified Batch</span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={c.affiliateUrl || c.courseUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="View Batch URL"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete / Archive Course"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Course Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Add Course / Coaching Batch</h3>
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
                  Course / Batch Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GATE 2026 CS Complete Dropper & College Batch"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Institute / Platform
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PhysicsWallah / Unacademy"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Lead Faculty / Mentor
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Khaleel Ahmed Sir & Team"
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Target Exam
                  </label>
                  <select
                    value={examCategory}
                    onChange={(e) => setExamCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="GATE CSE">GATE CSE</option>
                    <option value="UPSC CSE">UPSC CSE</option>
                    <option value="SSC CGL">SSC CGL</option>
                    <option value="CAT">CAT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Duration
                  </label>
                  <input
                    type="text"
                    placeholder="8 Months"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Badge Tag
                  </label>
                  <input
                    type="text"
                    placeholder="Top Rated / Best Value"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Offer Price
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="₹8,999"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Original Price
                  </label>
                  <input
                    type="text"
                    placeholder="₹18,000"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Rating (out of 5)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Course Highlights (One feature per line)
                </label>
                <textarea
                  rows={3}
                  placeholder={`600+ Hours Live Class Sessions\nTopic-wise Practice Problems & DPPs\n10 Full Mock Tests with Video Analysis`}
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Direct Enrollment / Platform URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://platform.com/gate-course"
                  value={affiliateUrl}
                  onChange={(e) => setAffiliateUrl(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
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
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-sm font-semibold shadow-lg shadow-amber-500/25 transition-all"
                >
                  Publish Batch Recommendation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
