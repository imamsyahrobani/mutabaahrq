import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Edit3,
  Printer,
  Award,
  BookOpen,
  Calendar,
  User,
  LayoutGrid,
  List,
  ChevronRight,
  PlusCircle,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { Assessment } from '../types';
import { CATEGORY_LABELS } from '../data/quranData';

interface AssessmentListProps {
  assessments: Assessment[];
  classes: string[];
  onOpenCreateModal: () => void;
  onEditAssessment: (item: Assessment) => void;
  onDeleteAssessment: (id: string) => void;
  onViewReport: (item: Assessment) => void;
}

export const AssessmentList: React.FC<AssessmentListProps> = ({
  assessments,
  classes,
  onOpenCreateModal,
  onEditAssessment,
  onDeleteAssessment,
  onViewReport,
}) => {
  const [search, setSearch] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSession, setSelectedSession] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtered list
  const filteredList = useMemo(() => {
    return assessments.filter((item) => {
      // Search query match
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = item.studentName.toLowerCase().includes(q);
        const matchSurah = item.surahName.toLowerCase().includes(q);
        const matchClass = item.classGroup.toLowerCase().includes(q);
        const matchExaminer = (item.examinerName || '').toLowerCase().includes(q);
        const matchSession = (item.session || '').toLowerCase().includes(q);
        if (!matchName && !matchSurah && !matchClass && !matchExaminer && !matchSession) return false;
      }
      // Class filter
      if (selectedClass !== 'all' && item.classGroup !== selectedClass) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Session filter
      if (selectedSession !== 'all' && (item.session || 'Sesi 1') !== selectedSession) {
        return false;
      }
      // Grade filter
      if (selectedGrade !== 'all' && !item.grade.includes(selectedGrade)) {
        return false;
      }
      return true;
    });
  }, [assessments, search, selectedClass, selectedCategory, selectedSession, selectedGrade]);

  const getGradeBadge = (grade: string) => {
    if (grade.includes('Mumtaz')) {
      return 'bg-amber-50 text-amber-800 border-amber-300 font-bold';
    }
    if (grade.includes('Jayyid Jiddan')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold';
    }
    if (grade.includes('Jayyid')) {
      return 'bg-blue-50 text-blue-800 border-blue-300 font-medium';
    }
    if (grade.includes('Maqbul')) {
      return 'bg-slate-100 text-slate-800 border-slate-300 font-medium';
    }
    return 'bg-rose-50 text-rose-800 border-rose-300 font-medium';
  };

  return (
    <div className="space-y-6">
      {/* Top Bar: Search, Filters & View Toggle */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama santri, surat, atau penguji..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Hapus
              </button>
            )}
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-slate-600">
              <button
                onClick={() => setViewMode('cards')}
                title="Tampilan Kartu"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'cards' ? 'bg-white text-emerald-800 shadow-xs font-semibold' : 'hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                title="Tampilan Tabel Rapi"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-emerald-800 shadow-xs font-semibold' : 'hover:text-slate-900'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Input Nilai</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <div className="flex items-center gap-1 text-slate-500 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">Semua Kelas / Halaqah</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">Semua Kategori</option>
            {(['ziyadah', 'murojaah', 'tasmi_pekanan', 'tasmi_juz', 'ujian_bulanan'] as const).map((k) => (
              <option key={k} value={k}>
                {CATEGORY_LABELS[k]?.label || k}
              </option>
            ))}
          </select>

          {/* Session Filter (Sesi 1 - 4) */}
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:ring-1 focus:ring-emerald-500 font-medium"
          >
            <option value="all">Semua Sesi</option>
            <option value="Sesi 1">Sesi 1</option>
            <option value="Sesi 2">Sesi 2</option>
            <option value="Sesi 3">Sesi 3</option>
            <option value="Sesi 4">Sesi 4</option>
          </select>

          {/* Grade Filter */}
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">Semua Predikat</option>
            <option value="Mumtaz">Mumtaz (A+)</option>
            <option value="Jayyid Jiddan">Jayyid Jiddan (A)</option>
            <option value="Jayyid">Jayyid (B)</option>
            <option value="Maqbul">Maqbul (C)</option>
            <option value="Rasib">Rasib (D)</option>
          </select>

          {(selectedClass !== 'all' || selectedCategory !== 'all' || selectedSession !== 'all' || selectedGrade !== 'all' || search) && (
            <button
              onClick={() => {
                setSelectedClass('all');
                setSelectedCategory('all');
                setSelectedSession('all');
                setSelectedGrade('all');
                setSearch('');
              }}
              className="text-emerald-700 hover:text-emerald-800 underline font-semibold ml-auto"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Results Count Banner */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Menampilkan <strong className="text-slate-800">{filteredList.length}</strong> penilaian
          {assessments.length > 0 && ` dari total ${assessments.length} riwayat setoran`}
        </span>
      </div>

      {/* Empty State */}
      {filteredList.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Belum Ada Penilaian</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              {search || selectedClass !== 'all' || selectedCategory !== 'all'
                ? 'Tidak ditemukan nilai yang cocok dengan filter. Silakan reset filter.'
                : 'Mulai catat penilaian hafalan atau bacaan Al-Qur\'an santri dengan menekan tombol di bawah.'}
            </p>
          </div>
          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Input Nilai Sekarang</span>
          </button>
        </div>
      )}

      {/* 1. VIEW MODE: CARDS */}
      {viewMode === 'cards' && filteredList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((item) => {
            const catMeta = CATEGORY_LABELS[item.category] || {
              label: item.category,
              badgeBg: 'bg-slate-100 text-slate-800 border-slate-200',
            };

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Top */}
                <div className="p-4 sm:p-5 space-y-3.5">
                  {/* Category, Session & Date Header */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold ${catMeta.badgeBg}`}>
                        {catMeta.label}
                      </span>
                      <span className="px-2 py-0.5 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-800 text-[11px] font-semibold">
                        {item.session || 'Sesi 1'}
                      </span>
                    </div>
                    <span className="text-slate-400 flex items-center gap-1 text-[11px] shrink-0">
                      <Calendar className="w-3 h-3" />
                      {item.date}
                    </span>
                  </div>

                  {/* Student & Surah */}
                  <div>
                    <h4 className="font-bold text-slate-900 text-base group-hover:text-emerald-800 transition-colors">
                      {item.studentName}
                    </h4>
                    <p className="text-xs text-slate-500">{item.classGroup}</p>
                  </div>

                  {/* Surah Details Banner */}
                  <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-emerald-950">
                        {item.surahName.toLowerCase().startsWith('surat') ? item.surahName : `Surat ${item.surahName}`}
                      </div>
                      <div className="text-[11px] text-emerald-700 flex flex-wrap items-center gap-x-1.5 mt-0.5">
                        <span className="font-semibold">{String(item.juz).toLowerCase().includes('juz') ? item.juz : `Juz ${item.juz}`}</span>
                        {item.halaman && <span>• Hal. {item.halaman}</span>}
                        {(item.ayat || item.ayahStart !== undefined) && (
                          <span>• Ayat {item.ayat || `${item.ayahStart} - ${item.ayahEnd}`}</span>
                        )}
                      </div>
                    </div>
                    {item.surahArabic && (
                      <span className="font-arabic text-xl font-bold text-emerald-900">
                        {item.surahArabic}
                      </span>
                    )}
                  </div>

                  {/* Mini Scoring Breakdown Indicators */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1 text-center">
                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Lancar</div>
                      <div className="text-xs font-bold text-slate-800">{item.kelancaran}</div>
                    </div>
                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Tajwid</div>
                      <div className="text-xs font-bold text-slate-800">{item.tajwid}</div>
                    </div>
                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Makhraj</div>
                      <div className="text-xs font-bold text-slate-800">{item.makhraj}</div>
                    </div>
                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Adab</div>
                      <div className="text-xs font-bold text-slate-800">{item.adab}</div>
                    </div>
                  </div>

                  {/* Catatan Guru */}
                  {item.notes && (
                    <p className="text-xs text-slate-600 line-clamp-2 italic bg-slate-50/60 p-2 rounded-lg border border-slate-100">
                      "{item.notes}"
                    </p>
                  )}
                </div>

                {/* Card Bottom: Total Score & Action Buttons */}
                <div className="px-4 py-3 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-extrabold text-emerald-900">
                      {item.totalScore}
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-md border ${getGradeBadge(item.grade)}`}>
                      {item.grade.split(' ')[0]}
                    </span>
                  </div>

                  {/* Action Toolbar */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onViewReport(item)}
                      title="Lihat & Cetak Sertifikat Lembar Penilaian Resmi"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-300" />
                      <span>Lihat Sertifikat</span>
                    </button>
                    <button
                      onClick={() => onEditAssessment(item)}
                      title="Edit Nilai"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus penilaian untuk santri ${item.studentName}?`)) {
                          onDeleteAssessment(item.id);
                        }
                      }}
                      title="Hapus Nilai"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. VIEW MODE: TABLE */}
      {viewMode === 'table' && filteredList.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="p-3.5">Santri & Halaqah</th>
                  <th className="p-3.5">Kategori & Sesi</th>
                  <th className="p-3.5">Surat & Ayat</th>
                  <th className="p-3.5 text-center">Kelancaran</th>
                  <th className="p-3.5 text-center">Tajwid</th>
                  <th className="p-3.5 text-center">Makhraj</th>
                  <th className="p-3.5 text-center">Adab</th>
                  <th className="p-3.5 text-center">Total Skor</th>
                  <th className="p-3.5 text-center">Predikat</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 font-medium text-slate-900">
                      <div>{item.studentName}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{item.classGroup}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {CATEGORY_LABELS[item.category]?.label.split(' ')[0] || item.category}
                        </span>
                        <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                          {item.session || 'Sesi 1'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800">
                        {item.surahName.toLowerCase().startsWith('surat') ? item.surahName : `Surat ${item.surahName}`}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {String(item.juz).toLowerCase().includes('juz') ? item.juz : `Juz ${item.juz}`}
                        {item.halaman && ` • Hal. ${item.halaman}`}
                        {(item.ayat || item.ayahStart !== undefined) && ` • Ayat ${item.ayat || `${item.ayahStart} - ${item.ayahEnd}`}`}
                      </div>
                    </td>
                    <td className="p-3.5 text-center text-slate-700 font-medium">{item.kelancaran}</td>
                    <td className="p-3.5 text-center text-slate-700 font-medium">{item.tajwid}</td>
                    <td className="p-3.5 text-center text-slate-700 font-medium">{item.makhraj}</td>
                    <td className="p-3.5 text-center text-slate-700 font-medium">{item.adab}</td>
                    <td className="p-3.5 text-center font-bold text-emerald-800 text-sm">{item.totalScore}</td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded-md border text-[11px] ${getGradeBadge(item.grade)}`}>
                        {item.grade.split(' ')[0]}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => onViewReport(item)}
                          title="Lihat & Cetak Sertifikat Lembar Penilaian Resmi"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold cursor-pointer transition-colors shadow-2xs"
                        >
                          <Award className="w-3 h-3 text-amber-300" />
                          <span>Sertifikat</span>
                        </button>
                        <button
                          onClick={() => onEditAssessment(item)}
                          title="Edit"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus penilaian untuk ${item.studentName}?`)) {
                              onDeleteAssessment(item.id);
                            }
                          }}
                          title="Hapus"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
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
      )}
    </div>
  );
};
