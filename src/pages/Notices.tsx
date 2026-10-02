import React, { useState } from 'react';
import { 
  BellRing, 
  Plus, 
  Trash2, 
  Calendar, 
  AlertTriangle, 
  FileText, 
  Send, 
  Search,
  CheckCircle2,
  Clock,
  Download
} from 'lucide-react';
import { useHostel } from '../context/HostelContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Notice, NoticeCategory } from '../types';

export const NoticesPage: React.FC = () => {
  const { notices, createNotice, deleteNotice } = useHostel();

  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

  // New Notice form states
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<NoticeCategory>('Hostel');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<'Urgent' | 'High' | 'Normal'>('Normal');
  const [publishDate, setPublishDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState<string>('2026-10-31');
  const [targetAudience, setTargetAudience] = useState<'All Hostels' | 'Boys Hostels' | 'Girls Hostels' | 'Specific Block'>('All Hostels');
  const [status, setStatus] = useState<'Published' | 'Scheduled'>('Published');

  const filtered = notices.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.description.toLowerCase().includes(search.toLowerCase()) ||
      n.author.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || n.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    createNotice({
      title: title.trim(),
      category,
      description: description.trim(),
      priority,
      publishDate,
      expiryDate,
      status,
      author: 'Prof. Dr. Soumya Ranjan Mishra (Chief Warden)',
      targetAudience
    });

    // Reset
    setTitle('');
    setDescription('');
    setIsCreateOpen(false);
  };

  const categories: NoticeCategory[] = [
    'General',
    'Hostel',
    'Mess',
    'Maintenance',
    'Emergency',
    'Event',
    'Discipline'
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-blue text-[11px]">Notice Board Administration</span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-500">Real-Time Student Portal Broadcasting</span>
          </div>
          <h1 className="page-header text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <BellRing className="w-7 h-7 text-purple-600" />
            <span>Hostel Notices & Circulars</span>
          </h1>
          <p className="page-subtitle text-slate-500 text-xs sm:text-sm mb-0">
            Publish official warden orders, mess revisions, curfew changes, and maintenance alerts to the Student Portal.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="btn-primary text-xs flex items-center gap-2 py-2.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Notice</span>
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="card p-4 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search circulars by title, content, or author..."
            className="form-input pl-10 text-xs sm:text-sm py-2"
          />
        </div>

        <div className="w-full md:w-56">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="form-select text-xs py-2"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Notices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full card p-12 text-center text-xs text-slate-400">
            No notices published matching current filter.
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className={`card p-5 space-y-4 flex flex-col justify-between border ${
                n.priority === 'Urgent' ? 'border-red-200 bg-red-50/15' : 'border-slate-100'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={n.priority === 'Urgent' ? 'red' : n.priority === 'High' ? 'orange' : 'blue'}>
                    {n.category} · {n.priority}
                  </Badge>
                  <span className="text-[10px] text-slate-400 font-mono">{n.id}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                  {n.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">
                  {n.description}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Audience:</span>
                  <span className="font-semibold text-slate-800">{n.targetAudience}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Valid:</span>
                  <span className="text-slate-700">{n.publishDate} to {n.expiryDate}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400 truncate max-w-44" title={n.author}>
                    {n.author.split('(')[0]}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteNotice(n.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Notice Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Publish Official Hostel Notice"
        subtitle="This circular will be automatically published to the Student Portal & Notice Board."
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateNotice} className="space-y-4 text-xs">
          <div>
            <label className="form-label text-xs">Notice Title:</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mandatory Biometric Curfew Protocol Revision"
              className="form-input text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="form-label text-xs">Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as NoticeCategory)}
                className="form-select text-xs py-2"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label text-xs">Priority Level:</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="form-select text-xs py-2"
              >
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="form-label text-xs">Target Audience:</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as any)}
                className="form-select text-xs py-2"
              >
                <option value="All Hostels">All Hostels</option>
                <option value="Boys Hostels">Boys Hostels Only</option>
                <option value="Girls Hostels">Girls Hostels Only</option>
                <option value="Specific Block">Specific Block</option>
              </select>
            </div>

            <div>
              <label className="form-label text-xs">Publish Date:</label>
              <input
                type="date"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                className="form-input text-xs py-1.5"
              />
            </div>

            <div>
              <label className="form-label text-xs">Expiry Date:</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="form-input text-xs py-1.5"
              />
            </div>
          </div>

          <div>
            <label className="form-label text-xs">Detailed Notice Content:</label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter full notice text, disciplinary guidelines, or maintenance schedules..."
              className="form-input text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Publish Notice
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
