import React, { useState } from 'react';
import { X, Upload, Info, HelpCircle, Check, MapPin, Globe, Loader2, Image } from 'lucide-react';
import { Project, ProjectStatus, ProjectType } from '@/src/types/projects';
import DatePicker from '@/src/components/ui/DatePicker';

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (project: Partial<Project>) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        template: 'Standard Project Template',
        isActive: true,
        name: '',
        code: '',
        totalValue: '',
        startDate: '',
        completionDate: '',
        stage: 'Construction' as const,
        type: 'Commercial' as ProjectType,
        projectNumber: '',
        squareFeet: '',
        description: '',
        country: 'United States',
        timezone: '(GMT-05:00) Central Time (US & Canada)',
        address: '',
        city: '',
        state: '',
        zip: '',
        phone: '',
        region: '',
        language: 'English - US',
        isTestProject: false
    });

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggle = (name: string) => {
        setFormData(prev => ({ ...prev, [name]: !prev[name as keyof typeof prev] }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate network delay for "ultra realistic" feel
        await new Promise(resolve => setTimeout(resolve, 1500));

        const newProject: Partial<Project> = {
            name: formData.name,
            code: formData.code,
            type: formData.type,
            description: formData.description,
            status: formData.stage === 'Construction' ? 'Active' : 'Planning', // Simple mapping
            phase: formData.stage as any, // In real app, strict typing needed
            location: `${formData.city}, ${formData.state}`, // Simplified location
            client: 'New Client', // Default for now
            progress: 0,
            budget: {
                total: parseFloat(formData.totalValue.replace(/[^0-9.]/g, '')) || 0,
                spent: 0,
                currency: 'USD'
            },
            timeline: {
                start: formData.startDate,
                end: formData.completionDate,
                daysRemaining: 0 // Calculate logic here or in parent
            },
            team: {
                total: 1, // Creator
                members: []
            },
            stats: { documents: 0, rfis: 0, defects: 0, inspections: 0, tasks: { total: 0, completed: 0 } },

            // Extended fields
            projectNumber: formData.projectNumber,
            squareFeet: parseFloat(formData.squareFeet) || 0,
            template: formData.template,
            isActive: formData.isActive,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
            country: formData.country,
            timezone: formData.timezone,
            phone: formData.phone,
            region: formData.region,
            language: formData.language
        };

        onSubmit(newProject);
        setLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8 animate-in fade-in zoom-in-95 duration-200 border border-slate-200">

                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white/95 backdrop-blur-xl rounded-t-2xl sticky top-0 z-20 supports-[backdrop-filter]:bg-white/80">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Create Project</h2>
                        <p className="text-sm text-slate-500 mt-0.5 font-medium">Enter project details to initialize CDE environment</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-10 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">

                    {/* SECTION 1: PROJECT INFORMATION */}
                    <section>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-3 flex items-center">
                            <span className="bg-red-50 text-red-600 px-2 py-1 rounded mr-2">01</span> Project Information
                        </h3>

                        <div className="grid grid-cols-12 gap-8">
                            {/* Left Column (Inputs) */}
                            <div className="col-span-12 lg:col-span-8 space-y-6">

                                {/* Template & Active Toggle */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700">Template</label>
                                        <select
                                            name="template"
                                            value={formData.template}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all outline-none"
                                        >
                                            <option>Standard Project Template</option>
                                            <option>Commercial Template</option>
                                            <option>Infrastructure Template</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center space-x-3 mt-8">
                                        <button
                                            type="button"
                                            onClick={() => handleToggle('isActive')}
                                            className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${formData.isActive ? 'bg-red-600' : 'bg-slate-200'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${formData.isActive ? 'translate-x-5' : 'translate-x-1'}`} />
                                        </button>
                                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Project Active</span>
                                    </div>
                                </div>

                                {/* Name */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700">Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g. Henderson ISD - Henderson HS Aiphone"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all outline-none placeholder:text-slate-400"
                                        required
                                    />
                                </div>

                                {/* Code & Total Value */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 flex items-center group cursor-help">
                                            Code
                                            <HelpCircle size={14} className="ml-1.5 text-slate-300 group-hover:text-red-400 transition-colors" />
                                        </label>
                                        <input
                                            type="text"
                                            name="code"
                                            value={formData.code}
                                            onChange={handleChange}
                                            placeholder="Enter Project Code"
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 flex items-center group cursor-help">
                                            Total Value
                                            <HelpCircle size={14} className="ml-1.5 text-slate-300 group-hover:text-red-400 transition-colors" />
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">$</span>
                                            <input
                                                type="text"
                                                name="totalValue"
                                                value={formData.totalValue}
                                                onChange={handleChange}
                                                placeholder="0.00"
                                                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-0">
                                        <DatePicker
                                            label="Start Date"
                                            value={formData.startDate}
                                            onChange={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
                                            required
                                            placeholder="Select start date"
                                        />
                                    </div>
                                    <div className="space-y-0">
                                        <DatePicker
                                            label="Completion Date"
                                            value={formData.completionDate}
                                            onChange={(date) => setFormData(prev => ({ ...prev, completionDate: date }))}
                                            placeholder="Select completion date"
                                        />
                                    </div>
                                </div>

                                {/* Stage & Type */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700">Stage</label>
                                        <select
                                            name="stage"
                                            value={formData.stage}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all outline-none"
                                        >
                                            <option value="Course of Construction">Course of Construction</option>
                                            <option value="Design">Design</option>
                                            <option value="Tender">Tender</option>
                                            <option value="Handover">Handover</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700">Type</label>
                                        <select
                                            name="type"
                                            value={formData.type}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all outline-none"
                                        >
                                            <option value="Education">Education</option>
                                            <option value="Hospital">Hospital</option>
                                            <option value="Housing">Housing</option>
                                            <option value="Commercial">Commercial</option>
                                            <option value="Infrastructure">Infrastructure</option>
                                            <option value="Industrial">Industrial</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Project Number & Square Feet */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 flex items-center group cursor-help">
                                            Project Number
                                            <HelpCircle size={14} className="ml-1.5 text-slate-300 group-hover:text-red-400 transition-colors" />
                                        </label>
                                        <input
                                            type="text"
                                            name="projectNumber"
                                            value={formData.projectNumber}
                                            onChange={handleChange}
                                            placeholder="e.g. 2305002"
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700">Square Feet</label>
                                        <input
                                            type="number"
                                            name="squareFeet"
                                            value={formData.squareFeet}
                                            onChange={handleChange}
                                            placeholder="Enter Square Feet"
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="Brief description of the project scope..."
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all outline-none resize-y"
                                    />
                                </div>
                            </div>

                            {/* Right Column (Uploads) */}
                            <div className="col-span-12 lg:col-span-4 space-y-8">

                                {/* Logo Upload */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 flex items-center group cursor-help">
                                        Project Logo
                                        <HelpCircle size={14} className="ml-1.5 text-slate-300 group-hover:text-red-400 transition-colors" />
                                    </label>
                                    <input
                                        type="file"
                                        id="logo-upload"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setFormData(prev => ({ ...prev, logo: e.target.files![0] }));
                                            }
                                        }}
                                    />
                                    <label
                                        htmlFor="logo-upload"
                                        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer group relative overflow-hidden ${(formData as any).logo
                                            ? 'border-red-500 bg-red-50'
                                            : 'border-slate-200 bg-slate-50/50 hover:bg-red-50/50 hover:border-red-200'
                                            }`}
                                    >
                                        {(formData as any).logo ? (
                                            <>
                                                <div className="absolute inset-0 z-0 opacity-20 bg-center bg-cover" style={{ backgroundImage: `url(${URL.createObjectURL((formData as any).logo)})` }} />
                                                <div className="z-10 bg-white p-2 rounded-full shadow-sm mb-2">
                                                    <Check size={20} className="text-green-500" />
                                                </div>
                                                <span className="z-10 text-xs font-semibold text-red-700 truncate max-w-[90%]">{(formData as any).logo.name}</span>
                                                <span className="z-10 text-[10px] text-red-500 mt-1">Click to change</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform duration-300">
                                                    <Upload className="text-slate-400 group-hover:text-red-500 transition-colors" size={20} />
                                                </div>
                                                <span className="text-xs font-semibold text-slate-600 group-hover:text-red-600 transition-colors">Click to Upload Logo</span>
                                                <span className="text-[10px] text-slate-400 mt-1">or drag and drop</span>
                                            </>
                                        )}
                                    </label>
                                    <p className="text-[10px] text-slate-400 px-1">Recommended: 200x70px (Max 3MB)</p>
                                </div>

                                {/* Photo Upload */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 flex items-center group cursor-help">
                                        Cover Photo
                                        <HelpCircle size={14} className="ml-1.5 text-slate-300 group-hover:text-red-400 transition-colors" />
                                    </label>
                                    <input
                                        type="file"
                                        id="cover-upload"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setFormData(prev => ({ ...prev, coverPhoto: e.target.files![0] }));
                                            }
                                        }}
                                    />
                                    <label
                                        htmlFor="cover-upload"
                                        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer group h-48 relative overflow-hidden ${(formData as any).coverPhoto
                                            ? 'border-red-500 bg-red-50'
                                            : 'border-slate-200 bg-slate-50/50 hover:bg-red-50/50 hover:border-red-200'
                                            }`}
                                    >
                                        {(formData as any).coverPhoto ? (
                                            <>
                                                <div className="absolute inset-0 z-0 bg-center bg-cover opacity-40" style={{ backgroundImage: `url(${URL.createObjectURL((formData as any).coverPhoto)})` }} />
                                                <div className="z-10 bg-white p-3 rounded-full shadow-lg mb-2 transform group-hover:scale-110 transition-transform">
                                                    <Check size={24} className="text-green-500" />
                                                </div>
                                                <span className="z-10 text-xs font-bold text-slate-900 bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm shadow-sm truncate max-w-[90%]">{(formData as any).coverPhoto.name}</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 text-slate-400 group-hover:text-red-500 group-hover:scale-110 transition-all duration-300">
                                                    <Image size={28} />
                                                </div>
                                                <span className="text-xs font-semibold text-slate-600 group-hover:text-red-600 transition-colors">Upload Cover Photo</span>
                                                <p className="text-[10px] text-slate-400 mt-2 px-4 italic">High quality project render or site photo recommended</p>
                                            </>
                                        )}
                                    </label>
                                </div>

                            </div>
                        </div>
                    </section>

                    {/* SECTION 2: PROJECT LOCATION */}
                    <section>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-3 flex items-center">
                            <span className="bg-red-50 text-red-600 px-2 py-1 rounded mr-2">02</span> Project Location
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700">Country <span className="text-red-500">*</span></label>
                                <select
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all outline-none"
                                >
                                    <option>United States</option>
                                    <option>United Kingdom</option>
                                    <option>Canada</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700">Timezone <span className="text-red-500">*</span></label>
                                <select
                                    name="timezone"
                                    value={formData.timezone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all outline-none"
                                >
                                    <option>(GMT-05:00) Central Time (US & Canada)</option>
                                    <option>(GMT+00:00) London</option>
                                </select>
                            </div>
                            <div className="col-span-1 md:col-span-2 space-y-2">
                                <label className="text-xs font-bold text-slate-700 flex items-center group cursor-help">
                                    Address
                                    <HelpCircle size={14} className="ml-1.5 text-slate-300 group-hover:text-red-400 transition-colors" />
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Number and Street Name"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700">City <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700">State</label>
                                <select
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all outline-none"
                                >
                                    <option value="">Select State</option>
                                    <option value="Texas">Texas</option>
                                    <option value="California">California</option>
                                    <option value="New York">New York</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700">Zip / Postal Code</label>
                                <input
                                    type="text"
                                    name="zip"
                                    value={formData.zip}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700">Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="e.g. 903-555-0123"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all outline-none"
                                />
                            </div>
                        </div>
                    </section>

                    {/* SECTION 3: ADVANCED */}
                    <section>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-3 flex items-center">
                            <span className="bg-red-50 text-red-600 px-2 py-1 rounded mr-2">03</span> Advanced Settings
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700">Region</label>
                                <select
                                    name="region"
                                    value={formData.region}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all outline-none"
                                >
                                    <option value="">Select Region</option>
                                    <option value="North America">North America</option>
                                    <option value="EMEA">EMEA</option>
                                    <option value="APAC">APAC</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700">Language - Country</label>
                                <select
                                    name="language"
                                    value={formData.language}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all outline-none"
                                >
                                    <option value="English - US">English - US</option>
                                    <option value="English - UK">English - UK</option>
                                </select>
                            </div>

                            <div className="col-span-1 md:col-span-2 pt-4">
                                <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <input
                                        type="checkbox"
                                        id="isTestProject"
                                        checked={formData.isTestProject}
                                        onChange={() => handleToggle('isTestProject')}
                                        className="h-5 w-5 rounded border-slate-300 text-red-600 focus:ring-red-500 transition-all cursor-pointer"
                                    />
                                    <label htmlFor="isTestProject" className="text-sm font-medium text-slate-700 flex items-center cursor-pointer select-none">
                                        Mark as Test Project
                                        <HelpCircle size={14} className="ml-2 text-slate-400" />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="pt-6 border-t border-slate-200 flex items-center justify-between sticky bottom-0 bg-white z-10 pb-2">
                        <span className="text-xs text-red-500 font-medium">* Required fields</span>
                        <div className="flex items-center space-x-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 text-slate-600 font-bold rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-900/20 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center text-sm disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loading && <Loader2 size={16} className="animate-spin mr-2" />}
                                Create Project
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProjectModal;
