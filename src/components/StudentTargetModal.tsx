import React, { useState, useEffect } from 'react';
import { Target, X, Check, BookOpen, Sparkles, Award, Calendar, AlertCircle } from 'lucide-react';
import { Student } from '../types';
import { SURAH_LIST } from '../data/quranData';
import { saveStudent } from '../services/quranService';

interface StudentTargetModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (updatedStudent: Student) => void;
}

export const StudentTargetModal: React.FC<StudentTargetModalProps> = ({
  student,
  isOpen,
  onClose,
  onSaved,
}) => {
  if (!isOpen || !student) return null;

  // Target Form States
  const [targetSurah, setTargetSurah] = useState<string>(student.targetSurah || "An-Naba'");
  const [currentJuz, setCurrentJuz] = useState<number>(
    typeof student.currentJuz === 'number'
      ? student.currentJuz
      : Number(student.currentJuz) || student.targetJuz || 30
  );
  const [targetTotalJuz, setTargetTotalJuz] = useState<number>(student.targetJuz || 30);

  // Standar RQ targets
  const [targetHarianPages, setTargetHarianPages] = useState<number>(
    student.targetHarianPages !== undefined ? student.targetHarianPages : 2 // 2 halaman = 1 lembar
  );
  const [targetPekananPages, setTargetPekananPages] = useState<number>(
    student.targetPekananPages !== undefined ? student.targetPekananPages : 10 // 10 halaman = 5 lembar
  );
  const [targetBulananJuz, setTargetBulananJuz] = useState<number>(
    student.targetBulananJuz !== undefined ? student.targetBulananJuz : 1.5 // 1.5 Juz
  );
  const [targetNotes, setTargetNotes] = useState<string>(
    student.targetNotes || 'Target standar RQ: 1 lembar/hari aktif KBM, 5 lembar/pekan, min 1.5 Juz/bulan.'
  );

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successNotice, setSuccessNotice] = useState<boolean>(false);

  // Reset form when student changes
  useEffect(() => {
    if (student) {
      setTargetSurah(student.targetSurah || "An-Naba'");
      setCurrentJuz(
        typeof student.currentJuz === 'number'
          ? student.currentJuz
          : Number(student.currentJuz) || student.targetJuz || 30
      );
      setTargetTotalJuz(student.targetJuz || 30);
      setTargetHarianPages(student.targetHarianPages !== undefined ? student.targetHarianPages : 2);
      setTargetPekananPages(student.targetPekananPages !== undefined ? student.targetPekananPages : 10);
      setTargetBulananJuz(student.targetBulananJuz !== undefined ? student.targetBulananJuz : 1.5);
      setTargetNotes(
        student.targetNotes ||
          'Target standar RQ: 1 lembar/hari aktif KBM, 5 lembar/pekan, min 1.5 Juz/bulan.'
      );
      setSuccessNotice(false);
    }
  }, [student]);

  // Set default RQ Target in one click
  const handleApplyRQStandard = () => {
    setTargetHarianPages(2); // 1 lembar
    setTargetPekananPages(10); // 5 lembar
    setTargetBulananJuz(1.5); // 1.5 juz
    setTargetNotes('Target resmi RQ: 1 lembar/hari (Senin-Jumat), 5 lembar/pekan, minimal 1.5 Juz/bulan.');
  };

  const handleSurahSelect = (surahName: string) => {
    setTargetSurah(surahName);
    const found = SURAH_LIST.find((s) => s.name === surahName);
    if (found && found.defaultJuz) {
      setCurrentJuz(found.defaultJuz);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const selectedSurahObj = SURAH_LIST.find((s) => s.name === targetSurah);
      const updatedData: Student = {
        ...student,
        targetSurah: targetSurah.trim(),
        targetSurahNumber: selectedSurahObj?.number || 78,
        currentJuz: Number(currentJuz) || 30,
        targetJuz: Number(targetTotalJuz) || 30,
        targetHarianPages: Number(targetHarianPages) || 2,
        targetPekananPages: Number(targetPekananPages) || 10,
        targetBulananJuz: Number(targetBulananJuz) || 1.5,
        targetNotes: targetNotes.trim(),
        updatedAt: new Date().toISOString(),
      };

      await saveStudent(updatedData);
      setSuccessNotice(true);
      if (onSaved) onSaved(updatedData);

      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan target hafalan.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-auto animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Atur Target Hafalan Santri</h3>
              <p className="text-xs text-emerald-200">
                Santri: <b className="text-white">{student.name}</b> ({student.classGroup})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          {/* Quick Apply Standard Button */}
          <div className="bg-amber-50 border border-amber-200/90 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Standar Mutaba'ah Rumah Qur'an</span>
              </span>
              <p className="text-[11px] text-slate-600">
                1 lembar (2 hal)/hari • 5 lembar/pekan • Min. 1.5 Juz/bulan
              </p>
            </div>
            <button
              type="button"
              onClick={handleApplyRQStandard}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold rounded-lg cursor-pointer transition-colors shrink-0 shadow-2xs"
            >
              <span>Gunakan Standar RQ</span>
            </button>
          </div>

          {/* Target Surah & Juz Saat Ini */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Target Surah Saat Ini <span className="text-rose-500">*</span>
              </label>
              <select
                value={targetSurah}
                onChange={(e) => handleSurahSelect(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                required
              >
                {SURAH_LIST.map((surah) => (
                  <option key={surah.number} value={surah.name}>
                    {surah.number}. {surah.name} ({surah.ayahCount} ayat)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Target Juz Saat Ini <span className="text-rose-500">*</span>
              </label>
              <select
                value={currentJuz}
                onChange={(e) => setCurrentJuz(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                required
              >
                {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
                  <option key={j} value={j}>
                    Juz {j}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Rincian Target Harian, Pekanan, dan Bulanan */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/90 space-y-3">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wide">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Target Kecepatan Hafalan (Standar RQ)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Target Harian */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                <label className="block font-bold text-slate-700 text-[11px] mb-1">
                  Target Harian
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    max={20}
                    step={1}
                    value={targetHarianPages}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setTargetHarianPages(val);
                      setTargetPekananPages(val * 5); // 5 hari KBM aktif
                    }}
                    className="w-16 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-center font-bold text-slate-900 text-xs"
                    required
                  />
                  <span className="text-[11px] text-slate-500 font-medium">Halaman</span>
                </div>
                <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                  = {(targetHarianPages / 2).toFixed(1)} Lembar / hari
                </p>
              </div>

              {/* Target Pekanan */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                <label className="block font-bold text-slate-700 text-[11px] mb-1">
                  Target Pekanan
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={2}
                    max={100}
                    step={1}
                    value={targetPekananPages}
                    onChange={(e) => setTargetPekananPages(Number(e.target.value))}
                    className="w-16 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-center font-bold text-slate-900 text-xs"
                    required
                  />
                  <span className="text-[11px] text-slate-500 font-medium">Halaman</span>
                </div>
                <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                  = {(targetPekananPages / 2).toFixed(0)} Lembar / pekan
                </p>
              </div>

              {/* Target Bulanan */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                <label className="block font-bold text-slate-700 text-[11px] mb-1">
                  Target Bulanan
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={0.5}
                    max={10}
                    step={0.5}
                    value={targetBulananJuz}
                    onChange={(e) => setTargetBulananJuz(Number(e.target.value))}
                    className="w-16 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-center font-bold text-slate-900 text-xs"
                    required
                  />
                  <span className="text-[11px] text-slate-500 font-medium">Juz</span>
                </div>
                <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                  Min. {targetBulananJuz} Juz / bulan
                </p>
              </div>
            </div>
          </div>

          {/* Target Total Juz */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Target Total Hafalan Keseluruhan
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={30}
                value={targetTotalJuz}
                onChange={(e) => setTargetTotalJuz(Number(e.target.value))}
                className="w-24 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
              />
              <span className="text-slate-600 font-medium text-xs">Juz (e.g. 30 Juz)</span>
            </div>
          </div>

          {/* Catatan / Bimbingan Musyrif */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Catatan Arahan & Rencana Musyrif
            </label>
            <textarea
              rows={2}
              value={targetNotes}
              onChange={(e) => setTargetNotes(e.target.value)}
              placeholder="Contoh: Fokus kelancaran hafalan baru di sesi 1 dan murojaah mutqin di sesi 2..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
            ></textarea>
          </div>

          {/* Success Indicator */}
          {successNotice && (
            <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl flex items-center gap-2 font-semibold">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Target hafalan berhasil disimpan ke database!</span>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
            >
              <Target className="w-4 h-4 text-amber-300" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Target Hafalan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
