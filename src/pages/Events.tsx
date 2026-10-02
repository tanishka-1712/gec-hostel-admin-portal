import React, { useState } from 'react';
import { 
  CalendarDays, 
  Plus, 
  MapPin, 
  Clock, 
  Users, 
  Trash2, 
  Calendar, 
  CheckCircle2, 
  Sparkles,
  Search
} from 'lucide-react';
import { useHostel } from '../context/HostelContext';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { HostelEvent } from '../types';

export const EventsPage: React.FC = () => {
  const { events, createEvent, deleteEvent } = useHostel();

  const [search, setSearch] = useState<string>('');
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

  // Form states
  const [eventName, setEventName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>('2026-10-15');
  const [time, setTime] = useState<string>('05:00 PM - 08:00 PM');
  const [venue, setVenue] = useState<string>('GEC Central Sports Arena');
  const [organizer, setOrganizer] = useState<string>('Hostel Sports & Cultural Committee');
  const [registrationRequired, setRegistrationRequired] = useState<boolean>(true);
  const [maximumParticipants, setMaximumParticipants] = useState<number>(100);

  const filtered = events.filter((e) =>
    e.eventName.toLowerCase().includes(search.toLowerCase()) ||
    e.venue.toLowerCase().includes(search.toLowerCase()) ||
    e.organizer.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim()) return;

    createEvent({
      eventName: eventName.trim(),
      description: description.trim(),
      date,
      time,
      venue,
      organizer,
      registrationRequired,
      maximumParticipants,
      status: 'Upcoming'
    });

    setEventName('');
    setDescription('');
    setIsCreateOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-blue text-[11px]">Campus Life & Activities</span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-500">Student Portal Activity Sync</span>
          </div>
          <h1 className="page-header text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <CalendarDays className="w-7 h-7 text-blue-600" />
            <span>Hostel Events & Tournaments</span>
          </h1>
          <p className="page-subtitle text-slate-500 text-xs sm:text-sm mb-0">
            Organize inter-block sports leagues, tech hackathons, cultural festivals, and wellness camps.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="btn-primary text-xs flex items-center gap-2 py-2.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Event</span>
        </button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events by tournament name, venue, or organizer..."
            className="form-input pl-10 text-xs sm:text-sm py-2"
          />
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((evt) => (
          <div key={evt.id} className="card p-5 space-y-4 flex flex-col justify-between border border-slate-100 hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant={evt.status === 'Upcoming' ? 'blue' : 'green'}>
                  {evt.status}
                </Badge>
                <span className="text-[10px] font-mono text-slate-400">{evt.id}</span>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">{evt.eventName}</h3>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{evt.description}</p>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="font-semibold">{evt.date}</span>
                <span className="text-slate-400">·</span>
                <span>{evt.time}</span>
              </div>

              <div className="flex items-center gap-2 text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="truncate">{evt.venue}</span>
              </div>

              <div className="flex items-center justify-between text-slate-500 pt-1">
                <span>Registrations:</span>
                <span className="font-bold text-slate-800">
                  {evt.currentRegistrations} / {evt.maximumParticipants}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-400 truncate max-w-44" title={evt.organizer}>
                  {evt.organizer}
                </span>
                <button
                  type="button"
                  onClick={() => deleteEvent(evt.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Delete Event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Event Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create & Schedule Hostel Event"
        subtitle="This event will automatically be featured on the Student Hostel Portal."
        maxWidth="2xl"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="form-label text-xs">Event Name / Tournament Title:</label>
            <input
              type="text"
              required
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="e.g. Inter-Block Badminton Championship 2026"
              className="form-input text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="form-label text-xs">Event Date:</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input text-xs py-1.5"
              />
            </div>
            <div>
              <label className="form-label text-xs">Event Time Window:</label>
              <input
                type="text"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 05:00 PM - 08:30 PM"
                className="form-input text-xs py-1.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="form-label text-xs">Venue:</label>
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Kalam Block Quadrangle"
                className="form-input text-xs"
              />
            </div>
            <div>
              <label className="form-label text-xs">Organizer Committee:</label>
              <input
                type="text"
                required
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                placeholder="e.g. Hostel Sports & Recreation Cell"
                className="form-input text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="form-label text-xs">Maximum Registrations Allowed:</label>
              <input
                type="number"
                min={10}
                max={1000}
                value={maximumParticipants}
                onChange={(e) => setMaximumParticipants(Number(e.target.value))}
                className="form-input text-xs py-1.5"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={registrationRequired}
                  onChange={(e) => setRegistrationRequired(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-xs">Registration Required via Student App</span>
              </label>
            </div>
          </div>

          <div>
            <label className="form-label text-xs">Event Description:</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe event rules, registration deadlines, and prize announcements..."
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
              <Sparkles className="w-3.5 h-3.5" />
              Publish Event
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
