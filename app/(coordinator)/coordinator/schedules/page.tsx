'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Plus, Edit2, Trash2, Search, Filter, 
  ExternalLink, CheckCircle2, Clock, X, Eye
} from 'lucide-react';
import { 
  ExamUpdate, getCoordinatorExamUpdates, saveCoordinatorExamUpdate, 
  deleteCoordinatorExamUpdate 
} from '@/lib/coordinatorService';

export default function CoordinatorSchedules() {
  const [schedules, setSchedules] = useState<ExamUpdate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ExamUpdate | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const loadSchedules = () => {
    setSchedules(getCoordinatorExamUpdates());
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const handleOpenAdd = () => {
    setEditingSchedule(null);
    setShowModal(true);
  };

  const handleOpenEdit = (item: ExamUpdate) => {
    setEditingSchedule(item);
    setShowModal(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the schedule update for "${name}"?`)) {
      deleteCoordinatorExamUpdate(id);
      loadSchedules();
      showToast(`Schedule for "${name}" deleted.`);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const item: ExamUpdate = {
      id: editingSchedule?.id || `upd-${Date.now()}`,
      examId: (formData.get('examId') as string) || 'gate',
      examName: (formData.get('examName') as string) || '',
      conductingBody: (formData.get('conductingBody') as string) || '',
      academicYear: (formData.get('academicYear') as string) || '2026-2027',
      registrationStartDate: (formData.get('registrationStartDate') as string) || '',
      registrationEndDate: (formData.get('registrationEndDate') as string) || '',
      admitCardDate: (formData.get('admitCardDate') as string) || '',
      examDate: (formData.get('examDate') as string) || '',
      resultDate: (formData.get('resultDate') as string) || '',
      status: (formData.get('status') as any) || 'Live',
      officialNotificationUrl: (formData.get('officialNotificationUrl') as string) || '',
      officialApplyUrl: (formData.get('officialApplyUrl') as string) || '',
      updatedAt: 'Just now',
    };

    saveCoordinatorExamUpdate(item);
    loadSchedules();
    setShowModal(false);
    setEditingSchedule(null);
    showToast(`Exam schedule for ${item.examName} saved successfully!`);
  };

  const q = searchQuery.toLowerCase().trim();
  const filtered = schedules.filter((s: ExamUpdate) => {
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchQuery = !q || s.examName.toLowerCase().includes(q) || s.conductingBody.toLowerCase().includes(q) || s.examId.toLowerCase().includes(q);
    return matchStatus && matchQuery;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl font-bold text-xs flex items-center gap-2 border border-emerald-400">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-primary" />
            <span>Manage Exam Schedules & Deadlines</span>
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Configure examination cycles, registration open/close windows, admit card releases, and official links.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn btn-primary py-2.5 px-4 text-xs font-bold flex items-center gap-2 shadow-lg shadow-primary/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Exam Date</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border rounded-xl p-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
          <input
            type="text"
            placeholder="Search exam name or conducting body..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-text-subtle focus:outline-none focus:border-primary font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-text-muted shrink-0">Status:</span>
          <select
            value={statusFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary font-medium"
          >
            <option value="all">All Statuses ({schedules.length})</option>
            <option value="Live">Live</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Schedules Data Table / Cards */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-background/90 text-text-muted border-b border-border font-bold uppercase text-[0.68rem] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Exam & Authority</th>
                <th className="py-3.5 px-4">Cycle</th>
                <th className="py-3.5 px-4">Registration Window</th>
                <th className="py-3.5 px-4">Admit Card Date</th>
                <th className="py-3.5 px-4">Exam Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((item: ExamUpdate) => (
                <tr key={item.id} className="hover:bg-card-hover transition-colors">
                  <td className="py-3 px-4">
                    <strong className="text-foreground text-xs block">{item.examName}</strong>
                    <span className="text-[0.68rem] text-text-muted">{item.conductingBody}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[0.72rem] text-text-muted">
                    {item.academicYear}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[0.72rem] text-foreground block">
                      {item.registrationStartDate || 'TBA'}
                    </span>
                    <span className="text-[0.65rem] text-text-muted">
                      to {item.registrationEndDate || 'TBA'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-foreground">
                    {item.admitCardDate || 'TBA'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-extrabold text-primary text-xs">
                      {item.examDate || 'TBA'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-[0.65rem] font-extrabold px-2.5 py-1 rounded-full ${
                      item.status === 'Live' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                      item.status === 'Published' ? 'bg-primary/15 text-primary border border-primary/30' :
                      'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}>
                      ● {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {item.officialNotificationUrl && (
                        <a
                          href={item.officialNotificationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg border border-border hover:bg-card-hover text-primary transition-colors"
                          title="View Official Notification"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg border border-border hover:bg-card-hover text-text-muted hover:text-foreground transition-colors"
                        title="Edit schedule"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.examName)}
                        className="p-1.5 rounded-lg border border-border hover:bg-red-500/15 text-red-400 hover:text-red-300 transition-colors"
                        title="Delete schedule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Edit / Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span>{editingSchedule ? 'Edit Exam Timeline' : 'Publish New Exam Timeline'}</span>
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-card-hover text-text-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-text-muted">Target Exam Code</label>
                  <select 
                    name="examId" 
                    defaultValue={editingSchedule?.examId || 'gate'}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground font-medium"
                  >
                    <option value="gate">gate (GATE 2026)</option>
                    <option value="upsc-cse">upsc-cse (UPSC CSE 2026)</option>
                    <option value="ssc-cgl">ssc-cgl (SSC CGL 2026)</option>
                    <option value="cat">cat (CAT 2026)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-text-muted">Academic Cycle</label>
                  <input 
                    name="academicYear"
                    defaultValue={editingSchedule?.academicYear || '2026-2027'}
                    required
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-text-muted">Full Examination Title</label>
                <input 
                  name="examName"
                  defaultValue={editingSchedule?.examName || ''}
                  placeholder="e.g. Graduate Aptitude Test in Engineering 2026"
                  required
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-text-muted">Conducting Body</label>
                <input 
                  name="conductingBody"
                  defaultValue={editingSchedule?.conductingBody || ''}
                  placeholder="e.g. IIT Guwahati"
                  required
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-text-muted">Registration Start Date</label>
                  <input 
                    type="date"
                    name="registrationStartDate"
                    defaultValue={editingSchedule?.registrationStartDate || ''}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-text-muted">Registration Deadline</label>
                  <input 
                    type="date"
                    name="registrationEndDate"
                    defaultValue={editingSchedule?.registrationEndDate || ''}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-text-muted">Admit Card Date</label>
                  <input 
                    type="date"
                    name="admitCardDate"
                    defaultValue={editingSchedule?.admitCardDate || ''}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-text-muted">Exam Date</label>
                  <input 
                    type="date"
                    name="examDate"
                    defaultValue={editingSchedule?.examDate || ''}
                    required
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-text-muted">Result Date</label>
                  <input 
                    type="date"
                    name="resultDate"
                    defaultValue={editingSchedule?.resultDate || ''}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-text-muted">Official Notification PDF URL</label>
                  <input 
                    name="officialNotificationUrl"
                    defaultValue={editingSchedule?.officialNotificationUrl || ''}
                    placeholder="https://..."
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-text-muted">Application Portal URL</label>
                  <input 
                    name="officialApplyUrl"
                    defaultValue={editingSchedule?.officialApplyUrl || ''}
                    placeholder="https://..."
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-text-muted">Status</label>
                <select 
                  name="status"
                  defaultValue={editingSchedule?.status || 'Live'}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground font-medium"
                >
                  <option value="Live">Live (Active Student View)</option>
                  <option value="Published">Published (General Notice)</option>
                  <option value="Draft">Draft (Internal Staging)</option>
                  <option value="Archived">Archived (Past Year)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-border text-text-muted hover:text-foreground font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary px-5 py-2 rounded-lg font-bold"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
