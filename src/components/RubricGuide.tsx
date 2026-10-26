import React from 'react';
import { ShieldCheck, BookOpen, CheckCircle2, AlertTriangle, Award, Info } from 'lucide-react';

export const RubricGuide: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-emerald-700">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Standarisasi Pengujian</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Pedoman & Rubrik Penilaian Al-Qur'an (Tahfidz & Tahsin)
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Rubrik penilaian ini dirancang sesuai standar Lembaga Tahfidz Al-Qur'an nasional dengan membagi penilaian ke dalam 4 pilar utama yang terbobot secara proporsional.
        </p>
      </div>

      {/* 4 Pillars Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pilar 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">1</span>
              <span>Kelancaran & Fashahah</span>
            </h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Bobot 30%
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Menilai kesinambungan hafalan, kestabilan tempo (Hadr, Tadwir, Tahqiq), dan ketidakterbataan saat membaca.
          </p>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
            <li><strong>100 - 90:</strong> Membaca sangat lancar tanpa ragu, tanpa salah baris atau lupa ayat.</li>
            <li><strong>89 - 80:</strong> Membaca lancar, ada pengulangan mandiri 1-2 kali tanpa bantuan guru.</li>
            <li><strong>79 - 70:</strong> Ada keraguan ringan, membutuhkan isyarat awal kata 1 kali.</li>
            <li><strong>&lt; 70:</strong> Terbata-bata, perlu dituntun ayat berulang kali (perlu muraja'ah).</li>
          </ul>
        </div>

        {/* Pilar 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 text-xs font-bold flex items-center justify-center">2</span>
              <span>Kaidah Hukum Tajwid</span>
            </h3>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
              Bobot 30%
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Menilai penerapan hukum nun mati, mim mati, mad (panjang pendek 2/4/5/6 harakat), ghunnah, dan qalqalah.
          </p>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
            <li><strong>100 - 90:</strong> Seluruh hukum tajwid diterapkan sempurna dan konsisten.</li>
            <li><strong>89 - 80:</strong> Mad dan ghunnah tepat, sesekali panjang mad jaiz sedikit kurang.</li>
            <li><strong>79 - 70:</strong> Masih terdapat 2-3 kesalahan samar pada dengung ikhfa atau iqlab.</li>
            <li><strong>&lt; 70:</strong> Sering salah mad thabi'i (tertukar 1 dan 2 harakat).</li>
          </ul>
        </div>

        {/* Pilar 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center">3</span>
              <span>Makharijul Huruf & Sifat</span>
            </h3>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
              Bobot 25%
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Menilai kejelasan tempat keluarnya huruf (Halaq, Lisan, Syafatain) serta sifat huruf (Hams, Jahr, Tafkhim, Tarqiq).
          </p>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
            <li><strong>100 - 90:</strong> Huruf tebal/tipis dan sifat hams terucap fasih tanpa campur dialek.</li>
            <li><strong>89 - 80:</strong> Makhraj jelas, ada sedikit catatan pada huruf tenggorokan (ع / ح).</li>
            <li><strong>79 - 70:</strong> Huruf sering tertukar (misal: ذ dengan ز, atau ث dengan س).</li>
            <li><strong>&lt; 70:</strong> Belum dapat membedakan makhraj huruf dasar secara stabil.</li>
          </ul>
        </div>

        {/* Pilar 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center">4</span>
              <span>Adab & Waqaf-Ibtida</span>
            </h3>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              Bobot 15%
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Menilai adab majelis Al-Qur'an (duduk tegak, tawadhu, kesopanan) serta ketepatan berhenti dan memulai kembali ayat.
          </p>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
            <li><strong>100 - 90:</strong> Duduk khusyuk, membaca ta'awudz & basmalah, waqaf تام / حسن.</li>
            <li><strong>89 - 80:</strong> Berhenti pada tanda waqaf yang tepat, nafas terjaga dengan baik.</li>
            <li><strong>79 - 70:</strong> Sesekali terputus nafas di tengah kata lalu mengulang dari kata sebelumnya.</li>
            <li><strong>&lt; 70:</strong> Waqaf qabih (merusak makna kalimat) atau kurang tertib bersikap.</li>
          </ul>
        </div>
      </div>

      {/* Skala Predikat Nilai */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          <span>Tabel Konversi Skala Predikat Kelulusan</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs text-center">
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
            <div className="font-bold text-amber-900 text-sm">90 - 100</div>
            <div className="font-extrabold text-amber-800 mt-0.5">Mumtaz (A+)</div>
            <div className="text-[11px] text-amber-700 mt-1">Istimewa / Mutqin</div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="font-bold text-emerald-900 text-sm">80 - 89</div>
            <div className="font-extrabold text-emerald-800 mt-0.5">Jayyid Jiddan (A)</div>
            <div className="text-[11px] text-emerald-700 mt-1">Sangat Baik</div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
            <div className="font-bold text-blue-900 text-sm">70 - 79</div>
            <div className="font-extrabold text-blue-800 mt-0.5">Jayyid (B)</div>
            <div className="text-[11px] text-blue-700 mt-1">Baik</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
            <div className="font-bold text-slate-900 text-sm">60 - 69</div>
            <div className="font-extrabold text-slate-700 mt-0.5">Maqbul (C)</div>
            <div className="text-[11px] text-slate-500 mt-1">Cukup Lulus</div>
          </div>

          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
            <div className="font-bold text-rose-900 text-sm">&lt; 60</div>
            <div className="font-extrabold text-rose-700 mt-0.5">Rasib (D)</div>
            <div className="text-[11px] text-rose-600 mt-1">Perlu Mengulang</div>
          </div>
        </div>
      </div>

      {/* 5 Kategori Penilaian & Ketentuan Sesi / Absensi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kategori Penilaian */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-800">
            <Award className="w-5 h-5" />
            <h3 className="font-bold text-sm">5 Kategori Penilaian Resmi</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="font-bold text-emerald-900 block">1. Ziyadah</span>
              <span className="text-emerald-700 text-[11px]">Setoran hafalan baru per ayat atau halaman yang baru dihafal.</span>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
              <span className="font-bold text-blue-900 block">2. Muroja'ah</span>
              <span className="text-blue-700 text-[11px]">Pengulangan & pemantapan hafalan lama agar tetap mutqin dan tidak hilang.</span>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200">
              <span className="font-bold text-purple-900 block">3. Tasmi' Pekanan</span>
              <span className="text-purple-700 text-[11px]">Ujian tasmi mingguan (setiap Sabtu Sesi 1 & 2) memperdengarkan hafalan sepekan.</span>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200">
              <span className="font-bold text-indigo-900 block">4. Tasmi' Juz</span>
              <span className="text-indigo-700 text-[11px]">Ujian tasmi sekali duduk 1 Juz atau kelipatan Juz di hadapan musyrif penguji.</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
              <span className="font-bold text-amber-900 block">5. Ujian Bulanan</span>
              <span className="text-amber-700 text-[11px]">Evaluasi kumulatif capaian target dan penilaian mutu hafalan bulanan santri.</span>
            </div>
          </div>
        </div>

        {/* Ketentuan Jadwal Sesi & Absensi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-teal-800">
            <Info className="w-5 h-5" />
            <h3 className="font-bold text-sm">Jadwal Sesi & Ketentuan Absensi</h3>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900">Senin s/d Jumat</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">KBM Aktif</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Aktif penuh 4 sesi: <strong>Sesi 1, Sesi 2, Sesi 3, dan Sesi 4</strong> untuk seluruh halaqah. Absensi dicatat tiap sesi.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-purple-950">Sabtu</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-200 text-purple-900 text-[10px] font-bold">Maks. Sesi 2</span>
              </div>
              <p className="text-purple-800 text-[11px]">
                KBM hanya aktif sampai <strong>Sesi 2 (Sesi 1 & Sesi 2)</strong> khusus untuk pelaksanaan <strong>Tasmi' Pekanan</strong>. Sesi 3 & 4 non-aktif.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-rose-950">Ahad</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 text-[10px] font-bold">Libur</span>
              </div>
              <p className="text-rose-800 text-[11px]">
                Hari libur santri dan musyrif. Tidak ada aktivitas belajar mengajar formal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
