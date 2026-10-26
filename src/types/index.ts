export type AssessmentCategory =
  | 'ziyadah'
  | 'murojaah'
  | 'tasmi_pekanan'
  | 'tasmi_juz'
  | 'ujian_bulanan'
  | 'tahfidz'
  | 'tahsin'
  | 'tilawah'
  | 'murajaah'
  | string;

export type AttendanceStatus = 'hadir' | 'izin' | 'sakit' | 'alpa';

export interface StudentAttendanceItem {
  studentId: string;
  studentName: string;
  classGroup: string;
  status: AttendanceStatus;
  note?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  dayName: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Ahad' | string;
  session: 'Sesi 1' | 'Sesi 2' | 'Sesi 3' | 'Sesi 4' | string;
  classGroup: string;
  records: StudentAttendanceItem[];
  summary: {
    total: number;
    hadir: number;
    izin: number;
    sakit: number;
    alpa: number;
    rate: number;
  };
  notes?: string;
  recordedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  name: string;
  nis: string;
  classGroup: string;
  gender?: 'ikhwan' | 'akhwat';
  targetJuz?: number;
  // Fitur Target Hafalan Spesifik Rumah Qur'an Kuningan
  targetSurah?: string; // e.g. "An-Naba'"
  targetSurahNumber?: number;
  currentJuz?: number | string; // e.g. 30
  targetHarianPages?: number; // Target per hari: default 2 halaman (1 lembar)
  targetPekananPages?: number; // Target per pekan: default 10 halaman (5 lembar)
  targetBulananJuz?: number; // Target per bulan: default 1.5 Juz (30 halaman)
  targetNotes?: string; // Catatan arahan musyrif
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Musyrif {
  id: string;
  name: string;
  nip?: string;
  role?: string;
  phone?: string;
  assignedHalaqah?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Assessment {
  id: string;
  studentId: string;
  studentName: string;
  classGroup: string;
  category: AssessmentCategory;
  session?: 'Sesi 1' | 'Sesi 2' | 'Sesi 3' | 'Sesi 4' | string;
  surahNumber?: number;
  surahName: string;
  surahArabic?: string;
  juz: string | number;
  halaman?: string;
  ayat?: string;
  ayahStart?: number;
  ayahEnd?: number;
  kelancaran: number; // 0 - 100 (Kelancaran / Fashahah)
  tajwid: number;     // 0 - 100 (Kaidah Hukum Tajwid)
  makhraj: number;    // 0 - 100 (Makharijul Huruf)
  adab: number;       // 0 - 100 (Adab & Waqaf Ibtida)
  totalScore: number; // 0 - 100
  grade: 'Mumtaz (A+)' | 'Jayyid Jiddan (A)' | 'Jayyid (B)' | 'Maqbul (C)' | 'Rasib (D)';
  notes: string;
  examinerName: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Surah {
  number: number;
  name: string;
  nameArabic: string;
  ayahCount: number;
  revelation: 'Makkiyah' | 'Madaniyah';
  defaultJuz: number;
}

export interface HalaqahClass {
  id: string;
  name: string;
  ustadz: string;
  description?: string;
}

export interface FilterOptions {
  search: string;
  classGroup: string;
  category: string;
  grade: string;
  startDate?: string;
  endDate?: string;
}
