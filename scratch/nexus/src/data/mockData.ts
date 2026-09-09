import { 
  Entity, 
  Case, 
  Evidence, 
  NetworkGraphData, 
  ThreatAlert, 
  MetricData,
  CrimePattern,
  TimelineEvent
} from '../types'

// 4 Dashboard Core Metrics
export const mockMetrics: MetricData[] = [
  {
    id: 'm-1',
    title: 'Tracked Persons',
    value: '12 Persons',
    change: '5 High-Value Targets',
    trend: 'neutral',
    threat: 'critical',
    subtext: 'Primary syndicate syndicate members',
    sparkline: [8, 9, 10, 11, 12, 12, 12]
  },
  {
    id: 'm-2',
    title: 'Monitored Locations',
    value: '8 Locations',
    change: 'NCR & UP Corridors',
    trend: 'neutral',
    threat: 'high',
    subtext: 'Delhi, Ghaziabad, Lucknow, Mirzapur, Noida, etc.',
    sparkline: [4, 5, 6, 7, 7, 8, 8]
  },
  {
    id: 'm-3',
    title: 'Identified Connections',
    value: '15 Relationships',
    change: 'Hawala & Telecom Wires',
    trend: 'up',
    threat: 'high',
    subtext: 'Direct calls, transfers & vehicle registry',
    sparkline: [8, 10, 12, 13, 14, 15, 15]
  },
  {
    id: 'm-4',
    title: 'AI Detected Modus',
    value: '3 Possible Patterns',
    change: 'High Confidence Match',
    trend: 'up',
    threat: 'critical',
    subtext: 'Hawala Loop, FASTag Transit, Call Burst',
    sparkline: [1, 1, 2, 2, 3, 3, 3]
  }
]

// 3 Possible Patterns
export const mockCrimePatterns: CrimePattern[] = [
  {
    id: 'pat-1',
    title: 'Hawala Fund Layering Loop',
    category: 'Hawala Loop',
    description: 'Circular transfer of ₹12,50,000 originating from a Chandni Chowk bullion trader, routed through Amit Yadav in Ghaziabad, and deposited into Priya Singh shell accounts in Lucknow within 4 hours.',
    confidence: 94,
    involvedEntities: ['Rahul Verma', 'Amit Yadav', 'Priya Singh'],
    locations: ['Delhi (Chandni Chowk)', 'Ghaziabad (Indirapuram)', 'Lucknow (Hazratganj)'],
    keyMetric: '₹12,50,000 in 3 sub-transfers',
    severity: 'CRITICAL'
  },
  {
    id: 'pat-2',
    title: 'FASTag Coordinated Highway Transit',
    category: 'FASTag Transit',
    description: 'Mahindra Scorpio (UP14 AB 1234) detected crossing Jewar Toll Plaza on Yamuna Expressway followed 18 minutes later by Toyota Fortuner (DL01 CA 9988), matching CDR tower handover logs to Lucknow.',
    confidence: 89,
    involvedEntities: ['Rahul Verma', 'Suresh Sharma', 'Mahindra Scorpio (UP14 AB 1234)'],
    locations: ['Noida Sector 62', 'Jewar Toll Plaza', 'Lucknow Outer Ring Road'],
    keyMetric: '2 vehicles, 18-min gap',
    severity: 'HIGH'
  },
  {
    id: 'pat-3',
    title: 'Clustered Burner SIM Call Burst',
    category: 'SIM Call Burst',
    description: 'A cluster of 48 encrypted short-burst calls between masked numbers +91 98XXXXXX21 and +91 97XXXXXX45 logged exclusively between 01:00 AM and 03:30 AM across Mirzapur and Ghaziabad cell towers.',
    confidence: 92,
    involvedEntities: ['Amit Yadav', 'Neha Gupta'],
    locations: ['Ghaziabad (Sahibabad)', 'Mirzapur (Vindhyachal Corridor)'],
    keyMetric: '48 calls in 72 hours',
    severity: 'HIGH'
  }
]

// 12 Persons
export const mockEntities: Entity[] = [
  {
    id: 'ent-1',
    name: 'Rahul Verma',
    type: 'suspect',
    riskScore: 94,
    riskLevel: 'CRITICAL',
    status: 'Active Warrant',
    aliases: ['RV', 'Bhaiya Ji', 'R. K. Verma'],
    primaryAffiliation: 'Verma Crime Syndicate',
    role: 'Syndicate Kingpin & Mastermind',
    phoneMasked: '+91 98XXXXXX21',
    vehicleNumber: 'DL01 CA 9988',
    city: 'Delhi',
    nationality: 'Indian',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
    lastKnownLocation: {
      name: 'Connaught Place, Outer Circle',
      city: 'Delhi',
      lat: 28.6315,
      lng: 77.2167,
      timestamp: '2026-09-07T21:40:00Z'
    },
    tags: ['Key Accused', 'Hawala Mastermind', 'NBW Issued'],
    details: {
      dob: '1982-08-14',
      pob: 'Delhi',
      wantedFor: [
        'Organized Extortion & Syndicate Operations (IPC 384/120B)',
        'Illegal Money Transmission & Hawala (PMLA Sec 3/4)',
        'Arms Possession'
      ],
      knownAssociatesCount: 6,
      totalFinancialFlow: '₹48,50,000',
      wiretapsCount: 18
    }
  },
  {
    id: 'ent-2',
    name: 'Amit Yadav',
    type: 'suspect',
    riskScore: 89,
    riskLevel: 'CRITICAL',
    status: 'Under Surveillance',
    aliases: ['Yadav Ji', 'Munna', 'A. K. Yadav'],
    primaryAffiliation: 'Verma Crime Syndicate',
    role: 'Chief Hawala Operator & Cash Handler',
    phoneMasked: '+91 97XXXXXX45',
    vehicleNumber: 'UP14 AB 1234',
    city: 'Ghaziabad',
    nationality: 'Indian',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    lastKnownLocation: {
      name: 'Indirapuram Habitat Center',
      city: 'Ghaziabad',
      lat: 28.6415,
      lng: 77.3714,
      timestamp: '2026-09-07T22:15:00Z'
    },
    tags: ['Hawala Operator', 'Courier Handler', 'Under Watch'],
    details: {
      dob: '1987-03-22',
      pob: 'Ghaziabad, UP',
      wantedFor: ['Hawala Transactions', 'Cash Smuggling'],
      knownAssociatesCount: 5,
      totalFinancialFlow: '₹34,00,000',
      wiretapsCount: 14
    }
  },
  {
    id: 'ent-3',
    name: 'Priya Singh',
    type: 'suspect',
    riskScore: 86,
    riskLevel: 'HIGH',
    status: 'Flagged Entity',
    aliases: ['P. Singh', 'Madam', 'Pooja Roy'],
    primaryAffiliation: 'Apex Trans Logistics Pvt Ltd (Shell)',
    role: 'Shell Company Director & Account Controller',
    phoneMasked: '+91 99XXXXXX88',
    vehicleNumber: 'UP16 ZQ 8821',
    city: 'Noida',
    nationality: 'Indian',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    lastKnownLocation: {
      name: 'Sector 62 IT Park',
      city: 'Noida',
      lat: 28.6280,
      lng: 77.3649,
      timestamp: '2026-09-07T18:30:00Z'
    },
    tags: ['Shell Entity Director', 'Bank Accounts Manager'],
    details: {
      dob: '1990-11-05',
      pob: 'Lucknow, UP',
      wantedFor: ['Corporate Fraud (Sec 420)', 'Money Laundering'],
      knownAssociatesCount: 4,
      totalFinancialFlow: '₹28,50,000',
      wiretapsCount: 8
    }
  },
  {
    id: 'ent-4',
    name: 'Suresh Sharma',
    type: 'suspect',
    riskScore: 82,
    riskLevel: 'HIGH',
    status: 'Under Surveillance',
    aliases: ['Pandit Ji', 'Sharma Transporter'],
    primaryAffiliation: 'Verma Crime Syndicate',
    role: 'Logistics, Fleets & Transport Coordinator',
    phoneMasked: '+91 88XXXXXX12',
    vehicleNumber: 'UP32 XY 5521',
    city: 'Lucknow',
    nationality: 'Indian',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    lastKnownLocation: {
      name: 'Hazratganj Main Market',
      city: 'Lucknow',
      lat: 26.8467,
      lng: 80.9462,
      timestamp: '2026-09-07T14:10:00Z'
    },
    tags: ['Fleet Operator', 'Route Specialist'],
    details: {
      dob: '1979-06-18',
      pob: 'Kanpur, UP',
      wantedFor: ['Conspiracy', 'Transporting Contraband'],
      knownAssociatesCount: 4,
      totalFinancialFlow: '₹16,20,000',
      wiretapsCount: 9
    }
  },
  {
    id: 'ent-5',
    name: 'Neha Gupta',
    type: 'suspect',
    riskScore: 78,
    riskLevel: 'HIGH',
    status: 'Monitored',
    aliases: ['Cyber Neha', 'N. Gupta'],
    primaryAffiliation: 'Mirzapur Comm Network',
    role: 'SIM Card Provider & Digital Relay Operator',
    phoneMasked: '+91 96XXXXXX33',
    city: 'Mirzapur',
    nationality: 'Indian',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    lastKnownLocation: {
      name: 'Vindhyachal Station Road',
      city: 'Mirzapur',
      lat: 25.1337,
      lng: 82.5644,
      timestamp: '2026-09-07T11:05:00Z'
    },
    tags: ['SIM Mule', 'VoIP Relays'],
    details: {
      dob: '1995-04-12',
      pob: 'Mirzapur, UP',
      wantedFor: ['Fraudulent SIM Issuance (IT Act 66D)'],
      knownAssociatesCount: 3,
      totalFinancialFlow: '₹4,80,000',
      wiretapsCount: 12
    }
  },
  {
    id: 'ent-6',
    name: 'Vikram Malhotra',
    type: 'suspect',
    riskScore: 74,
    riskLevel: 'ELEVATED',
    status: 'Monitored',
    aliases: ['Vicky', 'Malhotra Ji'],
    primaryAffiliation: 'Western UP Logistics',
    role: 'Highway Transport Facilitator',
    phoneMasked: '+91 95XXXXXX77',
    vehicleNumber: 'UP15 CX 9901',
    city: 'Meerut',
    nationality: 'Indian',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    lastKnownLocation: {
      name: 'Partapur Bypass',
      city: 'Meerut',
      lat: 28.9845,
      lng: 77.7064,
      timestamp: '2026-09-06T19:20:00Z'
    },
    tags: ['Transit Facilitator'],
    details: {
      knownAssociatesCount: 2,
      totalFinancialFlow: '₹8,50,000',
      wiretapsCount: 3
    }
  },
  {
    id: 'ent-7',
    name: 'Anil Kumar',
    type: 'suspect',
    riskScore: 71,
    riskLevel: 'ELEVATED',
    status: 'Under Surveillance',
    aliases: ['Chhotu', 'Anil Kanpuria'],
    primaryAffiliation: 'Amit Yadav Network',
    role: 'Physical Cash & Hawala Courier',
    phoneMasked: '+91 94XXXXXX19',
    city: 'Kanpur',
    nationality: 'Indian',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    lastKnownLocation: {
      name: 'Civil Lines Railway Gate',
      city: 'Kanpur',
      lat: 26.4499,
      lng: 80.3319,
      timestamp: '2026-09-06T16:45:00Z'
    },
    tags: ['Cash Courier', 'Baggage Mule'],
    details: {
      knownAssociatesCount: 2,
      totalFinancialFlow: '₹14,00,000',
      wiretapsCount: 4
    }
  },
  {
    id: 'ent-8',
    name: 'Ravi Teja',
    type: 'suspect',
    riskScore: 68,
    riskLevel: 'ELEVATED',
    status: 'Monitored',
    aliases: ['Ravi Printer', 'Doc King'],
    primaryAffiliation: 'Fake Document Syndicate',
    role: 'Fake Aadhaar & KYC Forger',
    phoneMasked: '+91 93XXXXXX55',
    city: 'Delhi',
    nationality: 'Indian',
    photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80',
    lastKnownLocation: {
      name: 'Karol Bagh Market',
      city: 'Delhi',
      lat: 28.6517,
      lng: 77.1906,
      timestamp: '2026-09-05T20:10:00Z'
    },
    tags: ['Forgery', 'KYC Provider'],
    details: {
      knownAssociatesCount: 3,
      totalFinancialFlow: '₹3,20,000',
      wiretapsCount: 2
    }
  },
  {
    id: 'ent-9',
    name: 'Sunil Rathore',
    type: 'suspect',
    riskScore: 65,
    riskLevel: 'LOW',
    status: 'Monitored',
    aliases: ['Rathore Caretaker'],
    primaryAffiliation: 'Verma Crime Syndicate',
    role: 'Safehouse & Arms Stash Caretaker',
    phoneMasked: '+91 92XXXXXX81',
    city: 'Varanasi',
    nationality: 'Indian',
    photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80',
    lastKnownLocation: {
      name: 'Cantt Railway Colony',
      city: 'Varanasi',
      lat: 25.3176,
      lng: 82.9739,
      timestamp: '2026-09-05T15:30:00Z'
    },
    tags: ['Safehouse Keeper'],
    details: {
      knownAssociatesCount: 2,
      totalFinancialFlow: '₹1,50,000',
      wiretapsCount: 1
    }
  },
  {
    id: 'ent-10',
    name: 'Pooja Deshmukh',
    type: 'suspect',
    riskScore: 63,
    riskLevel: 'LOW',
    status: 'Flagged Entity',
    aliases: ['Pooja CA'],
    primaryAffiliation: 'Apex Trans Logistics Pvt Ltd (Shell)',
    role: 'Junior Accountant & GST Filer',
    phoneMasked: '+91 91XXXXXX04',
    city: 'Noida',
    nationality: 'Indian',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    lastKnownLocation: {
      name: 'Sector 18 Commercial Hub',
      city: 'Noida',
      lat: 28.5708,
      lng: 77.3261,
      timestamp: '2026-09-04T12:00:00Z'
    },
    tags: ['Accountant', 'GST Shells'],
    details: {
      knownAssociatesCount: 2,
      totalFinancialFlow: '₹6,40,000',
      wiretapsCount: 2
    }
  },
  {
    id: 'ent-11',
    name: 'Deepak Mishra',
    type: 'suspect',
    riskScore: 61,
    riskLevel: 'LOW',
    status: 'Under Surveillance',
    aliases: ['Deepu'],
    primaryAffiliation: 'Amit Yadav Network',
    role: 'Field Runner & Lookout',
    phoneMasked: '+91 90XXXXXX62',
    city: 'Ghaziabad',
    nationality: 'Indian',
    photo: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300&auto=format&fit=crop&q=80',
    lastKnownLocation: {
      name: 'Sahibabad Industrial Area',
      city: 'Ghaziabad',
      lat: 28.6653,
      lng: 77.3524,
      timestamp: '2026-09-04T17:15:00Z'
    },
    tags: ['Runner'],
    details: {
      knownAssociatesCount: 2,
      totalFinancialFlow: '₹2,10,000',
      wiretapsCount: 1
    }
  },
  {
    id: 'ent-12',
    name: 'Rajesh Tiwari',
    type: 'suspect',
    riskScore: 59,
    riskLevel: 'LOW',
    status: 'Monitored',
    aliases: ['Tiwari Builder'],
    primaryAffiliation: 'Tiwari Infra Properties',
    role: 'Real Estate Cash Laundering Front',
    phoneMasked: '+91 89XXXXXX90',
    city: 'Lucknow',
    nationality: 'Indian',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&auto=format&fit=crop&q=80',
    lastKnownLocation: {
      name: 'Gomti Nagar Extension',
      city: 'Lucknow',
      lat: 26.8500,
      lng: 80.9990,
      timestamp: '2026-09-03T14:40:00Z'
    },
    tags: ['Real Estate Front'],
    details: {
      knownAssociatesCount: 2,
      totalFinancialFlow: '₹18,00,000',
      wiretapsCount: 2
    }
  }
]

// 8 Monitored Locations
export const mockLocations = [
  { id: 'loc-1', name: 'Delhi (Connaught Place & Karol Bagh)', state: 'Delhi', activePersons: 2, risk: 'CRITICAL' },
  { id: 'loc-2', name: 'Ghaziabad (Indirapuram & Sahibabad)', state: 'Uttar Pradesh', activePersons: 2, risk: 'CRITICAL' },
  { id: 'loc-3', name: 'Lucknow (Hazratganj & Gomti Nagar)', state: 'Uttar Pradesh', activePersons: 2, risk: 'HIGH' },
  { id: 'loc-4', name: 'Mirzapur (Vindhyachal Corridor)', state: 'Uttar Pradesh', activePersons: 1, risk: 'HIGH' },
  { id: 'loc-5', name: 'Noida (Sector 62 & Sector 18)', state: 'Uttar Pradesh', activePersons: 2, risk: 'HIGH' },
  { id: 'loc-6', name: 'Kanpur (Civil Lines)', state: 'Uttar Pradesh', activePersons: 1, risk: 'ELEVATED' },
  { id: 'loc-7', name: 'Varanasi (Cantt Area)', state: 'Uttar Pradesh', activePersons: 1, risk: 'ELEVATED' },
  { id: 'loc-8', name: 'Meerut (Partapur Bypass)', state: 'Uttar Pradesh', activePersons: 1, risk: 'ELEVATED' }
]

// Simplified Network Graph: 7-8 Core Entities presentation-ready for SIH
export const mockNetworkGraph: NetworkGraphData = {
  nodes: [
    // 7 Core Entities (Prominent, easy to understand)
    { id: 'ent-1', label: 'Rahul Verma (Kingpin)', type: 'suspect', riskScore: 94, degree: 5, cluster: 'Command', status: 'Active Warrant', isHVT: true, isCore: true, city: 'Delhi', phoneMasked: '+91 98XXXXXX21', x: 380, y: 220 },
    { id: 'ent-2', label: 'Amit Yadav (Hawala)', type: 'suspect', riskScore: 89, degree: 4, cluster: 'Finance', status: 'Surveillance', isHVT: true, isCore: true, city: 'Ghaziabad', phoneMasked: '+91 97XXXXXX45', x: 200, y: 150 },
    { id: 'ent-3', label: 'Priya Singh (Shell Firm)', type: 'suspect', riskScore: 86, degree: 3, cluster: 'Corporate', status: 'Flagged', isHVT: true, isCore: true, city: 'Noida', phoneMasked: '+91 99XXXXXX88', x: 540, y: 140 },
    { id: 'ent-4', label: 'Suresh Sharma (Logistics)', type: 'suspect', riskScore: 82, degree: 3, cluster: 'Transport', status: 'Surveillance', isHVT: false, isCore: true, city: 'Lucknow', phoneMasked: '+91 88XXXXXX12', x: 500, y: 340 },
    { id: 'ent-5', label: 'Neha Gupta (SIM Mule)', type: 'suspect', riskScore: 78, degree: 2, cluster: 'Comms', status: 'Monitored', isHVT: false, isCore: true, city: 'Mirzapur', phoneMasked: '+91 96XXXXXX33', x: 220, y: 330 },
    { id: 'ent-v1', label: 'Scorpio (UP14 AB 1234)', type: 'vehicle', riskScore: 85, degree: 2, cluster: 'Transport', status: 'Tracked', isHVT: false, isCore: true, vehicleNumber: 'UP14 AB 1234', x: 340, y: 380 },
    { id: 'ent-b1', label: 'Canara Bank Hawala Acct', type: 'bank_account', riskScore: 90, degree: 2, cluster: 'Finance', status: 'Flagged', isHVT: false, isCore: true, city: 'Lucknow', x: 120, y: 240 },
    
    // Additional peripheral nodes that can be toggled
    { id: 'ent-6', label: 'Vikram Malhotra (Meerut)', type: 'suspect', riskScore: 74, degree: 1, cluster: 'Transport', status: 'Monitored', isHVT: false, isCore: false, city: 'Meerut', x: 620, y: 270 },
    { id: 'ent-7', label: 'Anil Kumar (Courier)', type: 'suspect', riskScore: 71, degree: 1, cluster: 'Finance', status: 'Surveillance', isHVT: false, isCore: false, city: 'Kanpur', x: 120, y: 100 }
  ],
  // 15 Relationships exactly
  edges: [
    { id: 'e-1', source: 'ent-1', target: 'ent-2', relationship: 'hawala_transfer', label: 'Hawala Transfer ₹12.5L', amountINR: '₹12,50,000', isSuspicious: true, weight: 9 },
    { id: 'e-2', source: 'ent-1', target: 'ent-3', relationship: 'director', label: 'Beneficial Owner (Apex Trans)', isSuspicious: true, weight: 8 },
    { id: 'e-3', source: 'ent-1', target: 'ent-4', relationship: 'known_associate', label: 'Convoy Transport Orders', isSuspicious: true, weight: 7 },
    { id: 'e-4', source: 'ent-2', target: 'ent-b1', relationship: 'hawala_transfer', label: 'Cash Deposit ₹5.2L', amountINR: '₹5,20,000', isSuspicious: true, weight: 9 },
    { id: 'e-5', source: 'ent-3', target: 'ent-b1', relationship: 'hawala_transfer', label: 'Shell Account Outflow ₹7.3L', amountINR: '₹7,30,000', isSuspicious: true, weight: 8 },
    { id: 'e-6', source: 'ent-2', target: 'ent-v1', relationship: 'vehicle_registered', label: 'Registered Vehicle Owner', isSuspicious: false, weight: 6 },
    { id: 'e-7', source: 'ent-4', target: 'ent-v1', relationship: 'courier', label: 'Driver on Agra Expressway', isSuspicious: true, weight: 7 },
    { id: 'e-8', source: 'ent-2', target: 'ent-5', relationship: 'phone_call', label: '48 Call Bursts (Midnight)', frequency: 48, isSuspicious: true, weight: 8 },
    { id: 'e-9', source: 'ent-1', target: 'ent-5', relationship: 'phone_call', label: 'Burner SIM Issued', isSuspicious: true, weight: 6 },
    { id: 'e-10', source: 'ent-4', target: 'ent-6', relationship: 'known_associate', label: 'Meerut Highway Handover', isSuspicious: true, weight: 5 },
    { id: 'e-11', source: 'ent-2', target: 'ent-7', relationship: 'courier', label: 'Cash Delivery to Kanpur', amountINR: '₹4,50,000', isSuspicious: true, weight: 7 },
    { id: 'e-12', source: 'ent-3', target: 'ent-4', relationship: 'known_associate', label: 'Logistics Invoice Clearance', isSuspicious: false, weight: 5 },
    { id: 'e-13', source: 'ent-1', target: 'ent-b1', relationship: 'hawala_transfer', label: 'Direct Unofficial Settlement', amountINR: '₹15,00,000', isSuspicious: true, weight: 9 },
    { id: 'e-14', source: 'ent-5', target: 'ent-7', relationship: 'phone_call', label: 'Coordination Pings (12)', frequency: 12, isSuspicious: false, weight: 4 },
    { id: 'e-15', source: 'ent-6', target: 'ent-v1', relationship: 'courier', label: 'FASTag Toll Relay at Jewar', isSuspicious: true, weight: 6 }
  ]
}

// Indian Law Enforcement Evidence Files
export const mockEvidence: Evidence[] = [
  {
    id: 'ev-1',
    evidenceNumber: 'EV-2026-CDR-01',
    caseId: 'case-sih-01',
    caseName: 'Operation Chakravyuh',
    title: 'CDR Tower Pings - 98XXXXXX21 to 97XXXXXX45 (Indirapuram Sector)',
    type: 'cdr',
    classification: 'LAW ENFORCEMENT SENSITIVE',
    dateCollected: '2026-09-07 22:30 IST',
    collectedBy: 'Sub-Inspector R. K. Sharma',
    badgeNumber: 'DL-SPL-4412',
    location: 'Indirapuram Cell Node 04, Ghaziabad',
    city: 'Ghaziabad',
    hashSHA256: '8f72ac038b55e1b12d5929656209ef5a84ee66b4f74d081bc55c8297b4831201',
    aiSummary: 'Analysis reveals 48 short-duration VoLTE calls logged between midnight and 03:30 AM. Call endpoints corroborate physical movement from Connaught Place (Delhi) to Indirapuram (Ghaziabad).',
    aiExtractionTags: ['48 Calls Logged', 'Rahul Verma & Amit Yadav', 'Late Night Activity', 'Tower Handover'],
    linkedEntityIds: ['ent-1', 'ent-2', 'ent-5'],
    phoneRef: '+91 98XXXXXX21',
    fileDetails: {
      filename: 'CDR_DELHI_GZBD_07092026.xlsx',
      size: '2.4 MB',
      format: 'Telecom Excel Sheet'
    }
  },
  {
    id: 'ev-2',
    evidenceNumber: 'EV-2026-FASTAG-02',
    caseId: 'case-sih-01',
    caseName: 'Operation Chakravyuh',
    title: 'FASTag Toll Log - Mahindra Scorpio (UP14 AB 1234) Yamuna Expressway',
    type: 'surveillance',
    classification: 'LAW ENFORCEMENT SENSITIVE',
    dateCollected: '2026-09-07 19:15 IST',
    collectedBy: 'Inspector Rajesh Malik',
    badgeNumber: 'UP-STF-9910',
    location: 'Jewar Toll Plaza, Yamuna Expressway',
    city: 'Noida',
    hashSHA256: '3e4c022f46e896472d0012d98f7e6f8b1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e',
    aiSummary: 'ANPR camera capture of Scorpio UP14 AB 1234 heading towards Lucknow at 112 km/h. Driver identified as associate of Suresh Sharma. Vehicle registered under Amit Yadav.',
    aiExtractionTags: ['UP14 AB 1234', 'Jewar Toll Plaza', 'Yamuna Expressway', 'Suresh Sharma'],
    linkedEntityIds: ['ent-2', 'ent-4'],
    vehicleRef: 'UP14 AB 1234',
    fileDetails: {
      filename: 'FASTAG_JEWAR_TOLL_CAM02.jpg',
      size: '4.8 MB',
      format: 'ANPR High-Res JPEG'
    }
  },
  {
    id: 'ev-3',
    evidenceNumber: 'EV-2026-BANK-03',
    caseId: 'case-sih-01',
    caseName: 'Operation Chakravyuh',
    title: 'Canara Bank Statement - Account #0492 Hazraganj Branch',
    type: 'financial',
    classification: 'CONFIDENTIAL',
    dateCollected: '2026-09-06 14:00 IST',
    collectedBy: 'Enforcement Officer V. K. Nair',
    badgeNumber: 'ED-DEL-1029',
    location: 'Hazratganj Branch, Lucknow',
    city: 'Lucknow',
    hashSHA256: '9b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    aiSummary: 'Three structured UPI and RTGS deposits totaling ₹12,50,000 received from Chandni Chowk bullion merchants with immediate withdrawal at Gomti Nagar ATM.',
    aiExtractionTags: ['₹12.5 Lakh Deposit', 'Hawala Loop', 'Priya Singh Shell', 'Canara Bank'],
    linkedEntityIds: ['ent-1', 'ent-2', 'ent-3'],
    amountINR: '₹12,50,000',
    fileDetails: {
      filename: 'CANARA_HAZRATGANJ_AUDIT.pdf',
      size: '1.8 MB',
      format: 'Bank Statement PDF'
    }
  },
  {
    id: 'ev-4',
    evidenceNumber: 'EV-2026-VOICE-04',
    caseId: 'case-sih-01',
    caseName: 'Operation Chakravyuh',
    title: 'Intercepted Phone Audio Transcript - "Consignment Mirzapur to Delhi"',
    type: 'wiretap',
    classification: 'RESTRICTED POLICE RECORD',
    dateCollected: '2026-09-05 23:45 IST',
    collectedBy: 'Special Cell Intercept Unit 3',
    badgeNumber: 'DL-SPL-8821',
    location: 'Lodhi Road Technical Center, Delhi',
    city: 'Delhi',
    hashSHA256: '7d793037a0760186574b0282f2f435e7b1eef577292a57dc93b50ad4526d5cbd',
    aiSummary: 'Speaker 1 (identified as Rahul Verma) instructs Amit Yadav to release ₹45,000 cash advance to courier Anil Kumar for delivery near Civil Lines Kanpur.',
    aiExtractionTags: ['Voice Transcript', '₹45,000 Cash Advance', 'Kanpur Delivery', 'Rahul Verma'],
    linkedEntityIds: ['ent-1', 'ent-2', 'ent-7'],
    amountINR: '₹45,000',
    fileDetails: {
      filename: 'INTERCEPT_AUDIO_DELHI_0509.wav',
      size: '12.4 MB',
      duration: '02m:44s',
      format: 'Audio/WAV'
    }
  }
]

// Indian Operation Case
export const mockCases: Case[] = [
  {
    id: 'case-sih-01',
    caseNumber: 'CASE-2026-NCR-09',
    title: 'Operation Chakravyuh',
    description: 'Special Cell investigation into inter-state organized syndicate operating illicit Hawala conduits and coordinated freight transits across Delhi, Ghaziabad, Noida, and Lucknow.',
    codeName: 'CHAKRAVYUH',
    status: 'Active Investigation',
    priority: 'CRITICAL',
    leadInvestigator: 'ACP Vikramaditya Rathore',
    agency: 'Special Cell, Delhi Police / UP STF',
    jurisdiction: 'Delhi NCR / Uttar Pradesh Crime Corridor',
    openedDate: '2026-06-15',
    lastUpdated: '2026-09-07T22:00:00Z',
    warrantsIssued: 5,
    assetsSeized: '₹1.85 Crore',
    entitiesCount: 12,
    evidenceCount: 24,
    riskIndex: 91
  }
]

// Simplified Threat Alerts Feed
export const mockAlerts: ThreatAlert[] = [
  {
    id: 'alt-1',
    timestamp: '15 mins ago',
    title: 'FASTag Alert: Scorpio UP14 AB 1234 on Yamuna Expressway',
    description: 'Vehicle crossed Jewar toll plaza at 19:15 IST heading towards Lucknow. Associated with Amit Yadav.',
    level: 'CRITICAL',
    source: 'FASTag ANPR',
    relatedEntityId: 'ent-2',
    relatedEntityName: 'Amit Yadav (UP14 AB 1234)',
    city: 'Noida / Greater Noida',
    confidence: 96,
    isRead: false
  },
  {
    id: 'alt-2',
    timestamp: '45 mins ago',
    title: 'Hawala Transfer Anomaly: ₹12,50,000 Flagged',
    description: 'Canara Bank Hazraganj branch flagged sequential RTGS transfers into account linked with Priya Singh.',
    level: 'CRITICAL',
    source: 'BANK / UPI FLAGGED',
    relatedEntityId: 'ent-3',
    relatedEntityName: 'Priya Singh',
    city: 'Lucknow',
    confidence: 94,
    isRead: false
  },
  {
    id: 'alt-3',
    timestamp: '2 hours ago',
    title: 'SIM Burst: 48 Calls on Mirzapur-Ghaziabad Relay',
    description: 'Automated telecom CDR correlation identified high-frequency calls between +91 98XXXXXX21 & +91 97XXXXXX45.',
    level: 'HIGH',
    source: 'CDR CLUSTER',
    relatedEntityId: 'ent-1',
    relatedEntityName: 'Rahul Verma',
    city: 'Ghaziabad',
    confidence: 91,
    isRead: true
  }
]

export const mockTimelineEvents: TimelineEvent[] = [
  {
    id: 'tl-1',
    timestamp: '2026-09-05 23:45 IST',
    title: 'Intercepted Audio Comms - Delivery Directive',
    description: 'Rahul Verma directed Amit Yadav to disburse ₹45,000 cash advance to courier Anil Kumar in Kanpur.',
    category: 'wiretap',
    entityIds: ['ent-1', 'ent-2', 'ent-7'],
    entityNames: ['Rahul Verma', 'Amit Yadav', 'Anil Kumar'],
    caseId: 'case-sih-01',
    severity: 'high',
    location: 'Lodhi Road Cell Node, Delhi',
    confidenceScore: 92,
    evidenceRef: 'EV-2026-VOICE-04'
  },
  {
    id: 'tl-2',
    timestamp: '2026-09-06 14:00 IST',
    title: 'Flagged RTGS Transaction - Canara Bank',
    description: '₹12,50,000 transferred via RTGS from bullion trader accounts into Priya Singh linked entity in Lucknow.',
    category: 'financial',
    entityIds: ['ent-1', 'ent-2', 'ent-3'],
    entityNames: ['Rahul Verma', 'Amit Yadav', 'Priya Singh'],
    caseId: 'case-sih-01',
    severity: 'critical',
    location: 'Hazratganj, Lucknow',
    confidenceScore: 95,
    evidenceRef: 'EV-2026-BANK-03'
  },
  {
    id: 'tl-3',
    timestamp: '2026-09-07 19:15 IST',
    title: 'ANPR Toll Sighting - Scorpio UP14 AB 1234',
    description: 'Vehicle registered under Amit Yadav crossed Jewar Toll Plaza on Yamuna Expressway heading to Lucknow.',
    category: 'sighting',
    entityIds: ['ent-2', 'ent-4'],
    entityNames: ['Amit Yadav', 'Suresh Sharma'],
    caseId: 'case-sih-01',
    severity: 'high',
    location: 'Jewar Toll Plaza, Yamuna Expressway',
    confidenceScore: 98,
    evidenceRef: 'EV-2026-FASTAG-02'
  },
  {
    id: 'tl-4',
    timestamp: '2026-09-07 22:30 IST',
    title: 'Surveillance Raid & Warrant Issuance',
    description: 'Search warrant executed at Indirapuram cell location following 48 midnight calls between syndicate operatives.',
    category: 'warrant',
    entityIds: ['ent-1', 'ent-2', 'ent-5'],
    entityNames: ['Rahul Verma', 'Amit Yadav', 'Neha Gupta'],
    caseId: 'case-sih-01',
    severity: 'critical',
    location: 'Indirapuram, Ghaziabad',
    confidenceScore: 94,
    evidenceRef: 'EV-2026-CDR-01'
  }
]
