
import React, { useState } from 'react';
import {
  ClipboardCheck,
  ShieldCheck,
  HardHat,
  Search,
  Filter,
  Plus,
  ChevronRight,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  User,
  Check,
  Ban
} from 'lucide-react';
import { MOCK_INSPECTIONS } from '../../../lib/constants';
import { Inspection } from '../../../types';
import Badge from '../../../components/ui/Badge';

const InspectionsView: React.FC = () => {
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredInspections = MOCK_INSPECTIONS.filter(ins => {
    const matchesSearch = ins.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ins.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || ins.type.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex h-full bg-white overflow-hidden relative">
      {/* Secondary Sidebar (Module Nav) */}
      <aside className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
        <div className="p-4">
          <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-red-900/10 flex items-center justify-center space-x-2 transition-all">
            <Plus size={18} />
            <span className="text-sm">NEW INSPECTION</span>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
          {[
            { id: 'all', label: 'All Inspections', icon: ClipboardCheck },
            { id: 'qa', label: 'Quality Assurance', icon: ShieldCheck },
            { id: 'qc', label: 'Quality Control', icon: CheckCircle2 },
            { id: 'safety', label: 'Health & Safety', icon: HardHat },
            { id: 'env', label: 'Environmental', icon: FileText }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveCategory(item.id)}
              className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeCategory === item.id
                  ? 'bg-white text-red-600 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:bg-white hover:text-slate-900'
                }`}
            >
              <item.icon size={18} className={`mr-3 ${activeCategory === item.id ? 'text-red-600' : 'text-slate-400'}`} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg border border-red-100">
            <AlertCircle size={14} className="text-red-600 shrink-0" />
            <span className="text-[10px] font-bold text-red-700 uppercase leading-tight">ISO 19650 Validation Required</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 overflow-auto bg-slate-50 flex flex-col transition-all duration-500 ease-in-out ${selectedInspection ? 'mr-96 opacity-60 pointer-events-none translate-x-[-10%]' : ''}`}>
        <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Project Inspections & Audits</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Information Container Verification according to ISO 19650 standards.</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search inspection IDs or titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm shadow-sm focus:ring-4 focus:ring-red-500/5 outline-none transition-all font-medium"
              />
            </div>
            <button className="flex items-center px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm">
              <Filter size={18} className="mr-2 text-slate-400" />
              ADVANCED
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">ID & Type</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Inspection Subject</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assignee</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Location</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">ISO Code</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInspections.map(ins => (
                    <tr
                      key={ins.id}
                      onClick={() => setSelectedInspection(ins)}
                      className="hover:bg-slate-50 group cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-lg mr-3 ${ins.type === 'QC' ? 'bg-blue-50 text-blue-600' :
                              ins.type === 'Safety' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                            }`}>
                            <ClipboardCheck size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">{ins.id}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{ins.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-bold text-sm text-slate-700">{ins.title}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center text-xs font-medium text-slate-600">
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold mr-2">{ins.assignedTo[0]}</div>
                          {ins.assignedTo}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-xs text-slate-500 font-medium">{ins.location}</td>
                      <td className="px-6 py-5">
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-bold text-slate-500">
                          {ins.isoSuitability}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Badge status={ins.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Slide-over Detailed View */}
      <div className={`fixed inset-y-0 right-0 w-[480px] bg-white border-l border-slate-200 shadow-2xl transform transition-transform duration-500 ease-out z-50 ${selectedInspection ? 'translate-x-0' : 'translate-x-full'}`}>
        {selectedInspection && (
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-900 flex items-center">
                  <ClipboardCheck size={20} className="mr-3 text-red-600" />
                  Inspection Record
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-8">{selectedInspection.id}</p>
              </div>
              <button onClick={() => setSelectedInspection(null)} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Info Banner */}
              <div className="p-6 bg-slate-900 text-white space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="text-xl font-bold leading-tight">{selectedInspection.title}</h4>
                  <Badge status={selectedInspection.status} className="bg-white/10 text-white border-white/20" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center text-slate-400 text-xs font-medium">
                    <User size={14} className="mr-2" />
                    {selectedInspection.assignedTo}
                  </div>
                  <div className="flex items-center text-slate-400 text-xs font-medium">
                    <Clock size={14} className="mr-2" />
                    {selectedInspection.date}
                  </div>
                </div>
              </div>

              {/* Related Containers Section */}
              {selectedInspection.refContainer && (
                <div className="p-6 border-b border-slate-100">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Reference Information Container</h5>
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center group cursor-pointer hover:bg-red-100 transition-colors">
                    <FileText size={20} className="text-red-600 mr-3" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{selectedInspection.refContainer}</p>
                      <p className="text-[10px] font-bold text-red-600/60 uppercase">Revision C02 • Suitability {selectedInspection.isoSuitability}</p>
                    </div>
                    <ChevronRight size={16} className="text-red-300" />
                  </div>
                </div>
              )}

              {/* Checklist Section */}
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Checklist Items</h5>
                  <span className="text-[10px] font-bold text-slate-400">{selectedInspection.checklist.filter(i => i.checked).length}/{selectedInspection.checklist.length} Verified</span>
                </div>

                <div className="space-y-3">
                  {selectedInspection.checklist.map(item => (
                    <div key={item.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <div className="flex items-start">
                        <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${item.checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-300'}`}>
                          {item.checked && <Check size={14} strokeWidth={4} />}
                        </div>
                        <span className="ml-3 text-sm font-bold text-slate-700 leading-tight">{item.label}</span>
                      </div>
                      <div className="flex items-center space-x-2 pl-8">
                        <button className={`px-3 py-1 text-[10px] font-bold rounded-md border transition-all ${item.status === 'Pass' ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white text-slate-400 border-slate-200'}`}>PASS</button>
                        <button className={`px-3 py-1 text-[10px] font-bold rounded-md border transition-all ${item.status === 'Fail' ? 'bg-red-600 text-white border-red-700' : 'bg-white text-slate-400 border-slate-200'}`}>FAIL</button>
                        <button className="px-3 py-1 text-[10px] font-bold rounded-md border border-slate-200 bg-white text-slate-400">N/A</button>
                      </div>
                      {item.comment && (
                        <div className="ml-8 p-3 bg-white border border-slate-100 rounded-lg text-xs font-medium text-slate-500 italic">
                          &quot;{item.comment}&quot;
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center px-4 py-3 bg-red-600 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-red-900/10 hover:bg-red-700">
                <Check size={18} className="mr-2" /> VERIFY RECORD
              </button>
              <button className="flex items-center justify-center px-4 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-sm transition hover:bg-slate-100">
                <Ban size={18} className="mr-2" /> REJECT
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectionsView;
