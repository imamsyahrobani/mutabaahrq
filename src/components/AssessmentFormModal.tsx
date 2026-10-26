import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  BookOpen,
  User,
  Calendar,
  Sparkles,
  Award,
  CheckCircle2,
  ChevronDown,
  AlertCircle,
  HelpCircle,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Assessment, Student, AssessmentCategory, Musyrif } from '../types';
import { SURAH_LIST, CATEGORY_LABELS, QUICK_FEEDBACK_TEMPLATES } from '../data/quranData';
import { saveAssessment, saveStudent } from '../services/quranService';

interface AssessmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  musyrifs?: Musyrif[];
  initialData?: Assessment | null;
  classes: string[];
}

export const AssessmentFormModal: React.FC<AssessmentFormModalProps> = ({
  isOpen,
  onClose,
  students,
  musyrifs = [],
  initialData,
  classes,
}) => {
  // Form State
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentName, setStudentName] = useState<string>('');
  const [classGroup, setClassGroup] = useState<string>('');
  const [isNewStudentMode, setIsNewStudentMode] = useState<boolean>(false);
  const [newStudentNIS, setNewStudentNIS] = useState<string>('');

  const [category, setCategory] = useState<AssessmentCategory>('ziyadah');
  const [session, setSession] = useState<'Sesi 1' | 'Sesi 2' | 'Sesi 3' | 'Sesi 4' | string>('Sesi 1');
  const [manualSurah, setManualSurah] = useState<string>('An-Naba');
  const [manualJuz, setManualJuz] = useState<string>('30');
  const [manualHalaman, setManualHalaman] = useState<string>('');
  const [manualAyat, setManualAyat] = useState<string>('1 - 40');

  // Criteria scores (0 - 100)
  const [kelancaran, setKelancaran] = useState<number>(90);
  const [tajwid, setTajwid] = useState<number>(90);
  const [makhraj, setMakhraj] = useState<number>(90);
  const [adab, setAdab] = useState<number>(95);

  const [notes, setNotes] = useState<string>('');
  const [examinerName, setExaminerName] = useState<string>('Ustadz Pembina');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Calculate Weighted Total Score & Grade
  const { totalScore, grade } = useMemo(() => {
    // Standard bobot: Kelancaran 30%, Tajwid 30%, Makhraj 25%, Adab 15%
    const score = Number(
      (kelancaran * 0.3 + tajwid * 0.3 + makhraj * 0.25 + adab * 0.15).toFixed(1)
    );

    let g: Assessment['grade'] = 'Maqbul (C)';
    if (score >= 90) g = 'Mumtaz (A+)';
    else if (score >= 80) g = 'Jayyid Jiddan (A)';
    else if (score >= 70) g = 'Jayyid (B)';
    else if (score >= 60) g = 'Maqbul (C)';
    else g = 'Rasib (D)';

    return { totalScore: score, grade: g };
  }, [kelancaran, tajwid, makhraj, adab]);

  // Initialize form when opening or editing
  useEffect(() => {
    if (initialData) {
      setSelectedStudentId(initialData.studentId);
      setStudentName(initialData.studentName);
      setClassGroup(initialData.classGroup);
      setIsNewStudentMode(false);
      setCategory(initialData.category);
      setSession(initialData.session || 'Sesi 1');
      setManualSurah(initialData.surahName || 'An-Naba');
      setManualJuz(String(initialData.juz || '30'));
      setManualHalaman(initialData.halaman || '');
      setManualAyat(
        initialData.ayat ||
        (initialData.ayahStart !== undefined ? `${initialData.ayahStart} - ${initialData.ayahEnd}` : '1 - 40')
      );
      setKelancaran(initialData.kelancaran);
      setTajwid(initialData.tajwid);
      setMakhraj(initialData.makhraj);
      setAdab(initialData.adab);
      setNotes(initialData.notes);
      setExaminerName(initialData.examinerName || musyrifs[0]?.name || 'Ustadz Pembina');
      setDate(initialData.date || new Date().toISOString().split('T')[0]);
    } else {
      // Default reset
      if (students.length > 0) {
        setSelectedStudentId(students[0].id);
        setStudentName(students[0].name);
        setClassGroup(students[0].classGroup);
        setIsNewStudentMode(false);
        if (students[0].targetSurah) {
          setManualSurah(students[0].targetSurah);
        }
        if (students[0].currentJuz) {
          setManualJuz(String(students[0].currentJuz));
        }
        const autoExaminer =
          students[0].classGroup === 'Kelompok Akhwat'
            ? 'Sofi Zahrotul Mutiah'
            : 'Chandra Hidayat';
        setExaminerName(autoExaminer);
      } else {
        setIsNewStudentMode(true);
        setStudentName('');
        setClassGroup(classes[0] || 'Kelompok Ikhwan');
        setExaminerName('Chandra Hidayat');
      }
      setCategory('ziyadah');
      setSession('Sesi 1');
      setManualSurah('An-Naba');
      setManualJuz('30');
      setManualHalaman('');
      setManualAyat('1 - 40');
      setKelancaran(90);
      setTajwid(90);
      setMakhraj(90);
      setAdab(95);
      setNotes('');
      setErrorMsg(null);
    }
  }, [initialData, isOpen, students, classes, musyrifs]);

  // Quick deduct / bonus handlers during live assessment
  const adjustScore = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    delta: number
  ) => {
    setter((prev) => Math.min(100, Math.max(0, prev + delta)));
  };

  const handleResetScores = () => {
    setKelancaran(100);
    setTajwid(100);
    setMakhraj(100);
    setAdab(100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    let finalStudentId = selectedStudentId;
    let finalStudentName = studentName.trim();
    let finalClassGroup = classGroup.trim();

    if (isNewStudentMode) {
      if (!finalStudentName) {
        setErrorMsg('Silakan masukkan nama santri');
        return;
      }
      if (!finalClassGroup) {
        finalClassGroup = classes[0] || 'Halaqah Umum';
      }
      setIsSubmitting(true);
      try {
        const generatedNIS = newStudentNIS.trim() || `NIS-${Date.now().toString().slice(-6)}`;
        finalStudentId = await saveStudent({
          name: finalStudentName,
          nis: generatedNIS,
          classGroup: finalClassGroup,
          targetJuz: parseInt(manualJuz) || 30,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error(err);
        setErrorMsg('Gagal menyimpan santri baru.');
        setIsSubmitting(false);
        return;
      }
    } else {
      if (!finalStudentId) {
        setErrorMsg('Silakan pilih santri terlebih dahulu.');
        return;
      }
    }

    if (!finalStudentName) {
      const found = students.find((s) => s.id === finalStudentId);
      if (found) {
        finalStudentName = found.name;
        finalClassGroup = found.classGroup;
      }
    }

    setIsSubmitting(true);

    try {
      await saveAssessment({
        ...(initialData?.id ? { id: initialData.id } : {}),
        studentId: finalStudentId,
        studentName: finalStudentName,
        classGroup: finalClassGroup,
        category,
        session,
        surahName: manualSurah.trim() || 'Al-Qur\'an',
        juz: manualJuz.trim() || '30',
        halaman: manualHalaman.trim(),
        ayat: manualAyat.trim(),
        kelancaran: Number(kelancaran),
        tajwid: Number(tajwid),
        makhraj: Number(makhraj),
        adab: Number(adab),
        totalScore,
        grade,
        notes: notes.trim(),
        examinerName: examinerName.trim() || 'Ustadz Pembina',
        date,
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Celebrate Mumtaz with confetti!
      if (grade === 'Mumtaz (A+)') {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#059669', '#10b981', '#f59e0b', '#3b82f6'],
          });
        } catch {
          // ignore if canvas blocked
        }
      }

      onClose();
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg('Gagal menyimpan penilaian. Periksa koneksi Firestore Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-300" />
              <span>{initialData ? 'Edit Penilaian Al-Qur\'an' : 'Input Penilaian Al-Qur\'an'}</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. DATA SANTRI & HALAQAH */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-600" />
                Data Santri
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsNewStudentMode(!isNewStudentMode);
                  setErrorMsg(null);
                }}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
              >
                {isNewStudentMode ? 'Pilih Santri yang Sudah Ada' : '+ Input Santri Baru Langsung'}
              </button>
            </div>

            {!isNewStudentMode ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Pilih Santri <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => {
                      setSelectedStudentId(e.target.value);
                      const std = students.find((s) => s.id === e.target.value);
                      if (std) {
                        setStudentName(std.name);
                        setClassGroup(std.classGroup);
                        if (std.targetSurah) {
                          setManualSurah(std.targetSurah);
                        }
                        if (std.currentJuz) {
                          setManualJuz(String(std.currentJuz));
                        }
                        if (std.classGroup === 'Kelompok Akhwat') {
                          setExaminerName('Sofi Zahrotul Mutiah');
                        } else {
                          setExaminerName('Chandra Hidayat');
                        }
                      }
                    }}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    {students.length === 0 && <option value="">(Belum ada santri, silakan input baru)</option>}
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.classGroup})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Kelas / Halaqah</label>
                  <input
                    type="text"
                    value={classGroup}
                    readOnly
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-600 cursor-not-allowed"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nama Santri Baru <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Muhammad Ali"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">NIS (Opsional)</label>
                  <input
                    type="text"
                    placeholder="2026001"
                    value={newStudentNIS}
                    onChange={(e) => setNewStudentNIS(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Kelas / Halaqah</label>
                  <input
                    type="text"
                    placeholder="Halaqah Ali Bin Abi Thalib"
                    value={classGroup}
                    onChange={(e) => setClassGroup(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. KATEGORI & SURAT AL-QUR'AN */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Kategori Penilaian
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(['ziyadah', 'murojaah', 'tasmi_pekanan', 'tasmi_juz', 'ujian_bulanan'] as const).map((catKey) => {
                  const meta = CATEGORY_LABELS[catKey];
                  const isSelected = category === catKey;
                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => setCategory(catKey)}
                      className={`px-3 py-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold shadow-xs ring-1 ring-emerald-600/30'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-bold">{meta?.label || catKey}</div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">{meta?.desc.split(' ')[0]}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pilihan Sesi 1, Sesi 2, Sesi 3, Sesi 4 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Pilihan Sesi (Jadwal Setoran) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md border border-emerald-200">
                  Terpilih: {session}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Sesi 1', 'Sesi 2', 'Sesi 3', 'Sesi 4'] as const).map((s) => {
                  const isSelected = session === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSession(s)}
                      className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer font-bold text-xs flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-600/30'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <span>{s}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. JUZ - SURAT - HALAMAN - AYAT (KETIK MANUAL BEBAS LINTAS SURAT & JUZ) */}
            <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-emerald-950 font-bold">
                <span>Materi Setoran / Ujian (Ketik Manual Bebas & Lintas Surat)</span>
                <span className="text-[11px] font-normal text-emerald-700">Dapat diketik manual bebas atau pilih saran cepat</span>
              </div>

              {/* Quick Presets / Shortcut Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] text-slate-500 font-medium">Contoh Cepat:</span>
                <button
                  type="button"
                  onClick={() => {
                    setManualJuz('30');
                    setManualSurah("An-Naba s/d An-Nas (Juz 30)");
                    setManualHalaman('582 - 604');
                    setManualAyat('1 s/d Selesai');
                  }}
                  className="text-[10px] bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md transition-colors"
                >
                  Juz 30 Lengkap
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setManualJuz('29 - 30');
                    setManualSurah("Al-Mulk s/d An-Nas (Lintas Juz)");
                    setManualHalaman('562 - 604');
                    setManualAyat('1 s/d Selesai');
                  }}
                  className="text-[10px] bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md transition-colors"
                >
                  Juz 29 - 30
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setManualJuz('29');
                    setManualSurah("Al-Mulk s/d Al-Qalam");
                    setManualHalaman('562 - 566');
                    setManualAyat('Ayat 1 - Selesai');
                  }}
                  className="text-[10px] bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md transition-colors"
                >
                  Al-Mulk s/d Al-Qalam
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setManualJuz('1 - 3');
                    setManualSurah("Al-Baqarah");
                    setManualHalaman('2 - 49');
                    setManualAyat('1 - 286');
                  }}
                  className="text-[10px] bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md transition-colors"
                >
                  Al-Baqarah
                </button>
              </div>

              {/* 4 Manual Inputs: Juz, Surat, Halaman, Ayat */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                {/* 1. JUZ */}
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-emerald-950 mb-1">
                    Juz <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 30 atau 29 - 30"
                    value={manualJuz}
                    onChange={(e) => setManualJuz(e.target.value)}
                    list="juz-suggestions"
                    className="w-full bg-white border border-emerald-200 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm"
                    required
                  />
                  <datalist id="juz-suggestions">
                    {Array.from({ length: 30 }, (_, i) => (
                      <option key={i + 1} value={`Juz ${i + 1}`} />
                    ))}
                    <option value="Juz 29 - 30" />
                    <option value="Juz 28 - 30" />
                    <option value="Juz 1 - 5" />
                    <option value="Juz 26 - 30" />
                  </datalist>
                </div>

                {/* 2. NAMA SURAT */}
                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-emerald-950 mb-1">
                    Nama Surat / Materi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: An-Naba atau Al-Mulk s/d Al-Qalam"
                    value={manualSurah}
                    onChange={(e) => setManualSurah(e.target.value)}
                    list="surah-suggestions"
                    className="w-full bg-white border border-emerald-200 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm"
                    required
                  />
                  <datalist id="surah-suggestions">
                    {SURAH_LIST.map((s) => (
                      <option key={s.number} value={s.name}>
                        {s.number}. {s.name} ({s.nameArabic}) - {s.ayahCount} Ayat
                      </option>
                    ))}
                    <option value="An-Naba s/d An-Nas (Juz 30)" />
                    <option value="Al-Mulk s/d Al-Mursalat (Juz 29)" />
                    <option value="Al-Mulk s/d Al-Qalam" />
                    <option value="Surat-Surat Pendek Juz 'Amma" />
                  </datalist>
                </div>

                {/* 3. HALAMAN */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-emerald-950 mb-1">
                    Halaman
                  </label>
                  <input
                    type="text"
                    placeholder="562 - 564"
                    value={manualHalaman}
                    onChange={(e) => setManualHalaman(e.target.value)}
                    className="w-full bg-white border border-emerald-200 rounded-lg px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm"
                  />
                </div>

                {/* 4. AYAT */}
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-emerald-950 mb-1">
                    Ayat
                  </label>
                  <input
                    type="text"
                    placeholder="1 - 40 atau 1 - Selesai"
                    value={manualAyat}
                    onChange={(e) => setManualAyat(e.target.value)}
                    className="w-full bg-white border border-emerald-200 rounded-lg px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Preview Ringkasan Materi */}
              <div className="pt-1 text-xs text-emerald-800 flex items-center justify-between border-t border-emerald-200/50">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">{manualSurah || '(Nama Surat)'}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                    {manualJuz.toLowerCase().includes('juz') ? manualJuz : `Juz ${manualJuz}`}
                  </span>
                  {manualHalaman && (
                    <span className="text-[11px] text-emerald-700">Hal: {manualHalaman}</span>
                  )}
                  {manualAyat && (
                    <span className="text-[11px] text-emerald-700">Ayat: {manualAyat}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3. KRITERIA PENILAIAN RUBRIC & QUICK SHORTCUTS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Rubrik Penilaian & Skor (0 - 100)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Gunakan slider atau tombol cepat pengurang kesalahan saat menyimak setoran santri
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetScores}
                className="text-xs text-slate-500 hover:text-emerald-700 underline font-medium"
              >
                Reset 100 Sempurna
              </button>
            </div>

            {/* Quick Listener Action Buttons */}
            <div className="bg-slate-100/90 p-2.5 rounded-xl border border-slate-200 flex flex-wrap gap-1.5 items-center">
              <span className="text-[11px] font-semibold text-slate-600 mr-1">Aksi Cepat Simak:</span>
              <button
                type="button"
                onClick={() => adjustScore(setTajwid, -2)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-slate-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 transition-colors cursor-pointer"
              >
                -2 Salah Tajwid
              </button>
              <button
                type="button"
                onClick={() => adjustScore(setMakhraj, -3)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-slate-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 transition-colors cursor-pointer"
              >
                -3 Salah Makhraj
              </button>
              <button
                type="button"
                onClick={() => adjustScore(setKelancaran, -5)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-slate-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 transition-colors cursor-pointer"
              >
                -5 Lupa / Terbata
              </button>
              <button
                type="button"
                onClick={() => adjustScore(setAdab, -2)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-slate-300 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 transition-colors cursor-pointer"
              >
                -2 Salah Waqaf
              </button>
              <button
                type="button"
                onClick={() => {
                  adjustScore(setKelancaran, +3);
                  adjustScore(setTajwid, +2);
                }}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                +5 Fashahah & Tartil
              </button>
            </div>

            {/* 4 Assessment Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Kelancaran */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-semibold text-slate-800">
                    1. Kelancaran & Fashahah <span className="text-slate-400 font-normal text-xs">(30%)</span>
                  </span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-xs border border-emerald-200">
                    {kelancaran}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={kelancaran}
                  onChange={(e) => setKelancaran(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Terbata (0)</span>
                  <span>Cukup (70)</span>
                  <span>Lancar Mutqin (100)</span>
                </div>
              </div>

              {/* Tajwid */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-semibold text-slate-800">
                    2. Kaidah Tajwid <span className="text-slate-400 font-normal text-xs">(30%)</span>
                  </span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-xs border border-emerald-200">
                    {tajwid}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={tajwid}
                  onChange={(e) => setTajwid(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Banyak Salah (0)</span>
                  <span>Memahami (75)</span>
                  <span>Kaidah Benar (100)</span>
                </div>
              </div>

              {/* Makhraj */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-semibold text-slate-800">
                    3. Makharijul Huruf & Sifat <span className="text-slate-400 font-normal text-xs">(25%)</span>
                  </span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-xs border border-emerald-200">
                    {makhraj}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={makhraj}
                  onChange={(e) => setMakhraj(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Tertukar Huruf (0)</span>
                  <span>Fasih Huruf (100)</span>
                </div>
              </div>

              {/* Adab */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-semibold text-slate-800">
                    4. Adab & Waqaf-Ibtida <span className="text-slate-400 font-normal text-xs">(15%)</span>
                  </span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-xs border border-emerald-200">
                    {adab}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={adab}
                  onChange={(e) => setAdab(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Kurang Tertib (0)</span>
                  <span>Sempurna & Khusyuk (100)</span>
                </div>
              </div>
            </div>

            {/* LIVE SCORE BADGE */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center font-bold text-2xl text-emerald-300">
                  {totalScore}
                </div>
                <div>
                  <div className="text-xs text-emerald-200 uppercase font-semibold">Total Nilai Akhir</div>
                  <div className="text-base font-bold flex items-center gap-1.5 text-white">
                    <Award className="w-4 h-4 text-amber-300" />
                    <span>{grade}</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-emerald-200/90 text-center sm:text-right">
                <div>Formula Terbobot Otomatis</div>
                <div className="text-[11px] text-emerald-300">
                  Kelancaran (30%) + Tajwid (30%) + Makhraj (25%) + Adab (15%)
                </div>
              </div>
            </div>
          </div>

          {/* 4. CATATAN & TEMPLATE REKOMENDASI */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Catatan & Evaluasi Penguji
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              <span className="text-[11px] text-slate-500 self-center">Template cepat:</span>
              {QUICK_FEEDBACK_TEMPLATES.slice(0, 4).map((tpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setNotes((prev) => (prev ? `${prev} ${tpl}` : tpl))}
                  className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-md transition-colors"
                >
                  + {tpl.slice(0, 32)}...
                </button>
              ))}
            </div>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tuliskan catatan perbaikan makhraj, tajwid, atau motivasi untuk santri..."
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* 5. TANGGAL & PENGUJI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Tanggal Penilaian
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nama Penguji / Musyrif <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Pilih atau ketik nama ustadz..."
                  value={examinerName}
                  onChange={(e) => setExaminerName(e.target.value)}
                  list="musyrif-suggestions"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <datalist id="musyrif-suggestions">
                  {musyrifs.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.role ? `${m.name} (${m.role})` : m.name}
                    </option>
                  ))}
                </datalist>
              </div>
              {musyrifs.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  <span className="text-[10px] text-slate-400 self-center">Pilih cepat:</span>
                  {musyrifs.slice(0, 3).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setExaminerName(m.name)}
                      className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded-md transition-colors"
                    >
                      {m.name.split(',')[0]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-semibold shadow-md shadow-emerald-700/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Menyimpan ke Cloud...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{initialData ? 'Perbarui Nilai' : 'Simpan Nilai Al-Qur\'an'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
