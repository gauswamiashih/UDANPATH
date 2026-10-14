"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Filter,
  Layers,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Percent,
} from "lucide-react";
import {
  getCoordinatorSyllabus,
  saveCoordinatorSyllabusList,
  SyllabusNode,
} from "@/lib/coordinatorService";

export default function CoordinatorSyllabusPage() {
  const [syllabusList, setSyllabusList] = useState<SyllabusNode[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>("GATE CSE");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editWeightage, setEditWeightage] = useState<string>("");

  // Modal for new subject/node
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSubjectTitle, setNewSubjectTitle] = useState("");
  const [newSubjectExam, setNewSubjectExam] = useState("GATE CSE");
  const [newSubjectWeightage, setNewSubjectWeightage] = useState("10%");
  const [newSubjectTopics, setNewSubjectTopics] = useState("");

  // Topic input state inside an expanded unit
  const [newTopicInput, setNewTopicInput] = useState<Record<string, string>>({});

  useEffect(() => {
    loadSyllabus();
  }, []);

  const loadSyllabus = () => {
    const data = getCoordinatorSyllabus();
    setSyllabusList(data);
    // Expand top-level nodes by default
    const initialExpanded: Record<string, boolean> = {};
    data.forEach((node) => {
      initialExpanded[node.id] = true;
    });
    setExpandedNodes(initialExpanded);
  };

  const exams = Array.from(new Set(syllabusList.map((s) => s.examName || "GATE CSE")));
  if (!exams.includes("GATE CSE")) exams.unshift("GATE CSE");
  if (!exams.includes("UPSC CSE")) exams.push("UPSC CSE");
  if (!exams.includes("SSC CGL")) exams.push("SSC CGL");

  const filteredNodes = syllabusList.filter((node) => {
    const matchesExam = (node.examName || "GATE CSE") === selectedExam;
    const nodeTitle = node.title || node.subject || "";
    const nodeTopics = node.topics || node.units?.flatMap(u => u.topics) || [];
    const matchesSearch =
      nodeTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nodeTopics.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesExam && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddTopic = (nodeId: string) => {
    const text = newTopicInput[nodeId]?.trim();
    if (!text) return;

    const updated = syllabusList.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          topics: [...(node.topics || []), text],
        };
      }
      return node;
    });

    saveCoordinatorSyllabusList(updated);
    setSyllabusList(updated);
    setNewTopicInput((prev) => ({ ...prev, [nodeId]: "" }));
  };

  const handleDeleteTopic = (nodeId: string, topicIdx: number) => {
    const updated = syllabusList.map((node) => {
      if (node.id === nodeId) {
        const nextTopics = [...(node.topics || [])];
        nextTopics.splice(topicIdx, 1);
        return {
          ...node,
          topics: nextTopics,
        };
      }
      return node;
    });

    saveCoordinatorSyllabusList(updated);
    setSyllabusList(updated);
  };

  const handleDeleteNode = (nodeId: string) => {
    if (!confirm("Are you sure you want to delete this unit/subject?")) return;
    const updated = syllabusList.filter((node) => node.id !== nodeId);
    saveCoordinatorSyllabusList(updated);
    setSyllabusList(updated);
  };

  const handleSaveWeightage = (nodeId: string) => {
    const updated = syllabusList.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          weightage: editWeightage.includes("%") ? editWeightage : `${editWeightage}%`,
        };
      }
      return node;
    });
    saveCoordinatorSyllabusList(updated);
    setSyllabusList(updated);
    setEditingNodeId(null);
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectTitle.trim()) return;

    const topicsArray = newSubjectTopics
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const newNode: SyllabusNode = {
      id: "syl_" + Date.now(),
      examId: newSubjectExam.toLowerCase().replace(/\s+/g, '-'),
      subject: newSubjectTitle.trim(),
      title: newSubjectTitle.trim(),
      examName: newSubjectExam,
      weightage: newSubjectWeightage.includes("%") ? newSubjectWeightage : `${newSubjectWeightage}%`,
      topics: topicsArray.length > 0 ? topicsArray : ["Fundamental Principles", "Practice Problems"],
      units: [],
      status: "Published",
      lastRevised: new Date().toISOString().split('T')[0],
    };

    const updated = [newNode, ...syllabusList];
    saveCoordinatorSyllabusList(updated);
    setSyllabusList(updated);
    setSelectedExam(newSubjectExam);
    setExpandedNodes((prev) => ({ ...prev, [newNode.id]: true }));

    // Reset
    setNewSubjectTitle("");
    setNewSubjectTopics("");
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-900/30 via-cyan-900/20 to-blue-950/40 border border-blue-500/20 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              Manage Syllabus Trees
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                CRUD Tree Editor
              </span>
            </h1>
            <p className="text-sm text-slate-400">
              Curate unit breakdown, weightage percentages, and topic checklists that live-sync to student discovery roadmaps.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium shadow-lg shadow-blue-500/25 transition-all text-sm shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New Unit / Subject
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        {/* Exam Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <Layers className="w-4 h-4 text-slate-400 ml-1 shrink-0" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Exam:
          </span>
          {exams.map((exam) => (
            <button
              key={exam}
              onClick={() => setSelectedExam(exam)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                selectedExam === exam
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {exam}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search subjects or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-800/90 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Syllabus Tree List */}
      <div className="space-y-4">
        {filteredNodes.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-300 font-medium">No units found for {selectedExam}</p>
            <p className="text-xs text-slate-500 mt-1">
              Add a new unit to build the curriculum tree for this exam.
            </p>
            <button
              onClick={() => {
                setNewSubjectExam(selectedExam);
                setIsAddModalOpen(true);
              }}
              className="mt-4 px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-semibold hover:bg-blue-600/30 transition-all inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Create Unit for {selectedExam}
            </button>
          </div>
        ) : (
          filteredNodes.map((node) => {
            const isExpanded = !!expandedNodes[node.id];
            const isEditing = editingNodeId === node.id;

            return (
              <div
                key={node.id}
                className="bg-slate-900/60 rounded-xl border border-slate-800/80 overflow-hidden transition-all duration-200 hover:border-slate-700/80"
              >
                {/* Unit Header */}
                <div className="p-4 flex items-center justify-between gap-3 bg-slate-800/30 border-b border-slate-800/50">
                  <div
                    onClick={() => toggleExpand(node.id)}
                    className="flex items-center gap-3 cursor-pointer flex-1 select-none"
                  >
                    <button className="text-slate-400 hover:text-white p-1">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-blue-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                    <div>
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        {node.title || node.subject}
                        <span className="text-[11px] font-normal text-slate-400">
                          ({(node.topics?.length || node.units?.flatMap(u => u.topics).length || 0)} topics)
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500">{node.examName || selectedExam}</p>
                    </div>
                  </div>

                  {/* Weightage and Actions */}
                  <div className="flex items-center gap-3">
                    {/* Weightage Editor */}
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-lg border border-blue-500/40">
                        <Percent className="w-3.5 h-3.5 text-blue-400" />
                        <input
                          type="text"
                          value={editWeightage}
                          onChange={(e) => setEditWeightage(e.target.value)}
                          className="w-12 bg-transparent text-xs text-white text-center focus:outline-none"
                          placeholder="12%"
                        />
                        <button
                          onClick={() => handleSaveWeightage(node.id)}
                          className="p-1 text-emerald-400 hover:text-emerald-300"
                          title="Save weightage"
                        >
                          <Save className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingNodeId(null)}
                          className="p-1 text-slate-400 hover:text-slate-200"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          setEditingNodeId(node.id);
                          setEditWeightage(node.weightage || "10%");
                        }}
                        className="cursor-pointer group flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium hover:border-blue-400/40"
                        title="Click to edit weightage"
                      >
                        <span>Weightage: {node.weightage || "10%"}</span>
                        <Edit2 className="w-3 h-3 text-blue-400 opacity-60 group-hover:opacity-100" />
                      </div>
                    )}

                    {/* Delete Unit */}
                    <button
                      onClick={() => handleDeleteNode(node.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete Unit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subtopic Tree Body */}
                {isExpanded && (
                  <div className="p-4 space-y-3 bg-slate-950/30">
                    <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800/40 font-medium">
                      <span>Curriculum Topics & Conceptual Modules</span>
                      <span>Action</span>
                    </div>

                    {/* Topic Items */}
                    <div className="space-y-2">
                      {(() => {
                        const allTopics: string[] = node.topics || node.units?.flatMap(u => u.topics) || [];
                        if (allTopics.length === 0) {
                          return (
                            <p className="text-xs text-slate-500 italic py-2">
                              No topics added yet. Add topics below to populate this unit.
                            </p>
                          );
                        }
                        return allTopics.map((topic: string, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/70 hover:border-slate-700/80 transition-all text-xs group"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-mono">
                                {idx + 1}
                              </span>
                              <span className="text-slate-200 font-medium">{topic}</span>
                            </div>
                            <button
                              onClick={() => handleDeleteTopic(node.id, idx)}
                              className="text-slate-500 hover:text-red-400 p-1 rounded opacity-0 group-hover:opacity-100 transition-all"
                              title="Delete Topic"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ));
                      })()}
                    </div>

                    {/* Add Topic Input Bar */}
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Add subtopic or key concept..."
                        value={newTopicInput[node.id] || ""}
                        onChange={(e) =>
                          setNewTopicInput((prev) => ({ ...prev, [node.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTopic(node.id);
                          }
                        }}
                        className="flex-1 px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => handleAddTopic(node.id)}
                        className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Topic
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add New Unit / Subject Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Add Curriculum Unit / Subject</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Target Exam
                </label>
                <select
                  value={newSubjectExam}
                  onChange={(e) => setNewSubjectExam(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="GATE CSE">GATE Computer Science & IT</option>
                  <option value="UPSC CSE">UPSC Civil Services Examination</option>
                  <option value="SSC CGL">SSC Combined Graduate Level</option>
                  <option value="CAT">CAT Common Admission Test</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Unit / Subject Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Theory of Computation or Discrete Mathematics"
                  value={newSubjectTitle}
                  onChange={(e) => setNewSubjectTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Estimated Exam Weightage
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10-12% or 15 Marks"
                  value={newSubjectWeightage}
                  onChange={(e) => setNewSubjectWeightage(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Initial Topics (comma-separated)
                </label>
                <textarea
                  rows={3}
                  placeholder="Regular Expressions, Finite Automata, Context-Free Grammars, Turing Machines"
                  value={newSubjectTopics}
                  onChange={(e) => setNewSubjectTopics(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
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
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all"
                >
                  Publish Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
