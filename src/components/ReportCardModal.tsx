import React from 'react';
import { X, Printer, Award, BookOpen, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { Assessment } from '../types';
import { CATEGORY_LABELS } from '../data/quranData';
import { RumahQuranLogo } from './RumahQuranLogo';

interface ReportCardModalProps {
  assessment: Assessment | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatIndonesianDate(dateStr?: string): string {
  if (!dateStr) return '';
  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const month = months[parseInt(parts[1], 10) - 1] || parts[1];
    const day = parseInt(parts[2], 10);
    return `${day} ${month} ${year}`;
  }
  return dateStr;
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({ assessment, isOpen, onClose }) => {
  if (!isOpen || !assessment) return null;

  const handlePrint = () => {
    window.print();
  };

  const catMeta = CATEGORY_LABELS[assessment.category] || { label: assessment.category };
  const formattedDate = formatIndonesianDate(assessment.date);
  const docNumber = `RQK/EV-${(assessment.category || 'TAHFIDZ').toUpperCase().slice(0, 4)}/${
    assessment.date ? assessment.date.split('-')[0] : '2026'
  }/${(assessment.id || '000000').slice(-5).toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto print-modal-container">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-auto animate-in fade-in zoom-in-95 print-modal-content">
        {/* Header Bar - Hidden on print */}
        <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/80 flex items-center justify-center text-white">
              <Award className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <span className="font-bold text-sm block text-white">Sertifikat & Lembar Penilaian Al-Qur'an</span>
              <span className="text-[11px] text-emerald-300">Format cetak A4 portrait resmi Rumah Qur'an Kuningan</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 cursor-pointer transition-colors"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate / Printable Body */}
        <div className="p-4 sm:p-6 md:p-8 bg-slate-100/60 print:bg-white print:p-0">
          {/* Outer Certificate Frame */}
          <div className="bg-white rounded-xl border-4 border-emerald-800/90 p-1.5 shadow-md print:shadow-none print:border-3 print:border-emerald-800 print:rounded-none">
            {/* Inner Gold Fillet Border with Corner Arabesques */}
            <div className="border-2 border-amber-500/80 rounded-lg p-5 sm:p-7 relative bg-gradient-to-b from-emerald-50/20 via-white to-amber-50/15 print:bg-white print:p-6">
              {/* Four Corner Ornamental Stars */}
              <div className="absolute top-1 left-1 text-amber-600 text-xs font-serif select-none pointer-events-none">
                ✦
              </div>
              <div className="absolute top-1 right-1 text-amber-600 text-xs font-serif select-none pointer-events-none">
                ✦
              </div>
              <div className="absolute bottom-1 left-1 text-amber-600 text-xs font-serif select-none pointer-events-none">
                ✦
              </div>
              <div className="absolute bottom-1 right-1 text-amber-600 text-xs font-serif select-none pointer-events-none">
                ✦
              </div>

              {/* 1. KOP LEMBAGA RESMI DENGAN LOGO */}
              <div className="flex items-center justify-between gap-4 pb-4 border-b-2 border-emerald-900 print-avoid-break">
                {/* Logo Lembaga */}
                <div className="shrink-0 flex items-center justify-center">
                  <RumahQuranLogo size={70} />
                </div>

                {/* Teks Identitas Lembaga */}
                <div className="text-center flex-1 px-2">
                  <p className="font-arabic text-base sm:text-lg text-emerald-900 font-semibold tracking-wide">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </p>
                  <h1 className="text-lg sm:text-2xl font-black tracking-wider text-slate-900 uppercase mt-0.5">
                    RUMAH QUR'AN KUNINGAN
                  </h1>
                  <p className="text-[11px] sm:text-xs font-bold tracking-widest text-emerald-800 uppercase">
                    LEMBAGA PENDIDIKAN TAHFIDZ & TAHSIN AL-QUR'ANUL KARIM
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Kuningan, Jawa Barat • Pimpinan: <b>Ustadz Imam Syahrobani M.Pd</b>
                  </p>
                </div>

                {/* Stempel Dokumen / Nomor Registrasi */}
                <div className="shrink-0 text-right hidden sm:block print:block">
                  <div className="border border-emerald-300 bg-emerald-50/80 px-2.5 py-1.5 rounded-lg text-center">
                    <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider block">
                      Dokumen Resmi
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-700 block">{docNumber}</span>
                  </div>
                </div>
              </div>

              {/* Garis Ganda Kop Khas Dokumen Resmi */}
              <div className="w-full flex flex-col gap-[2px] mt-1 mb-5 print-avoid-break">
                <div className="h-[2px] bg-emerald-900 w-full"></div>
                <div className="h-[1px] bg-amber-500 w-full"></div>
              </div>

              {/* 2. JUDUL SERTIFIKAT / HASIL PENILAIAN */}
              <div className="text-center my-3 print-avoid-break">
                <span className="inline-block px-3 py-1 bg-emerald-800 text-amber-200 text-[11px] font-extrabold uppercase tracking-widest rounded-full shadow-xs">
                  SYAHADAH CAPAIAN HAFALAN & EVALUASI
                </span>
                <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase mt-1 tracking-tight">
                  LEMBAR HASIL PENILAIAN AL-QUR'AN
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  Kategori:{' '}
                  <b className="text-emerald-800">
                    {catMeta.label} ({assessment.session || 'Sesi 1'})
                  </b>
                </p>
              </div>

              {/* 3. BIODATA SANTRI & MATERI SETORAN */}
              <div className="my-4 bg-emerald-50/40 border border-emerald-200/90 rounded-xl p-3.5 sm:p-4 text-xs print-avoid-break">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                  <div className="flex items-center justify-between border-b border-emerald-100 sm:border-none pb-1 sm:pb-0">
                    <span className="text-slate-500 w-28 shrink-0">Nama Santri</span>
                    <span className="font-extrabold text-slate-900 text-sm sm:text-base flex-1 text-right sm:text-left">
                      : {assessment.studentName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-emerald-100 sm:border-none pb-1 sm:pb-0">
                    <span className="text-slate-500 w-28 shrink-0">Halaqah / Kelas</span>
                    <span className="font-bold text-slate-800 flex-1 text-right sm:text-left">
                      : {assessment.classGroup}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-emerald-100 sm:border-none pb-1 sm:pb-0">
                    <span className="text-slate-500 w-28 shrink-0">Materi Setoran</span>
                    <span className="font-bold text-emerald-900 flex-1 text-right sm:text-left">
                      :{' '}
                      {assessment.surahName.toLowerCase().startsWith('surat')
                        ? assessment.surahName
                        : `Surat ${assessment.surahName}`}{' '}
                      {(assessment.ayat || assessment.ayahStart !== undefined) &&
                        `(Ayat ${assessment.ayat || `${assessment.ayahStart} - ${assessment.ayahEnd}`})`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 w-28 shrink-0">Capaian Juz</span>
                    <span className="font-bold text-slate-800 flex-1 text-right sm:text-left">
                      : {String(assessment.juz).toLowerCase().includes('juz') ? assessment.juz : `Juz ${assessment.juz}`}
                      {assessment.halaman && ` (Hal. ${assessment.halaman})`}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. TABEL RINCIAN NILAI & ASPEK */}
              <div className="my-4 print-avoid-break">
                <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Rincian Hasil Ujian & Bobot Penilaian:</span>
                </h3>
                <div className="overflow-hidden rounded-lg border border-slate-300">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-emerald-900 text-white font-bold text-[11px]">
                        <th className="p-2 border-r border-emerald-800 text-center w-10">No</th>
                        <th className="p-2 border-r border-emerald-800">Aspek yang Dinilai</th>
                        <th className="p-2 border-r border-emerald-800 text-center w-16">Bobot</th>
                        <th className="p-2 border-r border-emerald-800 text-center w-24">Skor (0-100)</th>
                        <th className="p-2 text-right w-24">Nilai Akhir</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium">
                      <tr className="hover:bg-slate-50">
                        <td className="p-2 text-center text-slate-500 border-r border-slate-200">1</td>
                        <td className="p-2 border-r border-slate-200 font-semibold text-slate-800">
                          Kelancaran & Fashahah
                          <span className="block text-[10px] text-slate-400 font-normal">
                            Kelancaran bacaan hafalan tanpa tawaqquf/ragu
                          </span>
                        </td>
                        <td className="p-2 text-center text-slate-600 border-r border-slate-200">30%</td>
                        <td className="p-2 text-center font-bold text-slate-800 border-r border-slate-200">
                          {assessment.kelancaran}
                        </td>
                        <td className="p-2 text-right font-bold text-slate-900">
                          {(assessment.kelancaran * 0.3).toFixed(1)}
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="p-2 text-center text-slate-500 border-r border-slate-200">2</td>
                        <td className="p-2 border-r border-slate-200 font-semibold text-slate-800">
                          Kaidah Hukum Tajwid
                          <span className="block text-[10px] text-slate-400 font-normal">
                            Ghunnah, Mad, Idgham, Ikhfa, Qalqalah
                          </span>
                        </td>
                        <td className="p-2 text-center text-slate-600 border-r border-slate-200">30%</td>
                        <td className="p-2 text-center font-bold text-slate-800 border-r border-slate-200">
                          {assessment.tajwid}
                        </td>
                        <td className="p-2 text-right font-bold text-slate-900">
                          {(assessment.tajwid * 0.3).toFixed(1)}
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="p-2 text-center text-slate-500 border-r border-slate-200">3</td>
                        <td className="p-2 border-r border-slate-200 font-semibold text-slate-800">
                          Makharijul Huruf & Shifat
                          <span className="block text-[10px] text-slate-400 font-normal">
                            Ketepatan tempat keluarnya huruf & sifat asli
                          </span>
                        </td>
                        <td className="p-2 text-center text-slate-600 border-r border-slate-200">25%</td>
                        <td className="p-2 text-center font-bold text-slate-800 border-r border-slate-200">
                          {assessment.makhraj}
                        </td>
                        <td className="p-2 text-right font-bold text-slate-900">
                          {(assessment.makhraj * 0.25).toFixed(1)}
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="p-2 text-center text-slate-500 border-r border-slate-200">4</td>
                        <td className="p-2 border-r border-slate-200 font-semibold text-slate-800">
                          Adab Tilawah & Waqaf-Ibtida'
                          <span className="block text-[10px] text-slate-400 font-normal">
                            Sikap halaqah, adab terhadap mushaf & tempat berhenti
                          </span>
                        </td>
                        <td className="p-2 text-center text-slate-600 border-r border-slate-200">15%</td>
                        <td className="p-2 text-center font-bold text-slate-800 border-r border-slate-200">
                          {assessment.adab}
                        </td>
                        <td className="p-2 text-right font-bold text-slate-900">
                          {(assessment.adab * 0.15).toFixed(1)}
                        </td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="bg-emerald-100/70 border-t-2 border-emerald-800 font-bold">
                        <td colSpan={3} className="p-2.5 text-right text-emerald-950 uppercase tracking-wider text-[11px]">
                          TOTAL NILAI AKHIR KUMULATIF :
                        </td>
                        <td className="p-2.5 text-center text-emerald-900 border-r border-emerald-200 font-bold">
                          100%
                        </td>
                        <td className="p-2.5 text-right text-base text-emerald-950 font-black">
                          {assessment.totalScore}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* 5. HASIL PREDIKAT SERTIFIKAT */}
              <div className="my-4 p-3.5 rounded-xl border-2 border-emerald-700 bg-gradient-to-r from-emerald-50 via-white to-amber-50/40 flex items-center justify-between gap-4 print-avoid-break">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                    Predikat Capaian Tahfidz:
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-950 block">
                    {assessment.grade}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 mt-0.5 block">
                    {assessment.totalScore >= 90
                      ? '★ Sangat Mutqin (Istimewa / Mumtaz)'
                      : assessment.totalScore >= 80
                      ? '★ Mutqin & Lancar (Jayyid Jiddan)'
                      : assessment.totalScore >= 70
                      ? '★ Baik (Jayyid)'
                      : '★ Cukup (Maqbul)'}
                  </span>
                </div>

                <div className="text-right border-l-2 border-emerald-200 pl-4">
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Status Ujian:</span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>LULUS & TERCATAT</span>
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1 font-mono">{formattedDate}</span>
                </div>
              </div>

              {/* 6. CATATAN & EVALUASI MUSYRIF */}
              {assessment.notes && (
                <div className="my-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs print-avoid-break">
                  <span className="font-bold text-slate-700 block mb-0.5 text-[11px] uppercase tracking-wider">
                    Catatan & Bimbingan Musyrif:
                  </span>
                  <p className="text-slate-700 italic font-medium leading-relaxed">"{assessment.notes}"</p>
                </div>
              )}

              {/* 7. TITIMANGSA & TANDA TANGAN 3 KOLOM */}
              <div className="mt-6 pt-3 border-t border-slate-200 print-avoid-break">
                <div className="text-right text-xs text-slate-600 mb-4 font-medium">
                  <span>Kuningan, {formattedDate || '24 Oktober 2026'}</span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  {/* Kolom 1: Orang Tua / Wali */}
                  <div className="flex flex-col justify-between h-28">
                    <p className="text-slate-600 font-semibold text-[11px]">
                      Mengetahui,<br />
                      <span className="font-normal text-slate-500">Orang Tua / Wali Santri</span>
                    </p>
                    <div>
                      <div className="w-32 sm:w-36 mx-auto border-b border-slate-500"></div>
                      <p className="text-slate-400 text-[10px] mt-1">( ........................................ )</p>
                    </div>
                  </div>

                  {/* Kolom 2: Musyrif Penguji */}
                  <div className="flex flex-col justify-between h-28">
                    <p className="text-slate-600 font-semibold text-[11px]">
                      Penguji / Musyrif,<br />
                      <span className="font-normal text-slate-500">{assessment.classGroup}</span>
                    </p>
                    <div>
                      <div className="w-32 sm:w-36 mx-auto border-b border-slate-800"></div>
                      <p className="font-bold text-slate-900 text-[11px] mt-1">{assessment.examinerName}</p>
                    </div>
                  </div>

                  {/* Kolom 3: Pimpinan Rumah Qur'an Kuningan */}
                  <div className="flex flex-col justify-between h-28 relative">
                    <p className="text-slate-600 font-semibold text-[11px]">
                      Menyetujui,<br />
                      <span className="font-normal text-slate-500">Pimpinan Rumah Qur'an</span>
                    </p>
                    <div className="relative">
                      {/* Watermark Cap / Stempel Digital */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 pointer-events-none opacity-40 select-none">
                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-emerald-800 flex items-center justify-center text-[7px] font-black text-emerald-900 uppercase text-center rotate-[-12deg]">
                          RUMAH QUR'AN<br />KUNINGAN<br />★ SAH ★
                        </div>
                      </div>
                      <div className="w-36 sm:w-44 mx-auto border-b border-slate-800"></div>
                      <p className="font-extrabold text-slate-900 text-[11px] mt-1">Ustadz Imam Syahrobani M.Pd</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Certificate Footer Note */}
              <div className="mt-6 pt-2 border-t border-dashed border-slate-200 text-center text-[9px] text-slate-400 print:text-[8px] print-avoid-break">
                Dokumen ini dicetak resmi oleh Sistem Mutaba'ah Rumah Qur'an Kuningan • Verifikasi Asli • Simpan sebagai bukti capaian santri.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
