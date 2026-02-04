
import React, { useState } from 'react';
import {
    Sun,
    Users,
    FileBarChart,
    Download,
    Plus,
    CheckCircle2,
    ChevronRight
} from 'lucide-react';

const DailyReports: React.FC = () => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    return (
        <div className="p-8 h-full bg-slate-50 overflow-y-auto">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                        <FileBarChart className="mr-3 text-red-600" size={28} />
                        Daily Construction Log
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Site diary and progress records for Skyline Tower Ph 2</p>
                </div>
                <div className="flex items-center space-x-3">
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                    <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-red-900/10 flex items-center">
                        <Plus size={16} className="mr-2" />
                        NEW ENTRY
                    </button>
                    <button className="p-2 bg-white border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50">
                        <Download size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Weather Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Site Conditions</h3>
                        <Sun className="text-amber-500" size={24} />
                    </div>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-slate-900">72°F</span>
                        <span className="text-sm font-medium text-slate-500">Sunny</span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                        <div className="bg-slate-50 p-2 rounded-lg">
                            <span className="text-slate-400 block mb-1">Wind</span>
                            <span className="font-bold text-slate-700">5 mph NW</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg">
                            <span className="text-slate-400 block mb-1">Humidity</span>
                            <span className="font-bold text-slate-700">45%</span>
                        </div>
                    </div>
                </div>

                {/* Manpower Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Manpower</h3>
                        <Users className="text-blue-500" size={24} />
                    </div>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-slate-900">142</span>
                        <span className="text-sm font-medium text-slate-500">Workers On-Site</span>
                    </div>
                    <div className="mt-4 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-blue-500 h-full w-3/4 rounded-full"></div>
                    </div>
                    <div className="mt-2 text-xs text-slate-400 font-bold text-right">92% of Scheduled</div>
                </div>

                {/* Health & Safety Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">H&S Status</h3>
                        <CheckCircle2 className="text-emerald-500" size={24} />
                    </div>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-emerald-600">Zero</span>
                        <span className="text-sm font-medium text-slate-500">Incidents Today</span>
                    </div>
                    <div className="mt-4 p-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold flex items-center">
                        <CheckCircle2 size={14} className="mr-2" />
                        Site Induction Completed (5 New)
                    </div>
                </div>
            </div>

            {/* Logs Section */}
            <div className="bg-white border boundary-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900">Work Logs</h3>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">4 Entries</span>
                </div>
                <div className="divide-y divide-slate-100">
                    {[
                        { time: '07:00', type: 'Briefing', title: 'Morning Safety Briefing', desc: 'Toolbox talk regarding scaffolding safety conducted by Safety Officer.', author: 'Mike Ross' },
                        { time: '09:30', type: 'Delivery', title: 'Concrete Delivery - Pour Zone A', desc: '15 trucks arrived for slab pour. QA slump test passed.', author: 'Sarah Chen' },
                        { time: '13:00', type: 'Progress', title: 'HVAC Installation L3', desc: 'Ductwork installation commenced on Level 3 East Wing.', author: 'Alex Mercer' },
                        { time: '15:45', type: 'Issue', title: 'Delay Notification', desc: 'Electrical rough-in halted in Zone B due to material shortage.', author: 'Mike Ross', isIssue: true },
                    ].map((log, i) => (
                        <div key={i} className="p-6 flex items-start hover:bg-slate-50 transition">
                            <div className="w-20 pt-1">
                                <span className="text-sm font-bold text-slate-500">{log.time}</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center mb-1">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase mr-3 ${log.isIssue ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                                        {log.type}
                                    </span>
                                    <h4 className="text-sm font-bold text-slate-900">{log.title}</h4>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">{log.desc}</p>
                                <div className="mt-2 flex items-center text-xs font-bold text-slate-400">
                                    Recorded by {log.author}
                                </div>
                            </div>
                            <ChevronRight className="text-slate-300" size={20} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DailyReports;
