import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  UserPlus,
  Search,
  Trash2,
  Edit2,
  Phone,
  BookOpen,
  Award,
  X,
  CheckCircle2,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { Musyrif, Assessment } from '../types';
import { saveMusyrif, removeMusyrif } from '../services/quranService';

interface MusyrifManagerProps {
  musyrifs: Musyrif[];
  assessments: Assessment[];
  classes: string[];
  onSyncRoster?: () => void;
}

export const MusyrifManager: React.FC<MusyrifManagerProps> = ({
  musyrifs,
  assessments,
  classes,
  onSyncRoster,
}) => {
  const [search, setSearch] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingMusyrif, setEditingMusyrif] = useState<Musyrif | null>(null);

  // Form states
  const [name, setName] = useState<string>('');
  const [nip, setNip] = useState<string>('');
  const [role, setRole] = useState<string>('Musyrif Tahfidz');
  const [phone, setPhone] = useState<string>('');
  const [assignedHalaqah, setAssignedHalaqah] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const openAddModal = () => {
    setEditingMusyrif(null);
    setName('');
    setNip(`RQK-MSY-${Math.floor(10 + Math.random() * 90)}`);
    setRole('Pengajar / Musyrif Al-Qur\'an');
    setPhone('');
    setAssignedHalaqah(classes[0] || 'Kelompok Ikhwan');
    setIsModalOpen(true);
  };

  const openEditModal = (m: Musyrif) => {
    setEditingMusyrif(m);
    setName(m.name);
    setNip(m.nip || '');
    setRole(m.role || 'Pengajar / Musyrif Al-Qur\'an');
    setPhone(m.phone || '');
    setAssignedHalaqah(m.assignedHalaqah || classes[0] || 'Kelompok Ikhwan');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      await saveMusyrif({
        ...(editingMusyrif ? { id: editingMusyrif.id } : {}),
        name: name.trim(),
        nip: nip.trim() || `NIP-${Date.now().toString().slice(-4)}`,
        role: role.trim() || 'Musyrif Al-Qur\'an',
        phone: phone.trim(),
        assignedHalaqah: assignedHalaqah.trim() || classes[0] || 'Umum',
        createdAt: editingMusyrif?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan data musyrif.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, musyrifName: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus musyrif/penguji "${musyrifName}"? Data penilaian yang tersimpan akan tetap terjaga.`)) {
      try {
        await removeMusyrif(id);
      } catch (err) {
        console.error(err);
        alert('Gagal menghapus musyrif.');
      }
    }
  };

  // Count assessments tested by each musyrif
  const examinerCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    assessments.forEach((asm) => {
      const exName = (asm.examinerName || '').trim().toLowerCase();
      if (exName) {
        map[exName] = (map[exName] || 0) + 1;
      }
    });
    return map;
  }, [assessments]);

  // Filtered list
  const filteredMusyrifs = useMemo(() => {
    return musyrifs.filter((m) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        (m.nip || '').toLowerCase().includes(q) ||
        (m.role || '').toLowerCase().includes(q) ||
        (m.assignedHalaqah || '').toLowerCase().includes(q)
      );
    });
  }, [musyrifs, search]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Search */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari musyrif, ustadz, atau NIP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {onSyncRoster && (
            <button
              onClick={onSyncRoster}
              title="Bersihkan data palsu dan pasang Chandra Hidayat, Sofi Zahrotul Mutiah, & Pimpinan Ustadz Imam Syahrobani M.Pd"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Reset Data Pengajar Resmi</span>
            </button>
          )}

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Musyrif / Ustadz</span>
          </button>
        </div>
      </div>

      {/* Official Structure & Leadership Card */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-5 rounded-2xl shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/15 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-md border border-amber-300/30">
              Pimpinan Lembaga
            </span>
            <h3 className="text-base font-extrabold text-white mt-1">Ustadz Imam Syahrobani M.Pd</h3>
            <p className="text-xs text-emerald-200">Pimpinan Rumah Qur'an Kuningan</p>
          </div>
          <div className="text-xs text-emerald-100/80 sm:text-right">
            <span>Struktur Pengajar Resmi</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-white/10 rounded-xl p-3 border border-white/10">
            <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider block">Kelompok Ikhwan (6 Santri)</span>
            <p className="font-bold text-sm text-white mt-0.5">Chandra Hidayat</p>
            <p className="text-emerald-200 text-[11px]">Pengajar / Musyrif Ikhwan</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 border border-white/10">
            <span className="text-[10px] font-bold text-pink-200 uppercase tracking-wider block">Kelompok Akhwat (3 Santri)</span>
            <p className="font-bold text-sm text-white mt-0.5">Sofi Zahrotul Mutiah</p>
            <p className="text-emerald-200 text-[11px]">Pengajar / Musyrifah Akhwat</p>
          </div>
        </div>
      </div>

      {/* Musyrif Cards Grid */}
      {filteredMusyrifs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <UserCheck className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-sm">Belum Ada Data Musyrif / Penguji</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search ? 'Tidak ada musyrif yang cocok dengan kata kunci pencarian.' : 'Silakan tambahkan data ustadz / pengampu halaqah untuk memudahkan pemilihan penguji saat input nilai.'}
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            + Tambah Musyrif Baru
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMusyrifs.map((m) => {
            const normalizedName = m.name.trim().toLowerCase();
            const totalTested = examinerCountMap[normalizedName] || 0;

            return (
              <div
                key={m.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        NIP: {m.nip || '-'}
                      </span>
                      <h4 className="font-bold text-slate-900 text-base mt-2">{m.name}</h4>
                      <p className="text-xs text-emerald-700 font-medium">{m.role || 'Musyrif Al-Qur\'an'}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(m)}
                        title="Edit Data Musyrif"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(m.id, m.name)}
                        title="Hapus Data Musyrif"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Info Badges */}
                  <div className="space-y-2 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">Halaqah: <strong>{m.assignedHalaqah || '-'}</strong></span>
                    </div>
                    {m.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{m.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Total Penilaian Diuji */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/70 p-2.5 rounded-xl">
                  <span className="text-slate-500 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    Setoran Diuji:
                  </span>
                  <span className="font-bold text-emerald-800 text-sm">
                    {totalTested} Kali
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Musyrif Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                <span>{editingMusyrif ? 'Edit Data Musyrif / Ustadz' : 'Tambah Musyrif / Ustadz Baru'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Ustadz Muhammad Yusuf, Lc"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">NIP / ID Musyrif</label>
                  <input
                    type="text"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">No. WhatsApp / HP</label>
                  <input
                    type="text"
                    placeholder="08123456789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Peran / Jabatan</label>
                <input
                  type="text"
                  placeholder="Musyrif Tahfidz / Penguji Tasmi'"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  list="roles-list"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800"
                />
                <datalist id="roles-list">
                  <option value="Musyrif Senior Tahfidz" />
                  <option value="Musyrif Halaqah" />
                  <option value="Penguji Tasmi & Mutqin" />
                  <option value="Ustadzah Tahsin & Tilawah" />
                  <option value="Koordinator Kurikulum Al-Qur'an" />
                </datalist>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Halaqah Binaan</label>
                <input
                  type="text"
                  placeholder="Halaqah Ali Bin Abi Thalib"
                  value={assignedHalaqah}
                  onChange={(e) => setAssignedHalaqah(e.target.value)}
                  list="classes-list"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800"
                />
                <datalist id="classes-list">
                  {classes.map((cls) => (
                    <option key={cls} value={cls} />
                  ))}
                </datalist>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
