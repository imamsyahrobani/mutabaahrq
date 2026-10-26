/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AssessmentList } from './components/AssessmentList';
import { AssessmentFormModal } from './components/AssessmentFormModal';
import { ReportCardModal } from './components/ReportCardModal';
import { StudentManager } from './components/StudentManager';
import { MusyrifManager } from './components/MusyrifManager';
import { AttendanceManager } from './components/AttendanceManager';
import { DashboardStats } from './components/DashboardStats';
import { RubricGuide } from './components/RubricGuide';
import { Assessment, Student, HalaqahClass, Musyrif, AttendanceRecord } from './types';
import {
  subscribeAssessments,
  subscribeStudents,
  subscribeMusyrifs,
  subscribeClasses,
  subscribeAttendances,
  removeAssessment,
  purgeAllFakeDataAndApplyOfficial,
  OFFICIAL_STUDENT_NAMES,
} from './services/quranService';
import { testFirestoreConnection } from './firebase/config';
import { BookOpen, Sparkles, AlertCircle, Wifi, CheckCircle2, UserCheck, Users, CalendarCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'assessments' | 'attendance' | 'students' | 'musyrifs' | 'stats' | 'guide'>('assessments');
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [musyrifs, setMusyrifs] = useState<Musyrif[]>([]);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [classes, setClasses] = useState<string[]>([
    'Kelompok Ikhwan',
    'Kelompok Akhwat',
  ]);

  const [isInputModalOpen, setIsInputModalOpen] = useState<boolean>(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [viewingReportAssessment, setViewingReportAssessment] = useState<Assessment | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'checking' | 'offline'>('checking');
  const hasAutoCleanedRef = React.useRef<boolean>(false);

  // Periksa apakah daftar santri saat ini persis 9 santri resmi tanpa nama palsu
  const isOfficialData = React.useMemo(() => {
    if (students.length !== OFFICIAL_STUDENT_NAMES.length) return false;
    return students.every((s) => OFFICIAL_STUDENT_NAMES.includes(s.name as any));
  }, [students]);

  // Otomatis bersihkan nama-nama palsu & pasang 9 santri resmi jika terdeteksi data lama/palsu
  useEffect(() => {
    if (isLoading || isSeeding || hasAutoCleanedRef.current) return;

    const hasFakeNames = students.some((s) => !OFFICIAL_STUDENT_NAMES.includes(s.name as any));
    const isMissingOfficial = OFFICIAL_STUDENT_NAMES.some((name) => !students.some((s) => s.name === name));

    if (students.length === 0 || hasFakeNames || isMissingOfficial) {
      hasAutoCleanedRef.current = true;
      console.log('Menghapus data palsu & menyinkronkan 9 santri resmi Rumah Quran Kuningan...');
      setIsSeeding(true);
      purgeAllFakeDataAndApplyOfficial()
        .catch((err) => console.error('Gagal membersihkan data palsu:', err))
        .finally(() => setIsSeeding(false));
    }
  }, [students, isLoading, isSeeding]);

  // Verify connection on boot
  useEffect(() => {
    testFirestoreConnection()
      .then((ok) => {
        setConnectionStatus(ok ? 'connected' : 'offline');
      })
      .catch(() => {
        setConnectionStatus('offline');
      });
  }, []);

  // Listen to Firestore real-time collections
  useEffect(() => {
    setIsLoading(true);

    const unsubscribeAssessments = subscribeAssessments(
      (data) => {
        setAssessments(data);
        setIsLoading(false);
      },
      (err) => {
        console.error('Assessments listener error:', err);
        setIsLoading(false);
      }
    );

    const unsubscribeStudents = subscribeStudents(
      (data) => {
        setStudents(data);
      },
      (err) => {
        console.error('Students listener error:', err);
      }
    );

    const unsubscribeMusyrifs = subscribeMusyrifs(
      (data) => {
        setMusyrifs(data);
      },
      (err) => {
        console.error('Musyrifs listener error:', err);
      }
    );

    const unsubscribeClasses = subscribeClasses(
      (data) => {
        if (data.length > 0) {
          setClasses(data.map((c) => c.name));
        }
      },
      (err) => {
        console.error('Classes listener error:', err);
      }
    );

    const unsubscribeAttendances = subscribeAttendances(
      (data) => {
        setAttendances(data);
      },
      (err) => {
        console.error('Attendances listener error:', err);
      }
    );

    return () => {
      if (unsubscribeAssessments) unsubscribeAssessments();
      if (unsubscribeStudents) unsubscribeStudents();
      if (unsubscribeMusyrifs) unsubscribeMusyrifs();
      if (unsubscribeClasses) unsubscribeClasses();
      if (unsubscribeAttendances) unsubscribeAttendances();
    };
  }, []);

  const handleOpenInputModal = () => {
    setEditingAssessment(null);
    setIsInputModalOpen(true);
  };

  const handleEditAssessment = (item: Assessment) => {
    setEditingAssessment(item);
    setIsInputModalOpen(true);
  };

  const handleDeleteAssessment = async (id: string) => {
    try {
      await removeAssessment(id);
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus penilaian.');
    }
  };

  const handleViewReport = (item: Assessment) => {
    setViewingReportAssessment(item);
    setIsReportModalOpen(true);
  };

  const handleAssessSpecificStudent = (student: Student) => {
    // Open assessment form modal with pre-selected student
    const defaultExaminer =
      student.classGroup === 'Kelompok Akhwat'
        ? 'Sofi Zahrotul Mutiah'
        : 'Chandra Hidayat';

    setEditingAssessment({
      id: '',
      studentId: student.id,
      studentName: student.name,
      classGroup: student.classGroup,
      category: 'ziyadah',
      surahNumber: student.targetSurahNumber || 78,
      surahName: student.targetSurah || "An-Naba'",
      ayahStart: 1,
      ayahEnd: 40,
      juz: student.currentJuz ? String(student.currentJuz) : student.targetJuz ? String(student.targetJuz) : '30',
      halaman: '1 - 2',
      ayat: '1 - 40',
      kelancaran: 90,
      tajwid: 90,
      makhraj: 90,
      adab: 95,
      totalScore: 90.75,
      grade: 'Mumtaz (A+)',
      notes: '',
      examinerName: musyrifs.find((m) => m.name === defaultExaminer)?.name || defaultExaminer,
      date: new Date().toISOString().split('T')[0],
      createdAt: '',
      updatedAt: '',
    });
    setIsInputModalOpen(true);
  };

  const handleSeedDemo = async () => {
    const confirmSync = confirm(
      'Apakah Anda ingin membersihkan SELURUH data palsu dan memasang data resmi Rumah Qur\'an Kuningan?\n\n• 6 Santri Ikhwan (Pengajar: Chandra Hidayat)\n• 3 Santri Akhwat (Pengajar: Sofi Zahrotul Mutiah)\n• Pimpinan: Ustadz Imam Syahrobani M.Pd'
    );
    if (!confirmSync) return;

    setIsSeeding(true);
    try {
      await purgeAllFakeDataAndApplyOfficial();
    } catch (err) {
      console.error(err);
      alert('Gagal membersihkan dan memasang data resmi. Periksa koneksi internet.');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* Real-time Cloud Header & Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenInputModal={handleOpenInputModal}
        onSeedDemo={handleSeedDemo}
        isSeeding={isSeeding}
        totalAssessments={assessments.length}
      />

      {/* Hero Welcome & Quick Stats Subheader */}
      <div className="bg-gradient-to-b from-emerald-900 via-teal-900 to-emerald-950 text-white py-7 px-4 sm:px-6 lg:px-8 shadow-inner no-print">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-800/80 border border-emerald-600/50 text-[11px] text-emerald-200 font-medium">
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span>Firestore Real-Time</span>
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-[11px] text-amber-200 font-medium">
                Pimpinan: Ustadz Imam Syahrobani M.Pd
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span>Rumah Qur'an Kuningan</span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/90 max-w-2xl">
              Sistem Penilaian, Presensi Sesi, & Mutabaah Hafalan Al-Qur'an resmi. Pengajar: <b>Chandra Hidayat</b> (Kelompok Ikhwan) & <b>Sofi Zahrotul Mutiah</b> (Kelompok Akhwat).
            </p>
          </div>

          {/* Quick metric chips */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div
              onClick={() => setActiveTab('students')}
              className="bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/15 px-3.5 py-2 rounded-xl text-center cursor-pointer transition-colors"
            >
              <div className="text-xs text-emerald-200 font-medium flex items-center justify-center gap-1">
                <Users className="w-3 h-3" />
                <span>Santri</span>
              </div>
              <div className="text-lg font-bold text-white">{students.length}</div>
            </div>

            <div
              onClick={() => setActiveTab('musyrifs')}
              className="bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/15 px-3.5 py-2 rounded-xl text-center cursor-pointer transition-colors"
            >
              <div className="text-xs text-emerald-200 font-medium flex items-center justify-center gap-1">
                <UserCheck className="w-3 h-3" />
                <span>Musyrif</span>
              </div>
              <div className="text-lg font-bold text-emerald-300">{musyrifs.length}</div>
            </div>

            <div
              onClick={() => setActiveTab('attendance')}
              className="bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/15 px-3.5 py-2 rounded-xl text-center cursor-pointer transition-colors"
            >
              <div className="text-xs text-emerald-200 font-medium flex items-center justify-center gap-1">
                <CalendarCheck className="w-3 h-3 text-emerald-300" />
                <span>Presensi</span>
              </div>
              <div className="text-lg font-bold text-white">{attendances.length} Sesi</div>
            </div>

            <div
              onClick={() => setActiveTab('assessments')}
              className="bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/15 px-3.5 py-2 rounded-xl text-center cursor-pointer transition-colors"
            >
              <div className="text-xs text-emerald-200 font-medium">Setoran</div>
              <div className="text-lg font-bold text-white">{assessments.length}</div>
            </div>

            <div
              onClick={() => setActiveTab('stats')}
              className="bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/15 px-3.5 py-2 rounded-xl text-center cursor-pointer transition-colors"
            >
              <div className="text-xs text-emerald-200 font-medium">Rata-rata</div>
              <div className="text-lg font-bold text-amber-300">
                {assessments.length > 0
                  ? (assessments.reduce((acc, c) => acc + c.totalScore, 0) / assessments.length).toFixed(1)
                  : '-'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main App Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {isLoading && assessments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium">Menghubungkan ke database Firebase real-time...</p>
          </div>
        ) : (
          <>
            {!isOfficialData && (
              <div className="mb-6 bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-200/90 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-xl text-amber-800 shrink-0">
                    <Sparkles className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Data Resmi Santri & Pengajar Sedang Dipersiapkan
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Daftar resmi: <b>6 Santri Ikhwan</b> (Pengajar: Chandra Hidayat) & <b>3 Santri Akhwat</b> (Pengajar: Sofi Zahrotul Mutiah), Pimpinan: Ustadz Imam Syahrobani M.Pd.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSeedDemo}
                  disabled={isSeeding}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>{isSeeding ? 'Membersihkan Data...' : 'Bersihkan Data Palsu & Pasang 9 Santri Resmi'}</span>
                </button>
              </div>
            )}

            {activeTab === 'assessments' && (
              <AssessmentList
                assessments={assessments}
                classes={classes}
                onOpenCreateModal={handleOpenInputModal}
                onEditAssessment={handleEditAssessment}
                onDeleteAssessment={handleDeleteAssessment}
                onViewReport={handleViewReport}
              />
            )}

            {activeTab === 'attendance' && (
              <AttendanceManager
                students={students}
                classes={classes}
                musyrifs={musyrifs}
                attendances={attendances}
              />
            )}

            {activeTab === 'students' && (
              <StudentManager
                students={students}
                assessments={assessments}
                classes={classes}
                onAssessStudent={handleAssessSpecificStudent}
                onSyncRoster={handleSeedDemo}
                onViewReport={handleViewReport}
              />
            )}

            {activeTab === 'musyrifs' && (
              <MusyrifManager
                musyrifs={musyrifs}
                assessments={assessments}
                classes={classes}
                onSyncRoster={handleSeedDemo}
              />
            )}

            {activeTab === 'stats' && (
              <DashboardStats assessments={assessments} students={students} />
            )}

            {activeTab === 'guide' && <RubricGuide />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-700">
            MUTABAAH QURAN • Rumah Quran Kuningan
          </p>
          <p className="text-[11px] text-slate-400">
            Ditenagai oleh React, Tailwind CSS & Firebase Firestore Cloud Database.
          </p>
        </div>
      </footer>

      {/* Input / Edit Assessment Modal */}
      <AssessmentFormModal
        isOpen={isInputModalOpen}
        onClose={() => setIsInputModalOpen(false)}
        students={students}
        musyrifs={musyrifs}
        initialData={editingAssessment}
        classes={classes}
      />

      {/* Printable Report Card Modal */}
      <ReportCardModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        assessment={viewingReportAssessment}
      />
    </div>
  );
}
