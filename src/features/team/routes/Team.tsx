
import React from 'react';
import { Mail, Phone, Shield, MoreVertical } from 'lucide-react';
// import { useAuth } from '../../auth';

const TEAM_MEMBERS = [
    { id: 1, name: 'Alex Mercer', role: 'Project Manager', email: 'alex.m@skyline.com', phone: '+1 (555) 123-4567', avatar: 'AM', status: 'Online' },
    { id: 2, name: 'Sarah Chen', role: 'BIM Manager', email: 'sarah.c@skyline.com', phone: '+1 (555) 987-6543', avatar: 'SC', status: 'In Meeting' },
    { id: 3, name: 'Mike Ross', role: 'Site Superintendent', email: 'mike.r@construction.com', phone: '+1 (555) 456-7890', avatar: 'MR', status: 'Offline' },
];

const TeamView: React.FC = () => {
    // const { user } = useAuth();

    return (
        <div className="p-8 h-full bg-slate-50 overflow-y-auto">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Project Team</h1>
                    <p className="text-sm text-slate-500">Manage access and permissions for Skyline Tower Ph 2</p>
                </div>
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-red-900/10 hover:bg-red-700 transition">
                    + INVITE MEMBER
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {TEAM_MEMBERS.map(member => (
                    <div key={member.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg border border-slate-200">
                                {member.avatar}
                            </div>
                            <button className="text-slate-400 hover:text-slate-600">
                                <MoreVertical size={20} />
                            </button>
                        </div>

                        <h3 className="font-bold text-slate-900 text-lg">{member.name}</h3>
                        <div className="flex items-center space-x-2 mb-4">
                            <Shield size={14} className="text-red-500" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{member.role}</span>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-slate-100">
                            <div className="flex items-center text-sm text-slate-600">
                                <Mail size={16} className="mr-3 text-slate-400" />
                                {member.email}
                            </div>
                            <div className="flex items-center text-sm text-slate-600">
                                <Phone size={16} className="mr-3 text-slate-400" />
                                {member.phone}
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.status === 'Online' ? 'bg-green-100 text-green-800' :
                                    member.status === 'In Meeting' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                                }`}>
                                {member.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeamView;
