
import React from 'react';
import { Settings, Bell, Globe, Database } from 'lucide-react';

const SettingsView: React.FC = () => {
    return (
        <div className="p-8 h-full bg-slate-50 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-slate-900 mb-8 flex items-center">
                    <Settings className="mr-3 text-slate-400" size={28} />
                    Application Settings
                </h1>

                <div className="grid gap-8">
                    {/* Profile Section */}
                    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="font-bold text-slate-900">Profile & Account</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center">
                                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold text-xl mr-6">
                                    AM
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900">Alex Mercer</h3>
                                    <p className="text-sm text-slate-500">Project Manager • Skyline Tower Ph 2</p>
                                </div>
                                <button className="ml-auto text-sm font-bold text-red-600 hover:text-red-700 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50">
                                    EDIT PROFILE
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* General Settings */}
                    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="font-bold text-slate-900">Preferences</h2>
                        </div>
                        <div className="divide-y divide-slate-100">
                            <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition">
                                <div className="flex items-center">
                                    <Bell className="text-slate-400 mr-4" size={20} />
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">Notifications</p>
                                        <p className="text-xs text-slate-500">Manage email and push alerts</p>
                                    </div>
                                </div>
                                <div className="w-10 h-6 bg-red-600 rounded-full cursor-pointer relative">
                                    <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                                </div>
                            </div>
                            <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition">
                                <div className="flex items-center">
                                    <Globe className="text-slate-400 mr-4" size={20} />
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">Language & Region</p>
                                        <p className="text-xs text-slate-500">English (US) • Timezone GMT-5</p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-slate-400">EDIT</span>
                            </div>
                            <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition">
                                <div className="flex items-center">
                                    <Database className="text-slate-400 mr-4" size={20} />
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">Offline Storage</p>
                                        <p className="text-xs text-slate-500">Cache project data for field use</p>
                                    </div>
                                </div>
                                <div className="w-10 h-6 bg-slate-200 rounded-full cursor-pointer relative">
                                    <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1"></div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
