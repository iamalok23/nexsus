# NEXUS: Indian SIH Prototype Simplification Plan

Transition the NEXUS criminal network analysis frontend prototype into an Indian law-enforcement intelligence tool tailored for a **Smart India Hackathon (SIH)** jury demonstration.

---

## Codebase Inspection Summary

### 1. File Containing Mock Data
- **[`src/data/mockData.ts`](file:///C:/Users/Nityam%20Jaiswal/.gemini/antigravity/scratch/nexus/src/data/mockData.ts)**:
  - *Current State*: Contains US-style intelligence data (Viktor Ramos, Elena Rostova, Zurich accounts, Limassol/Romania coordinates, US Code Title 18, and USD dollar values).
  - *Target State*: Completely replace with Indian sample data:
    - **12 Persons**: Rahul Verma (Kingpin), Amit Yadav (Hawala Operator), Priya Singh (Shell Director), Suresh Sharma (Logistics), Neha Gupta (Digital Comms), Vikram Malhotra, Anil Kumar, Ravi Teja, Sunil Rathore, Pooja Deshmukh, Deepak Mishra, Rajesh Tiwari.
    - **8 Locations**: Delhi (Connaught Place & Karol Bagh), Ghaziabad (Indirapuram), Lucknow (Hazratganj), Mirzapur (Chunar Corridor), Noida (Sector 62), Kanpur, Varanasi, Meerut.
    - **15 Relationships**: Direct hawala wires, frequent burner phone calls, vehicle ownership, warehouse access, safehouse meetings.
    - **3 Identified Crime Patterns**:
      1. *Hawala Transaction Loop*: ₹12.5 Lakh outbound from Chandni Chowk to Ghaziabad to Lucknow.
      2. *FASTag / ANPR Coordinated Transit*: Mahindra Scorpio (`UP14 AB 1234`) on Noida-Agra-Lucknow Expressway.
      3. *Burner SIM Call Burst*: 48 calls in 72 hours between `+91 98XXXXXX21` and `+91 97XXXXXX45`.
    - **Indian Vehicle Formats**: `UP14 AB 1234`, `DL01 CA 9988`, `UP32 XY 5521`.
    - **Masked Phone Numbers**: `+91 98XXXXXX21`, `+91 97XXXXXX45`, `+91 99XXXXXX88`.
    - **Indian Rupee Currency**: `₹45,000`, `₹12,50,000`, `₹4,20,000`, `₹85,00,000`.

---

### 2. Components to be Simplified

| Component | Current State | Proposed Simplification |
| :--- | :--- | :--- |
| **`Sidebar.tsx`** | 7 navigation routes + US classification badges | Streamlined to **5 main screens**: Dashboard, Upload Evidence, Network Analysis, Person Details, Evidence Details. Rebranded with *Smart India Hackathon / Delhi Police Special Cell* branding. |
| **`TopNav.tsx`** | US taskforce headers and global search | Indian law-enforcement headers ("SPECIAL CELL // DELHI POLICE", "CRIMINAL INTELLIGENCE GRID"). Search placeholder: *"Search Rahul Verma, UP14 AB 1234, 98XXXXXX21..."* |
| **`NetworkGraphContainer.tsx`** | Dense graph with multiple complex sliders, clusters, and 12+ nodes | Default view of **5–8 connected core entities** (Rahul Verma, Amit Yadav, Priya Singh, Suresh Sharma, Neha Gupta, Mahindra Scorpio `UP14 AB 1234`, Canara Bank Hawala Acct). Big, readable labels for hackathon presentation. |
| **`MetricCard.tsx`** | US-focused KPIs | Display the required hackathon metrics: **12 Persons**, **8 Locations**, **15 Relationships**, **3 Possible Patterns**. |
| **`EvidenceCard.tsx` & `EntityCard.tsx`** | Foreign terminology (FIPS, RICO, FBI) | Indian formats: FASTag logs, CDR excel, PMLA Section 3/4, ₹ INR values, masked phone numbers. |

---

### 3. Screen Structure (5 Core Screens)

1. **Dashboard (`/`)**:
   - Summary of **12 Persons**, **8 Locations**, **15 Relationships**, **3 Possible Patterns**.
   - Presentation-friendly interactive network radar (5–8 key nodes).
   - "Detected Crime Patterns" card highlighting the 3 suspicious operations.
   - Quick access to Persons and Evidence.

2. **Upload Evidence (`/upload`)**:
   - Simplified drag-and-drop vault for Indian evidence types:
     - *Call Detail Records (CDR)*: Telecom CSV / Excel from Delhi/NCR circles.
     - *Bank Account Statements / UPI*: Canara Bank & HDFC statements in Indian Rupees (₹).
     - *FASTag & ANPR Toll Feeds*: Toll plaza records (Jewar Toll Plaza, Eastern Peripheral Expressway).
   - 3-step AI extraction simulation (Entity NER ➔ Geolocation Mapping ➔ Graph Insertion).

3. **Network Analysis (`/network`)**:
   - Hackathon-focused interactive graph:
     - 6–8 core nodes visible by default with bold, readable labels.
     - Click node to open a clean target drawer with contact numbers, vehicle plates, and direct connections.
     - One-click "Show Full Syndicate (12 Nodes)" toggle for live demo versatility.
     - Shortest-path attribution between Rahul Verma and the Hawala Bank Account.

4. **Person Details (`/person/:id` and `/person`)**:
   - Dossier for Indian suspects (Rahul Verma, Amit Yadav, etc.).
   - Aliases, photo, masked phone numbers (`+91 98XXXXXX21`), vehicles (`UP14 AB 1234`), last known city (`Noida Sector 62`), and linked ₹ transactions.
   - Clean tabs: *Profile*, *Associates*, *Financials (₹)*, *Linked Evidence*.

5. **Evidence Details (`/evidence/:id` and `/evidence`)**:
   - Dedicated evidence viewer displaying raw transcript/record, seizure location (e.g. Indirapuram, Ghaziabad), collecting officer (e.g. Sub-Inspector R. K. Sharma), and extracted entities.

---

## Files to Modify & Create

### [MODIFY] [src/types/index.ts](file:///C:/Users/Nityam%20Jaiswal/.gemini/antigravity/scratch/nexus/src/types/index.ts)
- Update interfaces for Indian sample data (INR formatting, vehicle plates, crime pattern types).

### [MODIFY] [src/data/mockData.ts](file:///C:/Users/Nityam%20Jaiswal/.gemini/antigravity/scratch/nexus/src/data/mockData.ts)
- Complete overhaul with 12 Indian persons, 8 locations, 15 relationships, 3 patterns, Indian vehicles, masked phone numbers, and ₹ amounts.

### [MODIFY] [src/components/layout/Sidebar.tsx](file:///C:/Users/Nityam%20Jaiswal/.gemini/antigravity/scratch/nexus/src/components/layout/Sidebar.tsx)
- Restructure navigation to the 5 core screens.

### [MODIFY] [src/components/layout/TopNav.tsx](file:///C:/Users/Nityam%20Jaiswal/.gemini/antigravity/scratch/nexus/src/components/layout/TopNav.tsx)
- Update search and Indian law-enforcement metadata.

### [MODIFY] [src/components/network/NetworkGraphContainer.tsx](file:///C:/Users/Nityam%20Jaiswal/.gemini/antigravity/scratch/nexus/src/components/network/NetworkGraphContainer.tsx)
- Simplify to 5–8 high-contrast, clearly labeled nodes tailored for hackathon presentation.

### [MODIFY] [src/pages/DashboardPage.tsx](file:///C:/Users/Nityam%20Jaiswal/.gemini/antigravity/scratch/nexus/src/pages/DashboardPage.tsx)
- Display the 4 required stats (12 Persons, 8 Locations, 15 Relationships, 3 Patterns) and 3 pattern cards.

### [MODIFY] [src/pages/UploadEvidencePage.tsx](file:///C:/Users/Nityam%20Jaiswal/.gemini/antigravity/scratch/nexus/src/pages/UploadEvidencePage.tsx)
- Adapt presets to Indian CDR, UPI/Bank, and FASTag toll formats.

### [MODIFY] [src/pages/NetworkAnalysisPage.tsx](file:///C:/Users/Nityam%20Jaiswal/.gemini/antigravity/scratch/nexus/src/pages/NetworkAnalysisPage.tsx)
- Clean up controls and present the simplified graph.

### [MODIFY] [src/pages/EntityProfilePage.tsx](file:///C:/Users/Nityam%20Jaiswal/.gemini/antigravity/scratch/nexus/src/pages/EntityProfilePage.tsx)
- Person Details view with Indian locations, phone numbers, vehicle numbers, and ₹ currency.

### [NEW] [src/pages/EvidenceDetailsPage.tsx](file:///C:/Users/Nityam%20Jaiswal/.gemini/antigravity/scratch/nexus/src/pages/EvidenceDetailsPage.tsx)
- Dedicated Evidence Details screen for inspecting evidentiary documents, CDR pings, and FASTag toll records.

### [MODIFY] [src/App.tsx](file:///C:/Users/Nityam%20Jaiswal/.gemini/antigravity/scratch/nexus/src/App.tsx)
- Route updates for the 5 screens: `/` (Dashboard), `/upload` (Upload Evidence), `/network` (Network Analysis), `/person/:id` (Person Details), `/evidence/:id` (Evidence Details).

---

## Verification Plan

### Automated Build Verification
1. Run `npm run build` to ensure all TypeScript types, paths, and Vite assets compile with 0 errors.

### Screen & Route Verification
1. Start the server with `npm run dev -- --host --port 5173`.
2. Verify all 5 main screens load:
   - `http://localhost:5173/` (Dashboard showing 12 Persons, 8 Locations, 15 Relationships, 3 Patterns)
   - `http://localhost:5173/upload` (Upload Evidence with Indian presets)
   - `http://localhost:5173/network` (Network Analysis with 5-8 clear nodes)
   - `http://localhost:5173/person/ent-1` (Person Details for Rahul Verma)
   - `http://localhost:5173/evidence/ev-1` (Evidence Details for FASTag/CDR record)
