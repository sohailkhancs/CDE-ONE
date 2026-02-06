import React, { useEffect, useState } from 'react';
import { Users, Building2, FileText, Activity } from 'lucide-react';
import { adminService, UserStats } from '../api/adminService';

const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ElementType;
    className?: string;
}> = ({ title, value, icon: Icon, className = "" }) => (
    <div className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm ${className}`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
            </div>
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600">
                <Icon size={24} />
            </div>
        </div>
    </div>
);

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await adminService.getUserStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return <div className="p-8">Loading dashboard statistics...</div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
                    <p className="text-slate-500">System overview and management</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats?.total_users || 0}
                    icon={Users}
                />
                <StatCard
                    title="Active Users"
                    value={stats?.active_users || 0}
                    icon={Activity}
                    className="border-l-4 border-l-emerald-500"
                />
                <StatCard
                    title="Inactive Users"
                    value={stats?.inactive_users || 0}
                    icon={Users}
                    className="border-l-4 border-l-slate-300"
                />
                <StatCard
                    title="Projects"
                    value="--" // TODO: Add project stats
                    icon={Building2}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Logins */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Recent User Activity</h3>
                    <div className="space-y-4">
                        {stats?.recent_logins.map((login) => (
                            <div key={login.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs">
                                        {login.name[0]}
                                    </div>
                                    <span className="font-medium text-slate-700">{login.name}</span>
                                </div>
                                <span className="text-sm text-slate-500">
                                    {new Date(login.last_login).toLocaleString()}
                                </span>
                            </div>
                        ))}
                        {(!stats?.recent_logins || stats.recent_logins.length === 0) && (
                            <p className="text-slate-500 text-center py-4">No recent activity</p>
                        )}
                    </div>
                </div>

                {/* Users by Role */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Users by Role</h3>
                    <div className="space-y-3">
                        {Object.entries(stats?.users_by_role || {}).map(([role, count]) => (
                            <div key={role} className="flex items-center justify-between">
                                <span className="text-slate-600">{role}</span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full"
                                            style={{ width: `${(count / (stats?.total_users || 1)) * 100}%` }}
                                        />
                                    </div>
                                    <span className="font-medium text-slate-800 w-8 text-right">{count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
