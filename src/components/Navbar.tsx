import React from 'react';
import { BookOpen, PlusCircle, Users, UserCheck, BarChart3, ShieldCheck, RefreshCw, CalendarCheck } from 'lucide-react';
import { RumahQuranLogo } from './RumahQuranLogo';

interface NavbarProps {
  activeTab: 'assessments' | 'attendance' | 'students' | 'musyrifs' | 'stats' | 'guide';
  setActiveTab: (tab: 'assessments' | 'attendance' | 'students' | 'musyrifs' | 'stats' | 'guide') => void;
  onOpenInputModal: () => void;
  onSeedDemo: () => void;
  isSeeding: boolean;
  totalAssessments: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenInputModal,
  onSeedDemo,
  isSeeding,
  totalAssessments,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('assessments')}>
            <RumahQuranLogo size={42} />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">
                  MUTABAAH <span className="text-emerald-700">QURAN</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1"></span>
                  Real-Time
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab('assessments')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'assessments'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Daftar Nilai</span>
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'attendance'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <CalendarCheck className="w-4 h-4 text-emerald-700" />
              <span>Absensi Sesi</span>
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'students'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Users className="w-4 h-4 text-teal-600" />
              <span>Data Santri</span>
            </button>
            <button
              onClick={() => setActiveTab('musyrifs')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'musyrifs'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Data Musyrif</span>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'stats'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span>Statistik</span>
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'guide'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Rubrik</span>
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onSeedDemo}
              disabled={isSeeding}
              title="Sinkronkan data resmi: 9 Santri (6 Ikhwan, 3 Akhwat) & 2 Musyrif (Chandra Hidayat & Sofi Zahrotul Mutiah)"
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
              <span>{isSeeding ? 'Menyinkronkan...' : 'Data Resmi Santri'}</span>
            </button>

            <button
              onClick={onOpenInputModal}
              className="inline-flex items-center space-x-2 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs shadow-emerald-700/25 transition-all transform active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Input Nilai</span>
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Navigation Row */}
        <div className="flex lg:hidden items-center justify-between py-2 border-t border-slate-100 text-xs overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('assessments')}
            className={`flex items-center gap-1 py-1.5 px-2.5 rounded-lg font-medium whitespace-nowrap ${
              activeTab === 'assessments' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span>Nilai</span>
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center gap-1 py-1.5 px-2.5 rounded-lg font-medium whitespace-nowrap ${
              activeTab === 'attendance' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Absensi</span>
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-1 py-1.5 px-2.5 rounded-lg font-medium whitespace-nowrap ${
              activeTab === 'students' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-teal-600" />
            <span>Santri</span>
          </button>
          <button
            onClick={() => setActiveTab('musyrifs')}
            className={`flex items-center gap-1 py-1.5 px-2.5 rounded-lg font-medium whitespace-nowrap ${
              activeTab === 'musyrifs' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Musyrif</span>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-1 py-1.5 px-2.5 rounded-lg font-medium whitespace-nowrap ${
              activeTab === 'stats' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
            <span>Statistik</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-1 py-1.5 px-2.5 rounded-lg font-medium whitespace-nowrap ${
              activeTab === 'guide' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Rubrik</span>
          </button>
        </div>
      </div>
    </header>
  );
};
