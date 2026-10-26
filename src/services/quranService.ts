import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Assessment, Student, HalaqahClass, Musyrif, AttendanceRecord } from '../types';

const ASSESSMENTS_PATH = 'assessments';
const STUDENTS_PATH = 'students';
const CLASSES_PATH = 'classes';
const MUSYRIFS_PATH = 'musyrifs';
const ATTENDANCES_PATH = 'attendances';

/**
 * Real-time listener for assessments ordered by date / createdAt desc
 */
export function subscribeAssessments(
  onUpdate: (data: Assessment[]) => void,
  onError?: (error: Error) => void
) {
  try {
    const q = query(collection(db, ASSESSMENTS_PATH), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: Assessment[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Assessment, 'id'>) });
        });
        onUpdate(list);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, ASSESSMENTS_PATH);
        } catch (wrappedErr) {
          if (onError && wrappedErr instanceof Error) {
            onError(wrappedErr);
          }
        }
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, ASSESSMENTS_PATH);
  }
}

/**
 * Real-time listener for students
 */
export function subscribeStudents(
  onUpdate: (data: Student[]) => void,
  onError?: (error: Error) => void
) {
  try {
    const q = query(collection(db, STUDENTS_PATH), orderBy('name', 'asc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: Student[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Student, 'id'>) });
        });
        onUpdate(list);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, STUDENTS_PATH);
        } catch (wrappedErr) {
          if (onError && wrappedErr instanceof Error) {
            onError(wrappedErr);
          }
        }
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, STUDENTS_PATH);
  }
}

/**
 * Real-time listener for musyrifs / teachers / examiners
 */
export function subscribeMusyrifs(
  onUpdate: (data: Musyrif[]) => void,
  onError?: (error: Error) => void
) {
  try {
    const q = query(collection(db, MUSYRIFS_PATH), orderBy('name', 'asc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: Musyrif[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Musyrif, 'id'>) });
        });
        onUpdate(list);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, MUSYRIFS_PATH);
        } catch (wrappedErr) {
          if (onError && wrappedErr instanceof Error) {
            onError(wrappedErr);
          }
        }
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, MUSYRIFS_PATH);
  }
}

/**
 * Real-time listener for classes
 */
export function subscribeClasses(
  onUpdate: (data: HalaqahClass[]) => void,
  onError?: (error: Error) => void
) {
  try {
    const q = query(collection(db, CLASSES_PATH), orderBy('name', 'asc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: HalaqahClass[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as Omit<HalaqahClass, 'id'>) });
        });
        onUpdate(list);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, CLASSES_PATH);
        } catch (wrappedErr) {
          if (onError && wrappedErr instanceof Error) {
            onError(wrappedErr);
          }
        }
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, CLASSES_PATH);
  }
}

/**
 * Real-time listener for session attendances
 */
export function subscribeAttendances(
  onUpdate: (data: AttendanceRecord[]) => void,
  onError?: (error: Error) => void
) {
  try {
    const q = query(collection(db, ATTENDANCES_PATH), orderBy('date', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: AttendanceRecord[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as Omit<AttendanceRecord, 'id'>) });
        });
        onUpdate(list);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, ATTENDANCES_PATH);
        } catch (wrappedErr) {
          if (onError && wrappedErr instanceof Error) {
            onError(wrappedErr);
          }
        }
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, ATTENDANCES_PATH);
  }
}

/**
 * Strips all undefined fields so Firestore does not reject with "Unsupported field value: undefined"
 */
function cleanObject<T extends Record<string, any>>(obj: T): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      cleaned[key] = val;
    }
  }
  return cleaned;
}

/**
 * Create or save an assessment
 */
export async function saveAssessment(assessment: Omit<Assessment, 'id'> & { id?: string }): Promise<string> {
  const id = assessment.id || `asm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  
  const payload = cleanObject({
    ...assessment,
    id,
    createdAt: assessment.createdAt || now,
    updatedAt: now,
  });

  try {
    await setDoc(doc(db, ASSESSMENTS_PATH, id), payload);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${ASSESSMENTS_PATH}/${id}`);
  }
}

/**
 * Delete an assessment
 */
export async function removeAssessment(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, ASSESSMENTS_PATH, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${ASSESSMENTS_PATH}/${id}`);
  }
}

/**
 * Add or update student (Santri)
 */
export async function saveStudent(student: Omit<Student, 'id'> & { id?: string }): Promise<string> {
  const id = student.id || `std_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const payload = cleanObject({
    ...student,
    id,
    createdAt: student.createdAt || now,
    updatedAt: now,
  });

  try {
    await setDoc(doc(db, STUDENTS_PATH, id), payload);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${STUDENTS_PATH}/${id}`);
  }
}

/**
 * Delete a student (Santri)
 */
export async function removeStudent(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, STUDENTS_PATH, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${STUDENTS_PATH}/${id}`);
  }
}

/**
 * Add or update Musyrif / Penguji
 */
export async function saveMusyrif(musyrif: Omit<Musyrif, 'id'> & { id?: string }): Promise<string> {
  const id = musyrif.id || `msy_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const payload = cleanObject({
    ...musyrif,
    id,
    createdAt: musyrif.createdAt || now,
    updatedAt: now,
  });

  try {
    await setDoc(doc(db, MUSYRIFS_PATH, id), payload);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${MUSYRIFS_PATH}/${id}`);
  }
}

/**
 * Delete a Musyrif
 */
export async function removeMusyrif(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, MUSYRIFS_PATH, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${MUSYRIFS_PATH}/${id}`);
  }
}

/**
 * Save Halaqah Class
 */
export async function saveHalaqahClass(cls: Omit<HalaqahClass, 'id'> & { id?: string }): Promise<string> {
  const id = cls.id || `cls_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const payload = cleanObject({
    ...cls,
    id,
  });
  try {
    await setDoc(doc(db, CLASSES_PATH, id), payload);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${CLASSES_PATH}/${id}`);
  }
}

/**
 * Save or update session attendance record
 */
export async function saveAttendance(record: Omit<AttendanceRecord, 'id'> & { id?: string }): Promise<string> {
  const id = record.id || `att_${record.date}_${(record.session || 'Sesi1').replace(/\s+/g, '')}_${(record.classGroup || 'all').replace(/[^a-zA-Z0-9]/g, '_')}`;
  const now = new Date().toISOString();

  const payload = cleanObject({
    ...record,
    id,
    createdAt: record.createdAt || now,
    updatedAt: now,
  });

  try {
    await setDoc(doc(db, ATTENDANCES_PATH, id), payload);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${ATTENDANCES_PATH}/${id}`);
  }
}

/**
 * Delete session attendance record
 */
export async function removeAttendance(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, ATTENDANCES_PATH, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${ATTENDANCES_PATH}/${id}`);
  }
}

export const OFFICIAL_STUDENT_NAMES = [
  'Aly Mudjahid',
  'Hafiz Rizky',
  'Irfan Hidayat',
  'Naufal Haidar Azmi',
  'Syarief Hidayatullah',
  'Muhammad Ammar K.P',
  'Amelia Agustin',
  "Husna Ma'aab Laleno",
  'Najwa Octa Salsabilah',
] as const;

export const OFFICIAL_MUSYRIF_NAMES = [
  'Chandra Hidayat',
  'Sofi Zahrotul Mutiah',
  'Ustadz Imam Syahrobani M.Pd',
] as const;

/**
 * Menghapus SELURUH data santri dan musyrif palsu/dummy dari database Firestore,
 * dan hanya memasukkan data resmi Rumah Qur'an Kuningan:
 * - 6 Santri Ikhwan (Pengajar: Chandra Hidayat)
 * - 3 Santri Akhwat (Pengajar: Sofi Zahrotul Mutiah)
 * - Pimpinan: Ustadz Imam Syahrobani M.Pd
 */
export async function purgeAllFakeDataAndApplyOfficial(): Promise<void> {
  // 1. Bersihkan seluruh santri dummy/fake yang namanya tidak ada di daftar resmi
  try {
    const studentsSnap = await getDocs(collection(db, STUDENTS_PATH));
    for (const d of studentsSnap.docs) {
      const data = d.data();
      const isOfficial = OFFICIAL_STUDENT_NAMES.includes(data.name as any);
      if (!isOfficial) {
        await deleteDoc(doc(db, STUDENTS_PATH, d.id));
      }
    }
  } catch (err) {
    console.warn('Catatan pembersihan santri lama:', err);
  }

  // 2. Bersihkan musyrif yang bukan resmi
  try {
    const musyrifsSnap = await getDocs(collection(db, MUSYRIFS_PATH));
    for (const d of musyrifsSnap.docs) {
      const data = d.data();
      const isOfficialMusyrif = OFFICIAL_MUSYRIF_NAMES.includes(data.name as any);
      if (!isOfficialMusyrif) {
        await deleteDoc(doc(db, MUSYRIFS_PATH, d.id));
      }
    }
  } catch (err) {
    console.warn('Catatan pembersihan musyrif lama:', err);
  }

  // 3. Bersihkan kelas yang bukan 2 kelas resmi
  try {
    const classesSnap = await getDocs(collection(db, CLASSES_PATH));
    for (const d of classesSnap.docs) {
      const data = d.data();
      if (data.name !== 'Kelompok Ikhwan' && data.name !== 'Kelompok Akhwat') {
        await deleteDoc(doc(db, CLASSES_PATH, d.id));
      }
    }
  } catch (err) {
    console.warn('Catatan pembersihan kelas lama:', err);
  }

  // 4. Official Classes / Halaqah
  const officialClasses: Array<Omit<HalaqahClass, 'id'> & { id: string }> = [
    {
      id: 'cls_ikhwan',
      name: 'Kelompok Ikhwan',
      ustadz: 'Chandra Hidayat',
      description: 'Kelompok Santri Ikhwan (6 Santri) • Pengajar: Chandra Hidayat • Pimpinan: Ustadz Imam Syahrobani M.Pd',
    },
    {
      id: 'cls_akhwat',
      name: 'Kelompok Akhwat',
      ustadz: 'Sofi Zahrotul Mutiah',
      description: 'Kelompok Santri Akhwat (3 Santri) • Pengajar: Sofi Zahrotul Mutiah • Pimpinan: Ustadz Imam Syahrobani M.Pd',
    },
  ];

  for (const c of officialClasses) {
    await setDoc(doc(db, CLASSES_PATH, c.id), c);
  }

  // 5. Official Musyrif & Leadership
  const officialMusyrifs: Array<Omit<Musyrif, 'id'> & { id: string }> = [
    {
      id: 'msy_chandra',
      name: 'Chandra Hidayat',
      nip: 'RQK-MSY-IKH',
      role: 'Pengajar / Musyrif Kelompok Ikhwan',
      phone: '08123450001',
      assignedHalaqah: 'Kelompok Ikhwan',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'msy_sofi',
      name: 'Sofi Zahrotul Mutiah',
      nip: 'RQK-MSY-AKH',
      role: 'Pengajar / Musyrifah Kelompok Akhwat',
      phone: '08123450002',
      assignedHalaqah: 'Kelompok Akhwat',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'msy_imam',
      name: 'Ustadz Imam Syahrobani M.Pd',
      nip: 'RQK-PIM-00',
      role: "Pimpinan Rumah Qur'an Kuningan",
      phone: '08123450000',
      assignedHalaqah: 'Pimpinan & Pembina Utama',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString(),
    },
  ];

  for (const m of officialMusyrifs) {
    await setDoc(doc(db, MUSYRIFS_PATH, m.id), m);
  }

  // 6. Official Santri (HANYA INI: 6 Ikhwan + 3 Akhwat)
  const officialStudents: Array<Omit<Student, 'id'> & { id: string }> = [
    // Kelompok Ikhwan (6 Santri - Pengajar: Chandra Hidayat)
    {
      id: 'std_aly_mudjahid',
      name: 'Aly Mudjahid',
      nis: 'RQK-IKH-01',
      classGroup: 'Kelompok Ikhwan',
      gender: 'ikhwan',
      targetJuz: 30,
      currentJuz: 30,
      targetSurah: "An-Naba'",
      targetSurahNumber: 78,
      targetHarianPages: 2, // 1 lembar / 2 halaman
      targetPekananPages: 10, // 5 lembar / 10 halaman
      targetBulananJuz: 1.5, // Min 1.5 Juz / bulan
      targetNotes: "Target resmi RQ: 1 lembar/hari aktif KBM, 5 lembar/pekan, min 1.5 Juz/bulan.",
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'std_hafiz_rizky',
      name: 'Hafiz Rizky',
      nis: 'RQK-IKH-02',
      classGroup: 'Kelompok Ikhwan',
      gender: 'ikhwan',
      targetJuz: 30,
      currentJuz: 30,
      targetSurah: 'Al-Fajr',
      targetSurahNumber: 89,
      targetHarianPages: 2,
      targetPekananPages: 10,
      targetBulananJuz: 1.5,
      targetNotes: "Target resmi RQ: 1 lembar/hari aktif KBM, 5 lembar/pekan, min 1.5 Juz/bulan.",
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'std_irfan_hidayat',
      name: 'Irfan Hidayat',
      nis: 'RQK-IKH-03',
      classGroup: 'Kelompok Ikhwan',
      gender: 'ikhwan',
      targetJuz: 30,
      currentJuz: 30,
      targetSurah: "An-Nazi'at",
      targetSurahNumber: 79,
      targetHarianPages: 2,
      targetPekananPages: 10,
      targetBulananJuz: 1.5,
      targetNotes: "Target resmi RQ: 1 lembar/hari aktif KBM, 5 lembar/pekan, min 1.5 Juz/bulan.",
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'std_naufal_haidar',
      name: 'Naufal Haidar Azmi',
      nis: 'RQK-IKH-04',
      classGroup: 'Kelompok Ikhwan',
      gender: 'ikhwan',
      targetJuz: 30,
      currentJuz: 30,
      targetSurah: 'Al-Buruj',
      targetSurahNumber: 85,
      targetHarianPages: 2,
      targetPekananPages: 10,
      targetBulananJuz: 1.5,
      targetNotes: "Target resmi RQ: 1 lembar/hari aktif KBM, 5 lembar/pekan, min 1.5 Juz/bulan.",
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'std_syarief_hidayatullah',
      name: 'Syarief Hidayatullah',
      nis: 'RQK-IKH-05',
      classGroup: 'Kelompok Ikhwan',
      gender: 'ikhwan',
      targetJuz: 30,
      currentJuz: 30,
      targetSurah: 'At-Takwir',
      targetSurahNumber: 81,
      targetHarianPages: 2,
      targetPekananPages: 10,
      targetBulananJuz: 1.5,
      targetNotes: "Target resmi RQ: 1 lembar/hari aktif KBM, 5 lembar/pekan, min 1.5 Juz/bulan.",
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'std_muhammad_ammar',
      name: 'Muhammad Ammar K.P',
      nis: 'RQK-IKH-06',
      classGroup: 'Kelompok Ikhwan',
      gender: 'ikhwan',
      targetJuz: 30,
      currentJuz: 30,
      targetSurah: 'Al-Infithar',
      targetSurahNumber: 82,
      targetHarianPages: 2,
      targetPekananPages: 10,
      targetBulananJuz: 1.5,
      targetNotes: "Target resmi RQ: 1 lembar/hari aktif KBM, 5 lembar/pekan, min 1.5 Juz/bulan.",
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString(),
    },

    // Kelompok Akhwat (3 Santri - Pengajar: Sofi Zahrotul Mutiah)
    {
      id: 'std_amelia_agustin',
      name: 'Amelia Agustin',
      nis: 'RQK-AKH-01',
      classGroup: 'Kelompok Akhwat',
      gender: 'akhwat',
      targetJuz: 30,
      currentJuz: 29,
      targetSurah: 'Al-Mulk',
      targetSurahNumber: 67,
      targetHarianPages: 2,
      targetPekananPages: 10,
      targetBulananJuz: 1.5,
      targetNotes: "Target resmi RQ: 1 lembar/hari aktif KBM, 5 lembar/pekan, min 1.5 Juz/bulan.",
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'std_husna_maaab',
      name: "Husna Ma'aab Laleno",
      nis: 'RQK-AKH-02',
      classGroup: 'Kelompok Akhwat',
      gender: 'akhwat',
      targetJuz: 30,
      currentJuz: 29,
      targetSurah: 'Al-Qalam',
      targetSurahNumber: 68,
      targetHarianPages: 2,
      targetPekananPages: 10,
      targetBulananJuz: 1.5,
      targetNotes: "Target resmi RQ: 1 lembar/hari aktif KBM, 5 lembar/pekan, min 1.5 Juz/bulan.",
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'std_najwa_octa',
      name: 'Najwa Octa Salsabilah',
      nis: 'RQK-AKH-03',
      classGroup: 'Kelompok Akhwat',
      gender: 'akhwat',
      targetJuz: 30,
      currentJuz: 29,
      targetSurah: 'Al-Insan',
      targetSurahNumber: 76,
      targetHarianPages: 2,
      targetPekananPages: 10,
      targetBulananJuz: 1.5,
      targetNotes: "Target resmi RQ: 1 lembar/hari aktif KBM, 5 lembar/pekan, min 1.5 Juz/bulan.",
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString(),
    },
  ];

  for (const s of officialStudents) {
    await setDoc(doc(db, STUDENTS_PATH, s.id), s);
  }

  // 5. Clean up old sample assessments if they reference old students
  try {
    const asmSnap = await getDocs(collection(db, ASSESSMENTS_PATH));
    for (const d of asmSnap.docs) {
      const data = d.data();
      const isOfficial = officialStudents.some(
        (s) => s.id === data.studentId || s.name === data.studentName
      );
      if (!isOfficial) {
        await deleteDoc(doc(db, ASSESSMENTS_PATH, d.id));
      }
    }
  } catch (err) {
    console.warn('Catatan pembersihan nilai lama:', err);
  }

  // 6. Provide starter assessments for official students
  const sampleAssessments: Array<Omit<Assessment, 'id'> & { id: string }> = [
    {
      id: 'asm_aly_01',
      studentId: 'std_aly_mudjahid',
      studentName: 'Aly Mudjahid',
      classGroup: 'Kelompok Ikhwan',
      category: 'ziyadah',
      session: 'Sesi 1',
      surahNumber: 78,
      surahName: "An-Naba'",
      surahArabic: 'النبأ',
      ayahStart: 1,
      ayahEnd: 20,
      juz: 30,
      kelancaran: 95,
      tajwid: 93,
      makhraj: 94,
      adab: 95,
      totalScore: 94.1,
      grade: 'Mumtaz (A+)',
      notes: 'Maa Syaa Allah, bacaan tartil dan sangat mutqin. Pertahankan!',
      examinerName: 'Chandra Hidayat',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'asm_amelia_01',
      studentId: 'std_amelia_agustin',
      studentName: 'Amelia Agustin',
      classGroup: 'Kelompok Akhwat',
      category: 'murojaah',
      session: 'Sesi 2',
      surahNumber: 67,
      surahName: 'Al-Mulk',
      surahArabic: 'الملك',
      ayahStart: 1,
      ayahEnd: 30,
      juz: 29,
      kelancaran: 92,
      tajwid: 90,
      makhraj: 91,
      adab: 94,
      totalScore: 91.5,
      grade: 'Mumtaz (A+)',
      notes: 'Alhamdulillah mutqin, jaga konsistensi murojaah mandiri.',
      examinerName: 'Sofi Zahrotul Mutiah',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'asm_hafiz_01',
      studentId: 'std_hafiz_rizky',
      studentName: 'Hafiz Rizky',
      classGroup: 'Kelompok Ikhwan',
      category: 'tasmi_pekanan',
      session: 'Sesi 1',
      surahNumber: 89,
      surahName: 'Al-Fajr',
      surahArabic: 'الفجر',
      ayahStart: 1,
      ayahEnd: 30,
      juz: 30,
      kelancaran: 88,
      tajwid: 89,
      makhraj: 87,
      adab: 92,
      totalScore: 88.7,
      grade: 'Jayyid Jiddan (A)',
      notes: 'Bagus, tingkatkan pengucapan ghunnah dan mad thabi’i.',
      examinerName: 'Chandra Hidayat',
      date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ];

  for (const a of sampleAssessments) {
    await setDoc(doc(db, ASSESSMENTS_PATH, a.id), a);
  }
}

export const seedDemoData = purgeAllFakeDataAndApplyOfficial;

