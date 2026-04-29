/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  Camera, 
  MapPin, 
  Calendar, 
  User, 
  FileSpreadsheet, 
  CheckCircle2, 
  Clock,
  ArrowLeft,
  Filter
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { db, type PICARecord } from './db';
import { cn } from './lib/utils';

export default function App() {
  const [view, setView] = useState<'list' | 'form' | 'assignment'>('list');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const records = useLiveQuery(
    () => db.pica.toArray(),
    []
  );

  const filteredRecords = records?.filter(r => 
    r.Masalah_Issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.PIC_Solusi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.Lokasi.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEdit = (record: PICARecord) => {
    setEditingId(record.id!);
    setView('form');
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      await db.pica.delete(id);
    }
  };

  const exportToExcel = () => {
    if (!records || records.length === 0) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }
    
    const exportData = records.map(({ Photo_Issue, Photo_Status, ...rest }) => ({
      ...rest,
      Punya_Foto_Issue: Photo_Issue ? 'Ya' : 'Tidak',
      Punya_Foto_Status: Photo_Status ? 'Ya' : 'Tidak'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PICA Records");
    XLSX.writeFile(wb, `PICA_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="bg-slate-900 text-white px-6 py-4 flex flex-col md:flex-row justify-between items-center shrink-0 shadow-md gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 p-2 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            PICA <span className="text-blue-400 font-normal">| Monitoring System</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search issues, PIC, location..." 
              className="w-full bg-slate-800 text-white text-sm border-none rounded-lg py-2 pl-9 pr-4 focus:ring-1 focus:ring-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded font-medium text-sm transition shadow-sm whitespace-nowrap"
          >
            <FileSpreadsheet size={16} />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button 
            onClick={() => setView('assignment')}
            className="bg-slate-700 hover:bg-slate-600 p-2 rounded font-medium text-sm transition shadow-sm"
          >
            <Filter size={18} />
          </button>
          <button 
            onClick={() => { setEditingId(null); setView('form'); }}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-medium text-sm transition shadow-sm whitespace-nowrap"
          >
            New Report
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 overflow-hidden p-4 md:p-6 flex flex-col lg:flex-row gap-6">
        {/* Registry Table Section */}
        <section className={cn(
          "flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300",
          view === 'list' ? "lg:w-7/12 flex-1" : "lg:w-7/12 hidden lg:flex"
        )}>
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 className="font-semibold text-slate-700">Active Issues Registry</h2>
            <div className="text-xs text-slate-500 font-medium">
              Showing {filteredRecords.length} records
            </div>
          </div>
          
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[600px]">
              <thead className="bg-slate-100 text-slate-600 sticky top-0 z-10">
                <tr>
                  <th className="p-3 font-medium">ID</th>
                  <th className="p-3 font-medium">Issue / Problem</th>
                  <th className="p-3 font-medium">Location</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-3 text-slate-400 font-mono text-xs">#{r.id?.toString().padStart(3, '0')}</td>
                    <td className="p-3">
                      <div className="font-medium text-slate-900">{r.Masalah_Issue}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[200px]">{r.Dampak_Akibat}</div>
                    </td>
                    <td className="p-3 text-slate-600">{r.Lokasi}</td>
                    <td className="p-3">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        r.Status_Issue === 'Open' ? "bg-red-100 text-red-700" : 
                        r.Status_Issue === 'Closed' ? "bg-emerald-100 text-emerald-700" : 
                        "bg-amber-100 text-amber-700"
                      )}>
                        {r.Status_Issue}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(r)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(r.id!)}
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRecords.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Search size={40} className="mb-2 opacity-20" />
                <p>No results found</p>
              </div>
            )}
          </div>
        </section>

        {/* Input Form Section (Always visible on desktop, modal-like on mobile) */}
        <aside className={cn(
          "flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300",
          view === 'list' ? "lg:w-5/12 hidden lg:flex" : "flex-1 lg:w-5/12"
        )}>
          <AnimatePresence mode="wait">
            {view === 'form' ? (
              <PICAForm 
                key="form-view"
                id={editingId} 
                onClose={() => {
                  setView('list');
                  setEditingId(null);
                }} 
              />
            ) : view === 'assignment' ? (
              <AssignmentForm 
                key="assign-view"
                records={records || []}
                onClose={() => setView('list')}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-10 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Plus className="text-slate-200" size={32} />
                </div>
                <h3 className="text-slate-500 font-medium mb-1">Issue Details</h3>
                <p className="text-sm max-w-xs">Select an issue from the registry to view details or click "New Report" to add one.</p>
              </div>
            )}
          </AnimatePresence>
        </aside>
      </div>

      {/* Footer Status Bar */}
      <footer className="bg-white border-t border-slate-200 px-6 py-2 flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-widest font-semibold shrink-0">
        <div className="flex gap-6">
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> DB: PICA.db</span>
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> System: Stable</span>
        </div>
        <div className="hidden sm:block">
          Runtime Environment: Production | v1.0.4
        </div>
      </footer>
    </div>
  );
}

function PICAForm({ id, onClose }: { id: number | null; onClose: () => void; key?: string }) {
  const [formData, setFormData] = useState<Partial<PICARecord>>({
    Masalah_Issue: '',
    Dampak_Akibat: '',
    Lokasi: '',
    Tanggal_Issue: new Date().toISOString().split('T')[0],
    User_Info: '',
    Langkah_Penyelesaian: '',
    PIC_Solusi: '',
    Status_Issue: 'Open',
    Photo_Status: '',
    Tanggal_Update: new Date().toISOString().split('T')[0],
    Keterangan: ''
  });

  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (id) {
      db.pica.get(id).then(record => {
        if (record) setFormData(record);
      });
    }
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'Photo_Issue' | 'Photo_Status') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await db.pica.update(id, formData as PICARecord);
      } else {
        await db.pica.add(formData as PICARecord);
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan data.');
    } finally {
      setLoading(false);
    }
  };

  const InputLabel = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 px-1">
      {children}
    </label>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full overflow-hidden"
    >
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <div>
          <h2 className="font-semibold text-slate-700">{id ? 'Update Issue Details' : 'Report Issue Details'}</h2>
          <p className="text-[10px] text-slate-500 font-medium">Complete all fields to sync with registry</p>
        </div>
        <button onClick={onClose} className="lg:hidden p-1 text-slate-400 hover:text-slate-600"><X size={20} /></button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <InputLabel>Masalah Issue</InputLabel>
            <input 
              required
              placeholder="Describe the problem..."
              className="w-full border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm p-3 transition-shadow shadow-sm"
              value={formData.Masalah_Issue}
              onChange={(e) => setFormData({ ...formData, Masalah_Issue: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <InputLabel>Dampak Akibat</InputLabel>
            <input 
              required
              placeholder="Operational impact..."
              className="w-full border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm p-3 transition-shadow shadow-sm"
              value={formData.Dampak_Akibat}
              onChange={(e) => setFormData({ ...formData, Dampak_Akibat: e.target.value })}
            />
          </div>
          <div>
            <InputLabel>Lokasi</InputLabel>
            <input 
              type="text" required
              placeholder="Area / Zone"
              className="w-full border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm p-3 transition-shadow shadow-sm"
              value={formData.Lokasi}
              onChange={(e) => setFormData({ ...formData, Lokasi: e.target.value })}
            />
          </div>
          <div>
            <InputLabel>Tanggal Issue</InputLabel>
            <input 
              type="date" required
              className="w-full border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm p-3 transition-shadow shadow-sm"
              value={formData.Tanggal_Issue}
              onChange={(e) => setFormData({ ...formData, Tanggal_Issue: e.target.value })}
            />
          </div>
          <div>
            <InputLabel>PIC Solusi</InputLabel>
            <input 
              type="text" required
              placeholder="Assignee"
              className="w-full border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm p-3 transition-shadow shadow-sm"
              value={formData.PIC_Solusi}
              onChange={(e) => setFormData({ ...formData, PIC_Solusi: e.target.value })}
            />
          </div>
          <div>
            <InputLabel>Status</InputLabel>
            <select 
              className="w-full border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm p-3 transition-shadow shadow-sm bg-white"
              value={formData.Status_Issue}
              onChange={(e) => setFormData({ ...formData, Status_Issue: e.target.value })}
            >
              <option value="Open">Open</option>
              <option value="Progress">In Progress</option>
              <option value="Closed">Resolved</option>
            </select>
          </div>
          <div className="col-span-2">
            <InputLabel>Langkah Penyelesaian</InputLabel>
            <textarea 
              placeholder="Action steps..."
              className="w-full border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm p-3 h-20 transition-shadow shadow-sm"
              value={formData.Langkah_Penyelesaian}
              onChange={(e) => setFormData({ ...formData, Langkah_Penyelesaian: e.target.value })}
            />
          </div>
          <div>
            <InputLabel>Issue Photo</InputLabel>
            <label className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center text-[10px] text-slate-400 bg-slate-50 cursor-pointer hover:bg-slate-100 hover:border-slate-300 transition-all block relative overflow-hidden group h-24">
              {formData.Photo_Issue ? (
                <img src={formData.Photo_Issue} className="absolute inset-0 w-full h-full object-cover opacity-30" alt="" />
              ) : (
                <Camera className="mx-auto mb-1 text-slate-300" size={20} />
              )}
              <span className="relative z-10">{formData.Photo_Issue ? 'Change Photo' : 'Upload Capture'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'Photo_Issue')} />
            </label>
          </div>
          <div>
            <InputLabel>Status Photo</InputLabel>
            <label className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center text-[10px] text-slate-400 bg-slate-50 cursor-pointer hover:bg-slate-100 hover:border-slate-300 transition-all block relative overflow-hidden group h-24">
              {formData.Photo_Status ? (
                <img src={formData.Photo_Status} className="absolute inset-0 w-full h-full object-cover opacity-30" alt="" />
              ) : (
                <CheckCircle2 className="mx-auto mb-1 text-slate-300" size={20} />
              )}
              <span className="relative z-10">{formData.Photo_Status ? 'Change Photo' : 'Upload After-Fix'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'Photo_Status')} />
            </label>
          </div>
        </div>
      </form>

      <div className="p-5 bg-slate-50 border-t border-slate-200 flex gap-3">
        <button 
          type="button" 
          onClick={onClose}
          className="flex-1 py-2.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm text-sm"
        >
          Batal
        </button>
        <button 
          type="submit" 
          disabled={loading}
          onClick={handleSubmit}
          className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-md hover:bg-blue-700 transition-all text-sm flex items-center justify-center gap-2"
        >
          {loading ? 'Processing...' : id ? 'Update Record' : 'Save Record'}
        </button>
      </div>
    </motion.div>
  );
}

function AssignmentForm({ records, onClose }: { records: PICARecord[]; onClose: () => void; key?: string }) {
  const [selectedRecordId, setSelectedRecordId] = useState<string>('');
  const [selectedPic, setSelectedPic] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);

  const uniquePics = Array.from(new Set(records.map(r => r.PIC_Solusi))).filter(Boolean);

  const handleAssign = async () => {
    if (!selectedRecordId) return;
    try {
      await db.pica.update(parseInt(selectedRecordId), {
        PIC_Solusi: selectedPic,
        Tanggal_Update: dueDate,
        Status_Issue: 'Progress'
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to assign PIC.');
    }
  };

  const InputLabel = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 px-1">
      {children}
    </label>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full overflow-hidden"
    >
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-white">
        <div>
          <h2 className="font-semibold">Quick Assignment</h2>
          <p className="text-[10px] text-slate-400 font-medium">Provision task to specific personnel</p>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-white"><X size={20} /></button>
      </div>

      <div className="flex-1 p-6 space-y-6">
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-blue-800 space-y-2">
           <Clock size={20} />
           <p className="text-xs leading-relaxed font-medium">Use this panel to quickly route existing issues to specialists and set deadlines.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <InputLabel>Select Target Issue</InputLabel>
            <select 
              className="w-full border-slate-200 rounded-lg p-3 text-sm bg-white shadow-sm focus:ring-blue-500"
              value={selectedRecordId}
              onChange={(e) => {
                setSelectedRecordId(e.target.value);
                const rec = records.find(r => r.id === parseInt(e.target.value));
                if (rec) setSelectedPic(rec.PIC_Solusi);
              }}
            >
              <option value="">-- Choose from Registry --</option>
              {records.map(r => (
                <option key={r.id} value={r.id}>{r.id}: {r.Masalah_Issue.substring(0, 50)}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <InputLabel>Primary PIC Assignee</InputLabel>
            <div className="relative">
               <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <input 
                list="pic-list-refined"
                className="w-full border-slate-200 rounded-lg p-3 pl-10 text-sm shadow-sm focus:ring-blue-500"
                placeholder="Search or add new identifier..."
                value={selectedPic}
                onChange={(e) => setSelectedPic(e.target.value)}
              />
              <datalist id="pic-list-refined">
                {uniquePics.map(pic => <option key={pic} value={pic} />)}
              </datalist>
            </div>
          </div>

          <div className="space-y-1">
            <InputLabel>Completion Deadline</InputLabel>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="date"
                className="w-full border-slate-200 rounded-lg p-3 pl-10 text-sm shadow-sm focus:ring-blue-500"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 border-t border-slate-100 flex gap-3">
        <button 
          onClick={handleAssign}
          disabled={!selectedRecordId}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold shadow-lg disabled:opacity-50 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <CheckCircle2 size={18} /> Deploy Assignment
        </button>
      </div>
    </motion.div>
  );
}
