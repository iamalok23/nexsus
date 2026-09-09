# NEXUS // AI-Powered Criminal Network Analysis Dashboard
### Smart India Hackathon (SIH 2026) Frontend Prototype

The NEXUS frontend has been streamlined and tailored for an **Indian law-enforcement context** (Special Cell Delhi Police & Uttar Pradesh Special Task Force - UP STF) for competition pitching and live judge demonstrations.

---

## 📍 Workspace & Server Access
- **Workspace Directory**: `C:\Users\Nityam Jaiswal\.gemini\antigravity\scratch\nexus`
- **Local URL**: [http://localhost:5173/](http://localhost:5173/)
- **Network / LAN URL**: `http://10.11.2.57:5173/`
- **Build Status**: Production build passed cleanly with 0 TypeScript errors (`tsc -b && vite build`).

---

## 🇮🇳 Indian Law-Enforcement Data Implemented

### 1. Sample Suspects & Persons (12 Total)
* **Core 5 Suspects**:
  1. **Rahul Verma** (Kingpin / Hawala Operator, Delhi Chandni Chowk, High Threat 94/100)
  2. **Amit Yadav** (Enforcer & Logistics, Ghaziabad Indirapuram, Threat 88/100)
  3. **Priya Singh** (Financial Mule / Shell Firms, Lucknow Hazratganj, Threat 79/100)
  4. **Suresh Sharma** (Weapons & Cross-Border Logistics, Mirzapur, Threat 85/100)
  5. **Neha Gupta** (Tech & VoIP Facilitator, Noida Sector 62, Threat 72/100)
* **Additional 7 Persons**:
  6. **Vikram Malhotra** (Noida Sector 18)
  7. **Deepak Rawat** (Meerut Cantt)
  8. **Sunita Devi** (Kanpur Nagar)
  9. **Manoj Tiwari** (Varanasi Cantt)
  10. **Anjali Kashyap** (Ghaziabad Raj Nagar)
  11. **Harish Chandra** (Delhi Rohini)
  12. **Pooja Saxena** (Lucknow Gomti Nagar)

### 2. Sample Locations (8 Core Monitored Corridors)
1. **Delhi** (Chandni Chowk / Connaught Place / Rohini)
2. **Ghaziabad** (Indirapuram / Raj Nagar)
3. **Lucknow** (Hazratganj / Gomti Nagar)
4. **Mirzapur** (Chunar / Rural Corridor)
5. **Noida** (Sector 62 / Sector 18)
6. **Meerut** (Cantt / Transport Nagar)
7. **Kanpur** (Civil Lines / Transport Hub)
8. **Varanasi** (Cantt Station Area)

### 3. Realistic Indian Identifiers & Evidence
- **Indian Vehicle Plates**: `UP14 AB 1234` (Mahindra Scorpio), `DL01 CA 9988` (Toyota Fortuner), `UP32 EK 4411`, `DL04 BK 5520`, etc.
- **Masked Phone Numbers**: `+91 98XXXXXX21`, `+91 97XXXXXX45`, `+91 99XXXXXX10`, `+91 98XXXXXX88`, `+91 96XXXXXX33`, etc.
- **Indian Rupee Figures**: `₹45,000`, `₹12,50,000`, `₹4,20,000`, `₹8,90,000`, `₹25,00,000`, etc.
- **Statutory Compliance**: Indian Evidence Act Section 65B electronic certificate compliance, SHA-256 integrity hashes, IPC/BNS charges (Section 120B, 420, 384, Arms Act 25, PMLA 3/4).

---

## 🎯 4 Core Dashboard KPI Metrics
1. **Tracked Persons**: **12 Persons** (5 High-Value Targets, 7 active associates)
2. **Monitored Locations**: **8 Locations** (NCR & UP Corridors: Delhi, Ghaziabad, Lucknow, Mirzapur, Noida, etc.)
3. **Identified Connections**: **15 Relationships** (Direct calls, Hawala wires, vehicle registrations)
4. **AI Detected Modus**: **3 Possible Patterns** (Hawala Loop, FASTag Transit, Call Burst)

---

## ⚡ 3 Detected Crime Patterns (Modus Operandi)
1. **Hawala Fund Layering Loop**: Circular transfer of ₹12,50,000 originating from a Chandni Chowk bullion trader, routed through Amit Yadav in Ghaziabad, and deposited into Priya Singh shell accounts in Lucknow within 4 hours.
2. **FASTag Toll Corridor Transit**: Mahindra Scorpio (`UP14 AB 1234`) clocked crossing Chhijarsi Toll Plaza (NH-9) at 02:14 AM and Jewar Toll Plaza at 03:22 AM, matching CDR cell-tower tower dump of Suresh Sharma.
3. **Burner SIM Call Burst (Pre-Crime)**: Coordinated burst of 38 short-duration VoLTE calls (<45s) across 3 masked burner SIMs (`98XXXXXX21` ➔ `97XXXXXX45`) immediately preceding cash transit.

---

## 🧭 Simplified 5 Main Screens

| Route | Page | Key Features for Hackathon Pitch |
| :--- | :--- | :--- |
| `/` | **Dashboard** | 4 clean KPI cards, 3 AI Modus Operandi pattern cards, embedded network radar, recent Indian alerts feed, and 12 tracked suspects table. |
| `/upload` | **Upload Evidence** | CDR telecom dumps, FASTag ANPR toll camera logs, Canara Bank Hawala statements with Indian Section 65B certificate notes, SHA-256 hash generator, and 4-step AI pipeline visualizer. |
| `/network` | **Network Analysis** | Interactive SVG graph showing **5 to 8 connected core entities** by default with prominent readable labels, edge badges (e.g. ₹12.5L Hawala), 1-click shortest link tracer (Rahul Verma ➔ Amit Yadav ➔ Hawala Bank Acct), and toggle to expand to all 15 syndicate nodes. |
| `/person/:id` | **Person Details** | Detailed suspect dossier: photo, calculated threat score, alias, masked mobile, vehicle registration, Indian IPC/PMLA charges, bank footprint in ₹, and CDR call history. |
| `/evidence/:id` | **Evidence Details** | Single evidence inspector: Section 65B compliance verification, custodial officer (Sub-Insp R. K. Sharma), SHA-256 verification badge, linked suspects, and raw extracted payload. |

---

## 🕸️ High-Visibility Network Graph (5 to 8 Core Entities)
To prevent overwhelming hackathon judges:
- **Default Core Mode (7 prominent nodes)**:
  1. `Rahul Verma` (Suspect, Red Badge)
  2. `Amit Yadav` (Suspect, Red Badge)
  3. `Priya Singh` (Suspect, Red Badge)
  4. `Suresh Sharma` (Suspect, Red Badge)
  5. `Neha Gupta` (Suspect, Red Badge)
  6. `Scorpio [UP14 AB 1234]` (Vehicle, Cyan Badge)
  7. `Canara Bank [Hawala Acct]` (Financial, Emerald Badge)
- **Edge Badges**: Bold labels such as `₹12.5L Hawala`, `₹4.2L Layering`, `Vehicle Registered`, `38 Calls Burst`.
- **Expandable**: One-click *"Show All 15 Nodes"* toggle available during technical Q&A with judges.

---

## 🚀 Future Backend Architecture Readiness
The frontend remains strictly decoupled from backend services, making it prepared for future integration:
- All data models reside in clean TypeScript interfaces ([types/index.ts](file:///C:/Users/Nityam%20Jaiswal/.gemini/antigravity/scratch/nexus/src/types/index.ts)).
- Mock databases and relations are isolated in [mockData.ts](file:///C:/Users/Nityam%20Jaiswal/.gemini/antigravity/scratch/nexus/src/data/mockData.ts).
- Ready to be swapped with REST API or FastAPI / Django / Node.js backend endpoints without frontend refactoring.
