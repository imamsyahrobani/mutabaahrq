import React, { useMemo } from 'react';
import {
  TrendingUp,
  Award,
  BookOpen,
  Users,
  CheckCircle2,
  Sparkles,
  BarChart,
  Calendar,
} from 'lucide-react';
import { Assessment, Student } from '../types';
import { CATEGORY_LABELS } from '../data/quranData';

interface DashboardStatsProps {
  assessments: Assessment[];
  students: Student[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ assessments, students }) => {
  // Aggregate statistics
  const stats = useMemo(() => {
    if (assessments.length === 0) {
      return {
        total: 0,
        avgScore: 0,
        mumtazCount: 0,
        mumtazPct: 0,
        avgKelancaran: 0,
        avgTajwid: 0,
        avgMakhraj: 0,
        avgAdab: 0,
        categoryCounts: {} as Record<string, number>,
        sessionCounts: { 'Sesi 1': 0, 'Sesi 2': 0, 'Sesi 3': 0, 'Sesi 4': 0 } as Record<string, number>,
        topStudents: [] as Array<{ name: string; classGroup: string; avg: number; count: number }>,
      };
    }

    const total = assessments.length;
    let sumScore = 0;
    let sumKelancaran = 0;
    let sumTajwid = 0;
    let sumMakhraj = 0;
    let sumAdab = 0;
    let mumtaz = 0;
    const catCounts: Record<string, number> = {};
    const sessCounts: Record<string, number> = {
      'Sesi 1': 0,
      'Sesi 2': 0,
      'Sesi 3': 0,
      'Sesi 4': 0,
    };
    const studentMap: Record<string, { name: string; classGroup: string; sum: number; count: number }> = {};

    assessments.forEach((asm) => {
      sumScore += asm.totalScore;
      sumKelancaran += asm.kelancaran;
      sumTajwid += asm.tajwid;
      sumMakhraj += asm.makhraj;
      sumAdab += asm.adab;

      if (asm.grade.includes('Mumtaz')) mumtaz++;

      catCounts[asm.category] = (catCounts[asm.category] || 0) + 1;
      const s = asm.session || 'Sesi 1';
      sessCounts[s] = (sessCounts[s] || 0) + 1;

      if (!studentMap[asm.studentId]) {
        studentMap[asm.studentId] = {
          name: asm.studentName,
          classGroup: asm.classGroup,
          sum: 0,
          count: 0,
        };
      }
      studentMap[asm.studentId].sum += asm.totalScore;
      studentMap[asm.studentId].count += 1;
    });

    const topList = Object.values(studentMap)
      .map((s) => ({
        name: s.name,
        classGroup: s.classGroup,
        avg: Number((s.sum / s.count).toFixed(1)),
        count: s.count,
      }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 5);

    return {
      total,
      avgScore: Number((sumScore / total).toFixed(1)),
      mumtazCount: mumtaz,
      mumtazPct: Math.round((mumtaz / total) * 100),
      avgKelancaran: Number((sumKelancaran / total).toFixed(1)),
      avgTajwid: Number((sumTajwid / total).toFixed(1)),
      avgMakhraj: Number((sumMakhraj / total).toFixed(1)),
      avgAdab: Number((sumAdab / total).toFixed(1)),
      categoryCounts: catCounts,
      sessionCounts: sessCounts,
      topStudents: topList,
    };
  }, [assessments]);

  return (
    <div className="space-y-6">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Penilaian */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Total Penilaian
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.total}</div>
            <span className="text-xs text-slate-400 mt-0.5 block">Tersimpan di Cloud</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Rata-rata Nilai */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Rata-rata Skor
            </span>
            <div className="text-2xl font-black text-emerald-800 mt-1">{stats.avgScore || '-'}</div>
            <span className="text-xs text-emerald-600 mt-0.5 block font-medium">Skala 0 - 100</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Predikat Mumtaz */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Predikat Mumtaz (A+)
            </span>
            <div className="text-2xl font-black text-amber-600 mt-1">{stats.mumtazCount}</div>
            <span className="text-xs text-amber-600 mt-0.5 block font-medium">
              {stats.mumtazPct}% dari seluruh setoran
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Total Santri */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Santri Terdata
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{students.length}</div>
            <span className="text-xs text-slate-400 mt-0.5 block">Di seluruh halaqah</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2 Columns: Pillar Breakdown & Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pillar Average Performance */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <BarChart className="w-4 h-4 text-emerald-600" />
            <span>Rata-Rata Capaian Per Aspek Penilaian</span>
          </h3>
          <p className="text-xs text-slate-500">
            Perbandingan performa bacaan dan hafalan berdasarkan 4 pilar standar
          </p>

          <div className="space-y-3.5 pt-2">
            {/* Kelancaran */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>1. Kelancaran & Fashahah (Bobot 30%)</span>
                <span className="text-emerald-800 font-bold">{stats.avgKelancaran || 0} / 100</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${stats.avgKelancaran || 0}%` }}
                ></div>
              </div>
            </div>

            {/* Tajwid */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>2. Kaidah Hukum Tajwid (Bobot 30%)</span>
                <span className="text-emerald-800 font-bold">{stats.avgTajwid || 0} / 100</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-teal-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${stats.avgTajwid || 0}%` }}
                ></div>
              </div>
            </div>

            {/* Makhraj */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>3. Makharijul Huruf & Sifat (Bobot 25%)</span>
                <span className="text-emerald-800 font-bold">{stats.avgMakhraj || 0} / 100</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${stats.avgMakhraj || 0}%` }}
                ></div>
              </div>
            </div>

            {/* Adab */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>4. Adab & Waqaf-Ibtida (Bobot 15%)</span>
                <span className="text-emerald-800 font-bold">{stats.avgAdab || 0} / 100</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${stats.avgAdab || 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Category distribution pills */}
          <div className="pt-4 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-600 block mb-2">Sebaran Kategori Penilaian:</span>
            <div className="flex flex-wrap gap-2 text-xs">
              {(['ziyadah', 'murojaah', 'tasmi_pekanan', 'tasmi_juz', 'ujian_bulanan'] as const).map((key) => {
                const meta = CATEGORY_LABELS[key];
                // Also aggregate legacy keys if any exist in the database
                let count = stats.categoryCounts[key] || 0;
                if (key === 'ziyadah') count += stats.categoryCounts['tahfidz'] || 0;
                if (key === 'murojaah') count += stats.categoryCounts['murajaah'] || 0;
                return (
                  <div key={key} className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                    <span className="text-slate-600">{meta?.label || key}:</span>{' '}
                    <strong className="text-emerald-800">{count}</strong>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Session distribution pills */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-600 block mb-2">Sebaran Sesi Setoran:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {(['Sesi 1', 'Sesi 2', 'Sesi 3', 'Sesi 4'] as const).map((s) => {
                const count = stats.sessionCounts?.[s] || 0;
                return (
                  <div key={s} className="bg-indigo-50/60 border border-indigo-100 px-3 py-1.5 rounded-lg flex items-center justify-between">
                    <span className="text-indigo-900 font-medium">{s}:</span>
                    <strong className="text-indigo-700 bg-white px-2 py-0.5 rounded text-xs border border-indigo-200/60">
                      {count}
                    </strong>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Performers Leaderboard */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Santri Berprestasi (Nilai Tertinggi)</span>
          </h3>
          <p className="text-xs text-slate-500">
            Daftar santri dengan akumulasi nilai hafalan dan bacaan terbaik
          </p>

          {stats.topStudents.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Belum ada data nilai yang cukup untuk menampilkan peringkat santri.
            </div>
          ) : (
            <div className="space-y-2.5 pt-2">
              {stats.topStudents.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        idx === 0
                          ? 'bg-amber-400 text-amber-950 shadow-xs'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-800'
                          : idx === 2
                          ? 'bg-amber-700/60 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{s.name}</div>
                      <div className="text-slate-500 text-[11px]">
                        {s.classGroup} • {s.count} Kali Setoran
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-emerald-800">{s.avg}</div>
                    <div className="text-[10px] text-slate-400">Rata-rata</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
