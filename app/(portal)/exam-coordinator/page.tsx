'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Plus, Edit, Save, Trash2, CheckCircle } from 'lucide-react';
import { getExamsFromDb } from '@/lib/dbService';

import { addOrUpdateExamAdmin } from '@/lib/serverDbService';

export default function AdminExamsManagement() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingExam, setEditingExam] = useState<any>(null);
  const [toastMsg, setToastMsg] = useState('');

  const [formData, setFormData] = useState<any>({
    name: '',
    short_name: '',
    category_name: '',
    organization: '',
    exam_level: 'National',
    status: 'active',
    official_website: '',
    minimum_age: 18,
    maximum_age: 30,
    minimum_education: 'Graduate',
    eligible_streams: ['All Streams'],
    application_start_date: '',
    application_end_date: '',
    exam_date: ''
  });

  const loadExams = async () => {
    setLoading(true);
    const dbExams = await getExamsFromDb();
    setExams(dbExams);
    setLoading(false);
  };

  useEffect(() => {
    loadExams();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleEdit = (exam: any) => {
    setEditingExam(exam);
    setFormData({
      name: exam.name,
      short_name: exam.short_name,
      category_name: exam.category_name || '',
      organization: exam.organization,
      exam_level: exam.exam_level || 'National',
      status: exam.status || 'active',
      official_website: exam.official_website || '',
      minimum_age: exam.minimum_age || 18,
      maximum_age: exam.maximum_age || 30,
      minimum_education: exam.degrees?.[0] || 'Graduate',
      eligible_streams: exam.eligible_branches || ['All Streams'],
      application_start_date: exam.application_start_date || '',
      application_end_date: exam.application_end_date || '',
      exam_date: exam.exam_date || ''
    });
  };

  const handleAddNew = () => {
    setEditingExam('NEW');
    setFormData({
      name: '',
      short_name: '',
      category_name: '',
      organization: '',
      exam_level: 'National',
      status: 'active',
      official_website: '',
      minimum_age: 18,
      maximum_age: 30,
      minimum_education: 'Graduate',
      eligible_streams: ['All Streams'],
      application_start_date: '',
      application_end_date: '',
      exam_date: ''
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        short_name: formData.short_name,
        category_name: formData.category_name,
        slug: formData.short_name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        organization: formData.organization,
        exam_level: formData.exam_level,
        status: formData.status,
        official_website: formData.official_website,
        minimum_age: formData.minimum_age,
        maximum_age: formData.maximum_age,
        minimum_education: formData.minimum_education,
        eligible_streams: formData.eligible_streams,
        application_start_date: formData.application_start_date,
        application_end_date: formData.application_end_date,
        exam_date: formData.exam_date
      };

      if (editingExam === 'NEW') {
        await addOrUpdateExamAdmin(payload);
        showToast('Exam added successfully');
      } else {
        await addOrUpdateExamAdmin(payload, editingExam.dbId || editingExam.id);
        showToast('Exam updated successfully');
      }
      setEditingExam(null);
      loadExams();
    } catch (err: any) {
      showToast('Error: ' + err.message);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Exam Coordinator Dashboard</h1>
        <button onClick={handleAddNew} className="btn btn-primary flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Add Exam
        </button>
      </div>

      {toastMsg && (
        <div className="mb-4 p-3 bg-success/20 text-success rounded-lg flex items-center gap-2 font-medium border border-success/30">
          <CheckCircle className="w-5 h-5" /> {toastMsg}
        </div>
      )}

      {editingExam && (
        <div className="bg-card border border-border rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-bold mb-4">{editingExam === 'NEW' ? 'Add New Exam' : 'Edit Exam'}</h2>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-text-muted mb-1">Exam Name</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2" placeholder="e.g. UPSC Civil Services" />
            </div>
            <div>
              <label className="block text-sm font-bold text-text-muted mb-1">Exam Code / Short Name</label>
              <input required value={formData.short_name} onChange={e => setFormData({...formData, short_name: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2" placeholder="e.g. UPSC_CSE" />
            </div>
            <div>
              <label className="block text-sm font-bold text-text-muted mb-1">Category</label>
              <input required value={formData.category_name} onChange={e => setFormData({...formData, category_name: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2" placeholder="e.g. Government" />
            </div>
            <div>
              <label className="block text-sm font-bold text-text-muted mb-1">Organization / Authority</label>
              <input required value={formData.organization} onChange={e => setFormData({...formData, organization: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2" placeholder="e.g. UPSC" />
            </div>
            <div>
              <label className="block text-sm font-bold text-text-muted mb-1">Official Website</label>
              <input type="url" value={formData.official_website || ''} onChange={e => setFormData({...formData, official_website: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2" placeholder="https://..." />
            </div>
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <div>
                 <label className="block text-sm font-bold text-text-muted mb-1">Minimum Age</label>
                 <input type="number" required value={formData.minimum_age} onChange={e => setFormData({...formData, minimum_age: Number(e.target.value)})} className="w-full bg-background border border-border rounded-lg px-3 py-2" />
              </div>
              <div>
                 <label className="block text-sm font-bold text-text-muted mb-1">Maximum Age</label>
                 <input type="number" required value={formData.maximum_age} onChange={e => setFormData({...formData, maximum_age: Number(e.target.value)})} className="w-full bg-background border border-border rounded-lg px-3 py-2" />
              </div>
            </div>
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <div>
                 <label className="block text-sm font-bold text-text-muted mb-1">Minimum Education</label>
                 <select value={formData.minimum_education} onChange={e => setFormData({...formData, minimum_education: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2">
                    <option value="10th">10th</option>
                    <option value="12th">12th</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Post Graduate">Post Graduate</option>
                 </select>
              </div>
              <div>
                 <label className="block text-sm font-bold text-text-muted mb-1">Status</label>
                 <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2">
                   <option value="active">Active</option>
                   <option value="upcoming">Upcoming</option>
                   <option value="closed">Closed</option>
                 </select>
              </div>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                 <label className="block text-sm font-bold text-text-muted mb-1">Application Start Date</label>
                 <input type="date" value={formData.application_start_date || ''} onChange={e => setFormData({...formData, application_start_date: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2" />
              </div>
              <div>
                 <label className="block text-sm font-bold text-text-muted mb-1">Application End Date</label>
                 <input type="date" value={formData.application_end_date || ''} onChange={e => setFormData({...formData, application_end_date: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2" />
              </div>
              <div>
                 <label className="block text-sm font-bold text-text-muted mb-1">Exam Date</label>
                 <input type="date" value={formData.exam_date || ''} onChange={e => setFormData({...formData, exam_date: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2" />
              </div>
            </div>
            
            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setEditingExam(null)} className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-card-hover">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90">
                <Save className="w-4 h-4" /> Save Exam
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-muted">Loading exams...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-card-hover border-b border-border text-text-muted text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Exam Code</th>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Organization</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {exams.map((exam, idx) => (
                <tr key={idx} className="hover:bg-card-hover/50 transition-colors">
                  <td className="p-4 font-medium text-primary">{exam.short_name}</td>
                  <td className="p-4 font-medium">{exam.name}</td>
                  <td className="p-4 text-text-muted">{exam.organization}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${exam.status === 'active' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                      {exam.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleEdit(exam)} className="text-text-muted hover:text-primary transition-colors">
                      <Edit className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
              {exams.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-muted">No exams found in database.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
