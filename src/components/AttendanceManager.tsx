import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Search,
  Filter,
  Save,
  Users,
  Award,
  Sparkles,
  Info,
  CalendarDays,
  Printer,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  FileSpreadsheet,
  CheckCheck
} from 'lucide-react';
import { Student, Musyrif, AttendanceRecord, AttendanceStatus, StudentAttendanceItem } from '../types';
import { saveAttendance, removeAttendance } from '../services/quranService';

interface AttendanceManagerProps {
  students: Student[];
  classes: string[];
  musyrifs: Musyrif[];
  attendances: AttendanceRecord[];
}

const INDONESIAN_DAYS = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const ALL_SESSIONS = ['Sesi 1', 'Sesi 2', 'Sesi 3', 'Sesi 4'] as const;

export const AttendanceManager: React.FC<AttendanceManagerProps> = ({
  students,
  classes,
  musyrifs,
  attendances,
}) => {
  // Format today as YYYY-MM-DD local time
  const getTodayString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [selectedSession, setSelectedSession] = useState<'Sesi 1' | 'Sesi 2' | 'Sesi 3' | 'Sesi 4'>('Sesi 1');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'input' | 'rekap'>('input');

  // Form states for currently selected session
  const [recordsMap, setRecordsMap] = useState<Record<string, { status: AttendanceStatus; note: string }>>({});
  const [recordedBy, setRecordedBy] = useState<string>('');
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Day of week analysis
  const dayInfo = useMemo(() => {
    const parts = selectedDate.split('-');
    if (parts.length !== 3) return { dayIndex: 1, dayName: 'Senin', isAhad: false, isSabtu: false, isWeekday: true };
    const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const dayIndex = dateObj.getDay(); // 0 = Ahad, 6 = Sabtu
    const dayName = INDONESIAN_DAYS[dayIndex] || 'Senin';
    const isAhad = dayIndex === 0;
    const isSabtu = dayIndex === 6;
    const isWeekday = dayIndex >= 1 && dayIndex <= 5;
    return { dayIndex, dayName, isAhad, isSabtu, isWeekday };
  }, [selectedDate]);

  // Adjust session if Saturday (Sabtu only Sesi 1 & 2)
  useEffect(() => {
    if (dayInfo.isSabtu && (selectedSession === 'Sesi 3' || selectedSession === 'Sesi 4')) {
      setSelectedSession('Sesi 1');
    }
  }, [dayInfo.isSabtu, selectedSession]);

  // Filter students by selected halaqah
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (selectedClass !== 'all' && s.classGroup !== selectedClass) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = s.name.toLowerCase().includes(q);
        const matchNis = (s.nis || '').toLowerCase().includes(q);
        if (!matchName && !matchNis) return false;
      }
      return true;
    });
  }, [students, selectedClass, search]);

  // Find existing saved record in Firestore
  const existingRecord = useMemo(() => {
    return attendances.find(
      (a) =>
        a.date === selectedDate &&
        a.session === selectedSession &&
        (selectedClass === 'all' ? a.classGroup === 'Semua Halaqah' || !a.classGroup : a.classGroup === selectedClass)
    );
  }, [attendances, selectedDate, selectedSession, selectedClass]);

  // Initialize recordsMap whenever date, session, class, or students list updates
  useEffect(() => {
    const initialMap: Record<string, { status: AttendanceStatus; note: string }> = {};

    if (existingRecord && existingRecord.records) {
      existingRecord.records.forEach((r) => {
        initialMap[r.studentId] = {
          status: r.status,
          note: r.note || '',
        };
      });
      setRecordedBy(existingRecord.recordedBy || (musyrifs[0]?.name || ''));
      setSessionNotes(existingRecord.notes || '');
    } else {
      // Default new session: initialize all relevant students to 'hadir'
      filteredStudents.forEach((s) => {
        initialMap[s.id] = {
          status: 'hadir',
          note: '',
        };
      });
      if (musyrifs.length > 0 && !recordedBy) {
        setRecordedBy(musyrifs[0].name);
      }
      setSessionNotes('');
    }

    setRecordsMap(initialMap);
    setSaveSuccessMsg(null);
  }, [existingRecord, selectedDate, selectedSession, selectedClass, filteredStudents.length]);

  // Handlers for single student status changes
  const handleSetStatus = (studentId: string, status: AttendanceStatus) => {
    setRecordsMap((prev) => ({
      ...prev,
      [studentId]: {
        status,
        note: prev[studentId]?.note || '',
      },
    }));
  };

  const handleSetNote = (studentId: string, note: string) => {
    setRecordsMap((prev) => ({
      ...prev,
      [studentId]: {
        status: prev[studentId]?.status || 'hadir',
        note,
      },
    }));
  };

  // Bulk mark all present
  const handleMarkAllPresent = () => {
    setRecordsMap((prev) => {
      const updated = { ...prev };
      filteredStudents.forEach((s) => {
        updated[s.id] = {
          status: 'hadir',
          note: updated[s.id]?.note || '',
        };
      });
      return updated;
    });
  };

  // Compute live session counts
  const sessionStats = useMemo(() => {
    let hadir = 0;
    let izin = 0;
    let sakit = 0;
    let alpa = 0;
    const total = filteredStudents.length;

    filteredStudents.forEach((s) => {
      const st = recordsMap[s.id]?.status || 'hadir';
      if (st === 'hadir') hadir++;
      else if (st === 'izin') izin++;
      else if (st === 'sakit') sakit++;
      else if (st === 'alpa') alpa++;
    });

    const rate = total > 0 ? Math.round((hadir / total) * 100) : 0;
    return { total, hadir, izin, sakit, alpa, rate };
  }, [filteredStudents, recordsMap]);

  // Save to Firestore
  const handleSaveAttendance = async () => {
    setIsSaving(true);
    setSaveSuccessMsg(null);

    const items: StudentAttendanceItem[] = filteredStudents.map((s) => ({
      studentId: s.id,
      studentName: s.name,
      classGroup: s.classGroup,
      status: recordsMap[s.id]?.status || 'hadir',
      note: recordsMap[s.id]?.note || '',
    }));

    const classLabel = selectedClass === 'all' ? 'Semua Halaqah' : selectedClass;
    const docId = `att_${selectedDate}_${selectedSession.replace(/\s+/g, '')}_${classLabel.replace(/[^a-zA-Z0-9]/g, '_')}`;

    try {
      await saveAttendance({
        id: docId,
        date: selectedDate,
        dayName: dayInfo.dayName,
        session: selectedSession,
        classGroup: classLabel,
        records: items,
        summary: sessionStats,
        notes: sessionNotes,
        recordedBy: recordedBy || musyrifs[0]?.name || 'Musyrif Pembina',
        createdAt: existingRecord?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setSaveSuccessMsg(`Absensi ${selectedSession} (${dayInfo.dayName}, ${selectedDate}) berhasil disimpan di Firebase!`);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan absensi ke Firestore. Coba periksa koneksi.');
    } finally {
      setIsSaving(false);
    }
  };

  // Quick Date Navigation
  const changeDateByDays = (delta: number) => {
    const parts = selectedDate.split('-');
    const cur = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    cur.setDate(cur.getDate() + delta);
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${d}`);
  };

  // Rekapitulasi per santri calculation
  const studentRekap = useMemo(() => {
    const map: Record<
      string,
      {
        student: Student;
        totalSessions: number;
        hadir: number;
        izin: number;
        sakit: number;
        alpa: number;
      }
    > = {};

    students.forEach((s) => {
      map[s.id] = {
        student: s,
        totalSessions: 0,
        hadir: 0,
        izin: 0,
        sakit: 0,
        alpa: 0,
      };
    });

    attendances.forEach((att) => {
      if (att.records && Array.isArray(att.records)) {
        att.records.forEach((item) => {
          if (map[item.studentId]) {
            map[item.studentId].totalSessions++;
            if (item.status === 'hadir') map[item.studentId].hadir++;
            else if (item.status === 'izin') map[item.studentId].izin++;
            else if (item.status === 'sakit') map[item.studentId].sakit++;
            else if (item.status === 'alpa') map[item.studentId].alpa++;
          }
        });
      }
    });

    return Object.values(map).map((entry) => {
      const pct = entry.totalSessions > 0 ? Math.round((entry.hadir / entry.totalSessions) * 100) : 100;
      return { ...entry, pct };
    });
  }, [students, attendances]);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Absensi Real-Time
            </span>
            <span className="text-xs text-slate-500 font-medium">Rumah Quran Kuningan</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Absensi Sesi Belajar & Tasmi'
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan presensi per sesi (Senin-Jumat: 4 sesi KBM; Sabtu: maks. Sesi 2 khusus Tasmi' Pekanan; Ahad: Libur).
          </p>
        </div>

        {/* View Switcher: Input vs Rekap */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('input')}
            className={`px-3 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'input'
                ? 'bg-white text-emerald-800 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Input Presensi Sesi</span>
          </button>
          <button
            onClick={() => setActiveSubTab('rekap')}
            className={`px-3 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'rekap'
                ? 'bg-white text-emerald-800 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
            <span>Rekap & Riwayat</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'input' ? (
        <div className="space-y-6">
          {/* Schedule Rules Notice Banner */}
          <div
            className={`p-4 rounded-2xl border transition-colors ${
              dayInfo.isAhad
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : dayInfo.isSabtu
                ? 'bg-purple-50 border-purple-200 text-purple-900'
                : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    dayInfo.isAhad
                      ? 'bg-rose-200 text-rose-800'
                      : dayInfo.isSabtu
                      ? 'bg-purple-200 text-purple-800'
                      : 'bg-emerald-200 text-emerald-800'
                  }`}
                >
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">
                      {dayInfo.dayName}, {selectedDate}
                    </span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        dayInfo.isAhad
                          ? 'bg-rose-600 text-white'
                          : dayInfo.isSabtu
                          ? 'bg-purple-700 text-white'
                          : 'bg-emerald-700 text-white'
                      }`}
                    >
                      {dayInfo.isAhad
                        ? 'Hari Libur (Ahad)'
                        : dayInfo.isSabtu
                        ? "Sabtu: Tasmi' Pekanan"
                        : 'Senin - Jumat: KBM Aktif'}
                    </span>
                  </div>
                  <p className="text-xs mt-1 leading-relaxed opacity-90">
                    {dayInfo.isAhad &&
                      'Hari Ahad adalah jadwal libur resmi santri & musyrif. Tidak ada KBM formal. Anda tetap dapat meninjau riwayat absensi atau memilih hari aktif.'}
                    {dayInfo.isSabtu &&
                      "Jadwal hari Sabtu aktif hingga Sesi 2 khusus untuk agenda Tasmi' Pekanan santri. Sesi 3 & 4 dinonaktifkan."}
                    {dayInfo.isWeekday &&
                      'Kegiatan Belajar Mengajar (KBM) aktif penuh mulai dari Sesi 1 sampai Sesi 4 untuk seluruh halaqah.'}
                  </p>
                </div>
              </div>

              {/* Date Quick Switcher Buttons */}
              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => changeDateByDays(-1)}
                  className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-700 border border-slate-300 text-xs flex items-center gap-1 shadow-2xs cursor-pointer"
                  title="Hari Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Kemarin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDate(getTodayString())}
                  className="px-2.5 py-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-800 font-bold border border-slate-300 text-xs shadow-2xs cursor-pointer"
                >
                  Hari Ini
                </button>
                <button
                  type="button"
                  onClick={() => changeDateByDays(1)}
                  className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-700 border border-slate-300 text-xs flex items-center gap-1 shadow-2xs cursor-pointer"
                  title="Hari Berikutnya"
                >
                  <span className="hidden sm:inline">Besok</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Control Strip: Date, Sesi Buttons, Halaqah Filter */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Tanggal Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Pilih Tanggal
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Halaqah / Class Filter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Pilih Halaqah / Kelas
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">Semua Halaqah ({students.length} Santri)</option>
                  {classes.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pencatat / Musyrif Bertugas */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Musyrif Bertugas
                </label>
                <select
                  value={recordedBy}
                  onChange={(e) => setRecordedBy(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  {musyrifs.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                  {musyrifs.length === 0 && <option value="Musyrif Pembina">Musyrif Pembina</option>}
                </select>
              </div>

              {/* Search Santri in List */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Cari Santri
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Ketik nama atau NIS..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Sesi Tabs (Sesi 1, Sesi 2, Sesi 3, Sesi 4 with Saturday & Sunday restrictions) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Pilihan Sesi Presensi:</span>
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {existingRecord ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Tercatat di Firestore
                    </span>
                  ) : (
                    <span className="text-amber-700">Belum disimpan / Sesi Baru</span>
                  )}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {ALL_SESSIONS.map((sesi) => {
                  const isSelected = selectedSession === sesi;
                  // If Saturday, only Sesi 1 & 2 allowed
                  const isSaturdayBlocked = dayInfo.isSabtu && (sesi === 'Sesi 3' || sesi === 'Sesi 4');
                  const isSundayBlocked = dayInfo.isAhad;

                  return (
                    <button
                      key={sesi}
                      type="button"
                      disabled={isSaturdayBlocked}
                      onClick={() => setSelectedSession(sesi)}
                      className={`py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer font-bold text-xs flex flex-col items-center justify-center gap-1 ${
                        isSaturdayBlocked
                          ? 'opacity-40 bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                          : isSelected
                          ? 'border-emerald-600 bg-emerald-700 text-white shadow-md shadow-emerald-700/20 ring-2 ring-emerald-500/30'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-emerald-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-emerald-600'}`} />
                        <span>{sesi}</span>
                      </div>
                      <span className={`text-[10px] font-medium ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                        {isSaturdayBlocked
                          ? 'Non-Aktif (Sabtu)'
                          : dayInfo.isSabtu
                          ? "Tasmi' Pekanan"
                          : 'KBM Aktif'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Metric Bar for this Session */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center shadow-2xs">
              <span className="text-[11px] font-medium text-slate-500 block">Total Santri</span>
              <span className="text-xl font-extrabold text-slate-800">{sessionStats.total}</span>
            </div>
            <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200 text-center shadow-2xs">
              <span className="text-[11px] font-bold text-emerald-800 block">Hadir (H)</span>
              <span className="text-xl font-extrabold text-emerald-700">{sessionStats.hadir}</span>
            </div>
            <div className="bg-blue-50/80 p-3.5 rounded-xl border border-blue-200 text-center shadow-2xs">
              <span className="text-[11px] font-bold text-blue-800 block">Izin (I)</span>
              <span className="text-xl font-extrabold text-blue-700">{sessionStats.izin}</span>
            </div>
            <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 text-center shadow-2xs">
              <span className="text-[11px] font-bold text-amber-800 block">Sakit (S)</span>
              <span className="text-xl font-extrabold text-amber-700">{sessionStats.sakit}</span>
            </div>
            <div className="bg-rose-50/80 p-3.5 rounded-xl border border-rose-200 text-center shadow-2xs">
              <span className="text-[11px] font-bold text-rose-800 block">Alpa (A)</span>
              <span className="text-xl font-extrabold text-rose-700">{sessionStats.alpa}</span>
            </div>
            <div className="bg-slate-900 text-white p-3.5 rounded-xl text-center shadow-2xs flex flex-col justify-center">
              <span className="text-[11px] font-medium text-slate-300 block">% Kehadiran</span>
              <span className="text-xl font-extrabold text-emerald-400">{sessionStats.rate}%</span>
            </div>
          </div>

          {/* Success Toast */}
          {saveSuccessMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Students Attendance Table / Cards */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Table Header Action Bar */}
            <div className="p-4 bg-slate-50/90 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-700" />
                <span className="font-bold text-sm text-slate-800">
                  Daftar Santri ({filteredStudents.length} Santri)
                </span>
                <span className="text-xs text-slate-500">
                  • {selectedSession} • {dayInfo.dayName}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleMarkAllPresent}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Tandai Semua Hadir</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Absensi Sesi'}</span>
                </button>
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Users className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-sm font-medium">Tidak ada data santri ditemukan.</p>
                <p className="text-xs text-slate-400">Silakan tambahkan santri pada tab Data Santri.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredStudents.map((st, idx) => {
                  const currentStatus = recordsMap[st.id]?.status || 'hadir';
                  const currentNote = recordsMap[st.id]?.note || '';

                  return (
                    <div
                      key={st.id}
                      className="p-3.5 sm:p-4 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      {/* Student info */}
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <span className="text-xs font-bold text-slate-400 w-5 shrink-0">
                          {idx + 1}.
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-100 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                          {st.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-slate-900 truncate">
                            {st.name}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                            <span>NIS: {st.nis || '-'}</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-medium">{st.classGroup}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Buttons & Notes */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 shrink-0">
                        {/* 4 Status Choice Buttons */}
                        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                          <button
                            type="button"
                            onClick={() => handleSetStatus(st.id, 'hadir')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              currentStatus === 'hadir'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-emerald-700'
                            }`}
                          >
                            Hadir
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetStatus(st.id, 'izin')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              currentStatus === 'izin'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-blue-700'
                            }`}
                          >
                            Izin
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetStatus(st.id, 'sakit')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              currentStatus === 'sakit'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-amber-700'
                            }`}
                          >
                            Sakit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetStatus(st.id, 'alpa')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              currentStatus === 'alpa'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-rose-700'
                            }`}
                          >
                            Alpa
                          </button>
                        </div>

                        {/* Optional note input */}
                        <input
                          type="text"
                          value={currentNote}
                          onChange={(e) => handleSetNote(st.id, e.target.value)}
                          placeholder="Catatan / keterangan..."
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:ring-1 focus:ring-emerald-500 w-full sm:w-44"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Save Bar */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                Pencatat: <span className="font-semibold text-slate-800">{recordedBy || 'Musyrif Pembina'}</span> • Sesi:{' '}
                <span className="font-semibold text-slate-800">{selectedSession}</span> ({selectedDate})
              </div>

              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-emerald-700/20 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Presensi Sesi ke Firebase'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Sub Tab: Rekap & Riwayat Presensi */
        <div className="space-y-6">
          {/* Rekap Header Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Rekapitulasi Kehadiran Santri
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Akumulasi kehadiran dari seluruh sesi KBM dan Tasmi' Pekanan yang tercatat di Firestore.
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Cetak Rekap</span>
            </button>
          </div>

          {/* Rekap Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <th className="py-3 px-4">No</th>
                    <th className="py-3 px-4">Nama Santri</th>
                    <th className="py-3 px-4">Halaqah</th>
                    <th className="py-3 px-4 text-center">Total Sesi</th>
                    <th className="py-3 px-4 text-center text-emerald-700">Hadir</th>
                    <th className="py-3 px-4 text-center text-blue-700">Izin</th>
                    <th className="py-3 px-4 text-center text-amber-700">Sakit</th>
                    <th className="py-3 px-4 text-center text-rose-700">Alpa</th>
                    <th className="py-3 px-4 text-center">Persentase</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentRekap.map((r, i) => (
                    <tr key={r.student.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-slate-400 font-medium">{i + 1}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{r.student.name}</span>
                        <span className="text-[11px] text-slate-400">NIS: {r.student.nis || '-'}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{r.student.classGroup}</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">{r.totalSessions}</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-700 bg-emerald-50/30">
                        {r.hadir}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-blue-700">{r.izin}</td>
                      <td className="py-3 px-4 text-center font-semibold text-amber-700">{r.sakit}</td>
                      <td className="py-3 px-4 text-center font-semibold text-rose-700">{r.alpa}</td>
                      <td className="py-3 px-4 text-center font-extrabold text-slate-900">
                        {r.totalSessions > 0 ? `${r.pct}%` : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {r.totalSessions === 0 ? (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                            Belum Ada Sesi
                          </span>
                        ) : r.pct >= 90 ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                            Sangat Baik
                          </span>
                        ) : r.pct >= 75 ? (
                          <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold">
                            Cukup
                          </span>
                        ) : (
                          <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">
                            Perlu Perhatian
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
