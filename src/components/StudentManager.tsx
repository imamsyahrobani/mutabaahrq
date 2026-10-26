import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  BookOpen,
  Award,
  Trash2,
  Edit2,
  PlusCircle,
  TrendingUp,
  X,
  CheckCircle2,
  Target,
  Calendar,
  Sparkles,
  Flame,
  Check,
  Clock,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { Student, Assessment } from '../types';
import { saveStudent, removeStudent } from '../services/quranService';
import { SURAH_LIST } from '../data/quranData';
import { StudentTargetModal } from './StudentTargetModal';

interface StudentManagerProps {
  students: Student[];
  assessments: Assessment[];
  classes: string[];
  onAssessStudent: (student: Student) => void;
  onSyncRoster?: () => void;
  onViewReport?: (item: Assessment) => void;
}

// Helper dates for weekly and monthly calculations
function getMondayOfWeek(d: Date = new Date()): string {
  const date = new Date(d);
  const day = date.getDay(); // 0 is Sunday, 1 is Monday
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  const year = monday.getFullYear();
  const month = String(monday.getMonth() + 1).padStart(2, '0');
  const dayNum = String(monday.getDate()).padStart(2, '0');
  return `${year}-${month}-${dayNum}`;
}

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getCurrentMonthPrefix(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export const StudentManager: React.FC<StudentManagerProps> = ({
  students,
  assessments,
  classes,
  onAssessStudent,
  onSyncRoster,
  onViewReport,
}) => {
  const [search, setSearch] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Target modal state
  const [targetStudent, setTargetStudent] = useState<Student | null>(null);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState<boolean>(false);

  // Form states for Add/Edit
  const [name, setName] = useState<string>('');
  const [nis, setNis] = useState<string>('');
  const [classGroup, setClassGroup] = useState<string>('');
  const [gender, setGender] = useState<'ikhwan' | 'akhwat'>('ikhwan');
  const [targetJuz, setTargetJuz] = useState<number>(30);
  const [currentJuz, setCurrentJuz] = useState<number>(30);
  const [targetSurah, setTargetSurah] = useState<string>("An-Naba'");
  const [targetHarianPages, setTargetHarianPages] = useState<number>(2);
  const [targetPekananPages, setTargetPekananPages] = useState<number>(10);
  const [targetBulananJuz, setTargetBulananJuz] = useState<number>(1.5);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const openAddModal = () => {
    setEditingStudent(null);
    setName('');
    setNis(`RQK-SAN-${Math.floor(100 + Math.random() * 900)}`);
    setClassGroup(classes[0] || 'Kelompok Ikhwan');
    setGender('ikhwan');
    setTargetJuz(30);
    setCurrentJuz(30);
    setTargetSurah("An-Naba'");
    setTargetHarianPages(2);
    setTargetPekananPages(10);
    setTargetBulananJuz(1.5);
    setIsAddModalOpen(true);
  };

  const openEditModal = (std: Student) => {
    setEditingStudent(std);
    setName(std.name);
    setNis(std.nis);
    setClassGroup(std.classGroup);
    setGender(std.gender || 'ikhwan');
    setTargetJuz(std.targetJuz || 30);
    setCurrentJuz(
      typeof std.currentJuz === 'number'
        ? std.currentJuz
        : Number(std.currentJuz) || std.targetJuz || 30
    );
    setTargetSurah(std.targetSurah || "An-Naba'");
    setTargetHarianPages(std.targetHarianPages !== undefined ? std.targetHarianPages : 2);
    setTargetPekananPages(std.targetPekananPages !== undefined ? std.targetPekananPages : 10);
    setTargetBulananJuz(std.targetBulananJuz !== undefined ? std.targetBulananJuz : 1.5);
    setIsAddModalOpen(true);
  };

  const openTargetModal = (std: Student) => {
    setTargetStudent(std);
    setIsTargetModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      await saveStudent({
        ...(editingStudent ? { id: editingStudent.id } : {}),
        name: name.trim(),
        nis: nis.trim() || `RQK-SAN-${Date.now().toString().slice(-4)}`,
        classGroup: classGroup.trim() || classes[0] || 'Kelompok Ikhwan',
        gender,
        targetJuz: Number(targetJuz),
        currentJuz: Number(currentJuz) || 30,
        targetSurah: targetSurah.trim() || "An-Naba'",
        targetHarianPages: Number(targetHarianPages) || 2,
        targetPekananPages: Number(targetPekananPages) || 10,
        targetBulananJuz: Number(targetBulananJuz) || 1.5,
        targetNotes:
          editingStudent?.targetNotes ||
          'Target resmi RQ: 1 lembar/hari aktif KBM, 5 lembar/pekan, min 1.5 Juz/bulan.',
        createdAt: editingStudent?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setIsAddModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan data santri.');
    } finally {
      setIsSaving(false);
    }
  };

  // Student metrics & RQ Progress Calculation
  const studentMetrics = useMemo(() => {
    const mondayStr = getMondayOfWeek();
    const todayStr = getTodayString();
    const monthStr = getCurrentMonthPrefix();

    const map = new Map<
      string,
      {
        count: number;
        avgScore: number;
        latestSurah: string;
        latestDate: string;
        weeklySheets: number;
        weeklyTargetSheets: number;
        weeklyPercent: number;
        monthlyJuz: number;
        monthlyTargetJuz: number;
        monthlyPercent: number;
        hasSetorToday: boolean;
      }
    >();

    students.forEach((std) => {
      const studentAsms = assessments.filter(
        (a) => a.studentId === std.id || a.studentName.toLowerCase() === std.name.toLowerCase()
      );

      const totalCount = studentAsms.length;
      const totalScoreSum = studentAsms.reduce((acc, a) => acc + a.totalScore, 0);
      const avgScore = totalCount > 0 ? Number((totalScoreSum / totalCount).toFixed(1)) : 0;

      // Latest assessment
      const sorted = [...studentAsms].sort(
        (a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime()
      );
      const latestSurah = sorted[0]?.surahName || '-';
      const latestDate = sorted[0]?.date || '-';

      // 1. Weekly Progress (Senin - Sabtu): Target default 5 lembar (10 halaman)
      const weeklyAsms = studentAsms.filter((a) => (a.date || a.createdAt) >= mondayStr);
      // Setiap setoran hafalan (ziyadah/tasmi) dihitung 1 lembar (2 halaman)
      const weeklySheets = weeklyAsms.length;
      const weeklyTargetSheets = Math.round((std.targetPekananPages || 10) / 2); // default 5 lembar
      const weeklyPercent = Math.min(100, Math.round((weeklySheets / Math.max(1, weeklyTargetSheets)) * 100));

      // 2. Monthly Progress: Target default minimal 1.5 Juz
      const monthlyAsms = studentAsms.filter((a) => (a.date || a.createdAt).startsWith(monthStr));
      // 1 Juz standar mushaf Madinah = 10 lembar (20 halaman). 1 lembar = 0.1 Juz.
      const monthlySheets = monthlyAsms.length;
      const monthlyJuz = Number(((monthlySheets * 2) / 20).toFixed(2));
      const monthlyTargetJuz = std.targetBulananJuz || 1.5;
      const monthlyPercent = Math.min(
        100,
        Math.round((monthlyJuz / Math.max(0.1, monthlyTargetJuz)) * 100)
      );

      // 3. Today's deposit status
      const hasSetorToday = studentAsms.some((a) => (a.date || a.createdAt) === todayStr);

      map.set(std.id, {
        count: totalCount,
        avgScore,
        latestSurah,
        latestDate,
        weeklySheets,
        weeklyTargetSheets,
        weeklyPercent,
        monthlyJuz,
        monthlyTargetJuz,
        monthlyPercent,
        hasSetorToday,
      });
    });

    return map;
  }, [students, assessments]);

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter((std) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!std.name.toLowerCase().includes(q) && !std.nis.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (selectedClass !== 'all' && std.classGroup !== selectedClass) {
        return false;
      }
      return true;
    });
  }, [students, search, selectedClass]);

  return (
    <div className="space-y-6">
      {/* RQ Standard Hafalan KPI Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white rounded-2xl p-5 shadow-sm border border-emerald-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                Standar Mutaba'ah Resmi
              </span>
              <span className="text-xs text-emerald-200">Rumah Qur'an Kuningan</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-400" />
              <span>Target Hafalan Santri: Harian, Pekanan, & Bulanan</span>
            </h3>
            <p className="text-xs text-emerald-100/90 max-w-2xl">
              Musyrif dapat memantau dan mengatur target surah atau juz per santri secara akurat.
            </p>
          </div>

          {/* 3 Metric Badges */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center shrink-0">
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 px-3 py-2 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-emerald-200 block">Harian</span>
              <span className="text-sm font-extrabold text-white">1 Lembar</span>
              <span className="text-[9px] text-emerald-300 block">2 Halaman / KBM</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 px-3 py-2 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-amber-300 block">Pekanan</span>
              <span className="text-sm font-extrabold text-amber-200">5 Lembar</span>
              <span className="text-[9px] text-amber-300/80 block">10 Halaman / Pekan</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 px-3 py-2 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-emerald-200 block">Bulanan</span>
              <span className="text-sm font-extrabold text-white">Min. 1.5 Juz</span>
              <span className="text-[9px] text-emerald-300 block">30 Halaman / Bulan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Banner & Search Filter Actions */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari santri berdasarkan nama atau NIS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Filter Halaqah & Add Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700"
          >
            <option value="all">Semua Kelas/Halaqah</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>

          {onSyncRoster && (
            <button
              onClick={onSyncRoster}
              title="Bersihkan data palsu dan pastikan hanya 9 santri resmi yang terdaftar"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Reset ke 9 Santri Resmi</span>
            </button>
          )}

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Santri</span>
          </button>
        </div>
      </div>

      {/* Official Groups Summary Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => setSelectedClass(selectedClass === 'Kelompok Ikhwan' ? 'all' : 'Kelompok Ikhwan')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedClass === 'Kelompok Ikhwan'
              ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200/80 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
              Kelompok Ikhwan
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              {students.filter((s) => s.classGroup === 'Kelompok Ikhwan').length} Santri
            </span>
          </div>
          <div className="mt-2.5">
            <h4 className="text-sm font-bold text-slate-900">Musyrif / Pengajar: Chandra Hidayat</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Santri: Aly Mudjahid, Hafiz Rizky, Irfan Hidayat, Naufal Haidar Azmi, Syarief Hidayatullah, Muhammad Ammar K.P
            </p>
          </div>
        </div>

        <div
          onClick={() => setSelectedClass(selectedClass === 'Kelompok Akhwat' ? 'all' : 'Kelompok Akhwat')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedClass === 'Kelompok Akhwat'
              ? 'bg-purple-50/90 border-purple-400 ring-2 ring-purple-500/20'
              : 'bg-white border-slate-200/80 hover:border-purple-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-800">
              Kelompok Akhwat
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              {students.filter((s) => s.classGroup === 'Kelompok Akhwat').length} Santri
            </span>
          </div>
          <div className="mt-2.5">
            <h4 className="text-sm font-bold text-slate-900">Musyrifah / Pengajar: Sofi Zahrotul Mutiah</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Santri: Amelia Agustin, Husna Ma'aab Laleno, Najwa Octa Salsabilah
            </p>
          </div>
        </div>
      </div>

      {/* Student Cards Grid */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-sm">Tidak ada santri ditemukan</h3>
          <p className="text-xs text-slate-500">
            {search ? 'Coba ubah kata kunci pencarian.' : 'Silakan tambahkan santri baru untuk memulai.'}
          </p>
          <button
            onClick={openAddModal}
            className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            + Tambah Santri
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStudents.map((std) => {
            const stats = studentMetrics.get(std.id) || {
              count: 0,
              avgScore: 0,
              latestSurah: '-',
              latestDate: '-',
              weeklySheets: 0,
              weeklyTargetSheets: 5,
              weeklyPercent: 0,
              monthlyJuz: 0,
              monthlyTargetJuz: 1.5,
              monthlyPercent: 0,
              hasSetorToday: false,
            };

            return (
              <div
                key={std.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Card Header: NIS, Name, Class & Edit/Delete */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          NIS: {std.nis}
                        </span>
                        {/* Daily Status Badge */}
                        {stats.hasSetorToday ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                            <span>Sudah Setor Hari Ini</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                            <Clock className="w-2.5 h-2.5 text-slate-400" />
                            <span>Belum Setor Hari Ini</span>
                          </span>
                        )}
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-base mt-1.5">{std.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">{std.classGroup}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(std)}
                        title="Edit data santri"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Hapus santri ${std.name}? Penilaian yang telah tersimpan tidak otomatis terhapus.`
                            )
                          ) {
                            removeStudent(std.id);
                          }
                        }}
                        title="Hapus data santri"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Target Focus Chip (Surah & Juz) */}
                  <div className="bg-amber-50/70 border border-amber-200/90 rounded-xl p-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg shrink-0">
                        <Target className="w-4 h-4 text-amber-700" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-amber-800 block">
                          Target Hafalan Saat Ini
                        </span>
                        <span className="font-extrabold text-xs text-slate-900">
                          Juz {std.currentJuz || 30} • Surat {std.targetSurah || "An-Naba'"}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => openTargetModal(std)}
                      className="px-2.5 py-1 bg-amber-200/80 hover:bg-amber-300 text-amber-900 text-[11px] font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      Ubah
                    </button>
                  </div>

                  {/* RQ TARGET PROGRESS BARS (Weekly & Monthly) */}
                  <div className="space-y-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs">
                    {/* 1. Pekanan Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold text-slate-700 flex items-center gap-1">
                          <span>Pekan Ini</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            (Target: {stats.weeklyTargetSheets} Lembar)
                          </span>
                        </span>
                        <span className="font-extrabold text-emerald-800">
                          {stats.weeklySheets} / {stats.weeklyTargetSheets} Lembar ({stats.weeklyPercent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all rounded-full ${
                            stats.weeklyPercent >= 100
                              ? 'bg-emerald-600'
                              : stats.weeklyPercent >= 60
                              ? 'bg-teal-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${stats.weeklyPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* 2. Bulanan Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold text-slate-700 flex items-center gap-1">
                          <span>Bulan Ini</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            (Target: Min. {stats.monthlyTargetJuz} Juz)
                          </span>
                        </span>
                        <span className="font-extrabold text-teal-800">
                          {stats.monthlyJuz} / {stats.monthlyTargetJuz} Juz ({stats.monthlyPercent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all rounded-full ${
                            stats.monthlyPercent >= 100
                              ? 'bg-emerald-600'
                              : stats.monthlyPercent >= 60
                              ? 'bg-teal-600'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${stats.monthlyPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Mini Quick Summary */}
                    <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Rata-rata: <b className="text-slate-800">{stats.avgScore || '-'}</b></span>
                      <span>Total: <b className="text-slate-800">{stats.count} Setoran</b></span>
                      <span>Terakhir: <b className="text-slate-800">{stats.latestSurah}</b></span>
                    </div>
                  </div>
                </div>

                {/* CTA Action Buttons: Atur Target, Input Nilai & Lihat Sertifikat */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
                  {/* Button Atur Target */}
                  <button
                    onClick={() => openTargetModal(std)}
                    title="Atur Target Juz, Surah, & Kecepatan Hafalan"
                    className="inline-flex items-center justify-center gap-1 px-2.5 py-2 bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200"
                  >
                    <Target className="w-3.5 h-3.5 text-amber-600" />
                    <span>Target</span>
                  </button>

                  {/* Button Input Nilai */}
                  <button
                    onClick={() => onAssessStudent(std)}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Input Nilai</span>
                  </button>

                  {/* Button Lihat Sertifikat */}
                  {(() => {
                    const latestAsm = assessments
                      .filter(
                        (a) =>
                          a.studentId === std.id || a.studentName.toLowerCase() === std.name.toLowerCase()
                      )
                      .sort(
                        (a, b) =>
                          new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime()
                      )[0];

                    if (onViewReport && latestAsm) {
                      return (
                        <button
                          onClick={() => onViewReport(latestAsm)}
                          title={`Lihat Sertifikat ${std.name} (${latestAsm.surahName})`}
                          className="inline-flex items-center justify-center gap-1 px-2.5 py-2 bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-900 border border-amber-200 hover:border-amber-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          <Award className="w-3.5 h-3.5 text-amber-600 group-hover:text-white" />
                          <span>Sertifikat</span>
                        </button>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Target Setting Modal */}
      <StudentTargetModal
        student={targetStudent}
        isOpen={isTargetModalOpen}
        onClose={() => setIsTargetModalOpen(false)}
      />

      {/* Add / Edit Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>{editingStudent ? 'Edit Data Santri' : 'Tambah Santri Baru'}</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Nama Lengkap Santri <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Muhammad Ziyad"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">NIS / ID Santri</label>
                  <input
                    type="text"
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'ikhwan' | 'akhwat')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800"
                  >
                    <option value="ikhwan">Ikhwan (Laki-laki)</option>
                    <option value="akhwat">Akhwat (Perempuan)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Halaqah / Kelas</label>
                <input
                  type="text"
                  placeholder="Kelompok Ikhwan"
                  value={classGroup}
                  onChange={(e) => setClassGroup(e.target.value)}
                  list="classes-list"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800"
                  required
                />
                <datalist id="classes-list">
                  {classes.map((cls) => (
                    <option key={cls} value={cls} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Target Surah</label>
                  <select
                    value={targetSurah}
                    onChange={(e) => setTargetSurah(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800"
                  >
                    {SURAH_LIST.map((s) => (
                      <option key={s.number} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Target Juz Saat Ini</label>
                  <select
                    value={currentJuz}
                    onChange={(e) => setCurrentJuz(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800"
                  >
                    {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
                      <option key={j} value={j}>
                        Juz {j}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
