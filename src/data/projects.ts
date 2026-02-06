/**
 * Dummy Project Data for CDE-ONE
 * Professional construction projects similar to Procore/Dalux
 */

import type { Project } from '../types/projects';

export const PROJECTS: Project[] = [
  {
    id: 'proj-001',
    code: 'HOSP-2024-01',
    name: 'City General Hospital Extension',
    type: 'Hospital',
    description: 'Extension of existing 500-bed hospital with new wing, operating theaters, and ICU facilities.',
    location: 'Manchester, UK',
    client: 'NHS Trust',
    status: 'Active',
    phase: 'Construction',
    progress: 68,
    budget: {
      total: 85000000,
      spent: 57800000,
      currency: 'GBP'
    },
    timeline: {
      start: '2023-06-01',
      end: '2025-12-31',
      daysRemaining: 602
    },
    team: {
      total: 24,
      members: [
        { id: 'u1', name: 'Sarah Chen', role: 'Project Director', avatar: 'SC', email: 'sarah.chen@hospital.com' },
        { id: 'u2', name: 'James Wilson', role: 'Lead Architect', avatar: 'JW', email: 'j.wilson@architects.com' },
        { id: 'u3', name: 'Maria Garcia', role: 'MEP Lead', avatar: 'MG', email: 'maria.g@mep.com' }
      ]
    },
    stats: {
      documents: 1247,
      rfis: 89,
      defects: 34,
      inspections: 156,
      tasks: { total: 342, completed: 233 }
    },
    // Extended Details
    projectNumber: '2401-CGH',
    squareFeet: 125000,
    template: 'Hospital Template',
    isActive: true,
    address: '123 Oxford Road',
    city: 'Manchester',
    state: '',
    zip: 'M13 9WL',
    country: 'United Kingdom',
    timezone: '(GMT+00:00) London',
    phone: '+44 161 276 1234',
    region: 'EMEA',
    language: 'English - UK'
  },
  {
    id: 'proj-002',
    code: 'HS-2024-03',
    name: 'Riverside Residential Scheme',
    type: 'Housing',
    description: 'Mixed-use development comprising 320 residential units across 4 blocks with retail and amenity spaces.',
    location: 'London Docklands, UK',
    client: 'Horizon Homes PLC',
    status: 'Active',
    phase: 'Construction',
    progress: 42,
    budget: {
      total: 45000000,
      spent: 18900000,
      currency: 'GBP'
    },
    timeline: {
      start: '2024-01-15',
      end: '2026-03-31',
      daysRemaining: 785
    },
    team: {
      total: 18,
      members: [
        { id: 'u4', name: 'David Kim', role: 'Project Manager', avatar: 'DK', email: 'd.kim@horizon.com' },
        { id: 'u5', name: 'Emma Thompson', role: 'Design Lead', avatar: 'ET', email: 'emma.t@design.co.uk' }
      ]
    },
    stats: {
      documents: 892,
      rfis: 45,
      defects: 67,
      inspections: 89,
      tasks: { total: 256, completed: 108 }
    }
  },
  {
    id: 'proj-003',
    code: 'COM-2023-12',
    name: 'Meridian Commercial Tower',
    type: 'Commercial',
    description: '42-story Grade A office tower in city centre with LEED Platinum certification target.',
    location: 'Birmingham, UK',
    client: 'Meridian Properties',
    status: 'Active',
    phase: 'Construction',
    progress: 85,
    budget: {
      total: 120000000,
      spent: 102000000,
      currency: 'GBP'
    },
    timeline: {
      start: '2023-03-01',
      end: '2025-08-31',
      daysRemaining: 410
    },
    team: {
      total: 32,
      members: [
        { id: 'u6', name: 'Robert Fox', role: 'Senior PM', avatar: 'RF', email: 'r.fox@meridian.com' },
        { id: 'u7', name: 'Lisa Anderson', role: 'Structural Engineer', avatar: 'LA', email: 'lisa.a@structural.com' }
      ]
    },
    stats: {
      documents: 2134,
      rfis: 156,
      defects: 23,
      inspections: 198,
      tasks: { total: 489, completed: 415 }
    }
  },
  {
    id: 'proj-004',
    code: 'INF-2024-02',
    name: 'A1-M1 Link Road Improvement',
    type: 'Infrastructure',
    description: 'Highway improvement scheme including new junction, bridge widening, and smart traffic systems.',
    location: 'Hertfordshire, UK',
    client: 'National Highways',
    status: 'Active',
    phase: 'Construction',
    progress: 55,
    budget: {
      total: 68000000,
      spent: 37400000,
      currency: 'GBP'
    },
    timeline: {
      start: '2023-09-01',
      end: '2025-05-31',
      daysRemaining: 453
    },
    team: {
      total: 28,
      members: [
        { id: 'u8', name: 'Ahmed Hassan', role: 'Project Director', avatar: 'AH', email: 'a.hassan@highways.gov.uk' },
        { id: 'u9', name: 'Peter Brown', role: 'Civil Engineer', avatar: 'PB', email: 'p.brown@civil.co.uk' }
      ]
    },
    stats: {
      documents: 1567,
      rfis: 203,
      defects: 45,
      inspections: 267,
      tasks: { total: 678, completed: 373 }
    }
  },
  {
    id: 'proj-005',
    code: 'EDU-2024-01',
    name: 'Greenfield Academy Campus',
    type: 'Education',
    description: 'New secondary school with sports facilities, science block, and performing arts centre.',
    location: 'Essex, UK',
    client: 'Local Education Authority',
    status: 'Planning',
    phase: 'Design',
    progress: 15,
    budget: {
      total: 35000000,
      spent: 5250000,
      currency: 'GBP'
    },
    timeline: {
      start: '2024-06-01',
      end: '2026-01-31',
      daysRemaining: 698
    },
    team: {
      total: 12,
      members: [
        { id: 'u10', name: 'Carol White', role: 'Design Lead', avatar: 'CW', email: 'c.white@design.co.uk' }
      ]
    },
    stats: {
      documents: 234,
      rfis: 12,
      defects: 0,
      inspections: 0,
      tasks: { total: 89, completed: 13 }
    }
  },
  {
    id: 'proj-006',
    code: 'IND-2023-08',
    name: 'Logistics Distribution Centre',
    type: 'Industrial',
    description: 'Automated warehouse and distribution hub with solar panels and EV charging infrastructure.',
    location: 'Northampton, UK',
    client: 'LogiCorp Ltd',
    status: 'Completed',
    phase: 'Handover',
    progress: 100,
    budget: {
      total: 28000000,
      spent: 27500000,
      currency: 'GBP'
    },
    timeline: {
      start: '2023-01-01',
      end: '2024-09-30',
      daysRemaining: 0
    },
    team: {
      total: 15,
      members: [
        { id: 'u11', name: 'Tom Richards', role: 'Project Manager', avatar: 'TR', email: 'tom.r@logicorp.com' }
      ]
    },
    stats: {
      documents: 1876,
      rfis: 67,
      defects: 8,
      inspections: 145,
      tasks: { total: 234, completed: 234 }
    }
  },
  {
    id: 'proj-007',
    code: 'HS-2023-11',
    name: 'Harbour View Apartments',
    type: 'Housing',
    description: 'Luxury waterfront apartments with communal gardens, gym, and concierge service.',
    location: 'Southampton, UK',
    client: 'Marine Developments',
    status: 'Active',
    phase: 'Construction',
    progress: 78,
    budget: {
      total: 32000000,
      spent: 24960000,
      currency: 'GBP'
    },
    timeline: {
      start: '2023-11-01',
      end: '2025-06-30',
      daysRemaining: 513
    },
    team: {
      total: 14,
      members: [
        { id: 'u12', name: 'Nina Patel', role: 'Project Manager', avatar: 'NP', email: 'nina.p@marine.com' }
      ]
    },
    stats: {
      documents: 645,
      rfis: 38,
      defects: 19,
      inspections: 67,
      tasks: { total: 167, completed: 130 }
    }
  },
  {
    id: 'proj-008',
    code: 'HOSP-2023-09',
    name: 'Children\'s Specialist Hospital',
    type: 'Hospital',
    description: 'Specialist pediatric hospital with healing gardens and family accommodation facilities.',
    location: 'Bristol, UK',
    client: 'Specialist Health Trust',
    status: 'Active',
    phase: 'Construction',
    progress: 35,
    budget: {
      total: 67000000,
      spent: 23450000,
      currency: 'GBP'
    },
    timeline: {
      start: '2024-02-01',
      end: '2026-08-31',
      daysRemaining: 910
    },
    team: {
      total: 22,
      members: [
        { id: 'u13', name: 'Michael Scott', role: 'Project Director', avatar: 'MS', email: 'm.scott@healthtrust.nhs.uk' }
      ]
    },
    stats: {
      documents: 1089,
      rfis: 94,
      defects: 28,
      inspections: 112,
      tasks: { total: 423, completed: 148 }
    }
  }
];

export const PROJECT_TYPE_INFO = {
  Hospital: {
    icon: '🏥',
    color: 'bg-red-100 text-red-700 border-red-200',
    gradient: 'from-red-500 to-rose-600',
    description: 'Healthcare Facilities'
  },
  Housing: {
    icon: '🏠',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    gradient: 'from-blue-500 to-cyan-600',
    description: 'Residential Developments'
  },
  Commercial: {
    icon: '🏢',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    gradient: 'from-purple-500 to-violet-600',
    description: 'Commercial Buildings'
  },
  Infrastructure: {
    icon: '🛣️',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    gradient: 'from-emerald-500 to-teal-600',
    description: 'Infrastructure Projects'
  },
  Industrial: {
    icon: '🏭',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    gradient: 'from-amber-500 to-orange-600',
    description: 'Industrial Facilities'
  },
  Education: {
    icon: '🎓',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    gradient: 'from-indigo-500 to-blue-600',
    description: 'Educational Facilities'
  }
};

export const PROJECT_STATUS_INFO = {
  Planning: {
    label: 'Planning',
    color: 'bg-slate-100 text-slate-700',
    dot: 'bg-slate-400'
  },
  Active: {
    label: 'Active',
    color: 'bg-green-100 text-green-700',
    dot: 'bg-green-500'
  },
  'On Hold': {
    label: 'On Hold',
    color: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-500'
  },
  Completed: {
    label: 'Completed',
    color: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-500'
  },
  Archived: {
    label: 'Archived',
    color: 'bg-slate-100 text-slate-500',
    dot: 'bg-slate-400'
  }
};

export const PROJECT_PHASE_INFO = {
  Design: { step: 1, color: 'bg-purple-500' },
  Tender: { step: 2, color: 'bg-blue-500' },
  Construction: { step: 3, color: 'bg-amber-500' },
  Commissioning: { step: 4, color: 'bg-green-500' },
  Handover: { step: 5, color: 'bg-slate-500' }
};
