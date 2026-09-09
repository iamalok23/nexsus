import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  UploadCloud, 
  FileCheck, 
  ShieldCheck, 
  Fingerprint, 
  Database, 
  CheckCircle2,
  RefreshCw,
  Hash,
  ArrowRight
} from 'lucide-react'
import { mockEvidence } from '../data/mockData'
import { Evidence, EvidenceType, ClassificationLevel } from '../types'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { EvidenceCard } from '../components/common/EvidenceCard'
import { cn } from '../lib/utils'

export const UploadEvidencePage: React.FC = () => {
  const navigate = useNavigate()
  const [evidenceList, setEvidenceList] = useState<Evidence[]>(mockEvidence)
  const [evidenceType, setEvidenceType] = useState<EvidenceType>('cdr')
  const [classification, setClassification] = useState<ClassificationLevel>('LAW ENFORCEMENT SENSITIVE')
  const [title, setTitle] = useState('')
  const [custodyOfficer, setCustodyOfficer] = useState('Sub-Inspector R. K. Sharma')
  const [badgeNumber, setBadgeNumber] = useState('DL-SPL-4412')
  const [city, setCity] = useState('Ghaziabad')
  const [location, setLocation] = useState('Indirapuram Cell Node 04, Ghaziabad')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  // Pipeline Processing Simulation State
  const [isProcessing, setIsProcessing] = useState(false)
  const [pipelineStep, setPipelineStep] = useState(0)

  const handleSimulateFileSelect = (name: string, type: EvidenceType, sampleCity: string) => {
    setSelectedFile(new File(['sample-data'], name, { type: 'text/plain' }))
    setEvidenceType(type)
    setCity(sampleCity)
    setTitle(`Automated Intercept Capture - ${name}`)
  }

  const handleProcessUpload = (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setPipelineStep(1)

    // Step 1: Hashing
    setTimeout(() => {
      const mockHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
      setPipelineStep(2)

      // Step 2: Entity & Phone extraction
      setTimeout(() => {
        setPipelineStep(3)

        // Step 3: Graph Insertion
        setTimeout(() => {
          const newEv: Evidence = {
            id: `ev-${Date.now()}`,
            evidenceNumber: `EV-2026-${evidenceType.toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
            caseId: 'case-sih-01',
            caseName: 'Operation Chakravyuh',
            title: title || 'CDR Tower Handover & Call Log Record',
            type: evidenceType,
            classification: classification,
            dateCollected: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' IST',
            collectedBy: custodyOfficer,
            badgeNumber: badgeNumber,
            location: location,
            city: city,
            hashSHA256: mockHash,
            aiSummary: 'Entity extraction identified connections to Rahul Verma (+91 98XXXXXX21) and Scorpio vehicle (UP14 AB 1234). Automatic corroboration with Hawala pattern #1 established.',
            aiExtractionTags: ['Rahul Verma', 'Scorpio UP14 AB 1234', 'NCR Corridor', 'Pattern Corroborated'],
            linkedEntityIds: ['ent-1', 'ent-2'],
            fileDetails: {
              filename: selectedFile ? selectedFile.name : 'TELECOM_CDR_DUMP.xlsx',
              size: '3.6 MB',
              format: 'Police Telecom Record'
            }
          }

          setEvidenceList([newEv, ...evidenceList])
          setIsProcessing(false)
          setPipelineStep(0)
          setSelectedFile(null)
          setTitle('')
        }, 500)
      }, 500)
    }, 500)
  }

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <UploadCloud className="h-6 w-6 text-cyan-400" />
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-100">
              POLICE EVIDENCE INGESTION VAULT
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated SHA-256 integrity check, Named Entity Extraction (NER), and Criminal Graph Linkage
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="emerald">SECTION 65B COMPLIANT</Badge>
          <Badge variant="cyan">AUTO-OCR READY</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Ingestion & Metadata Form */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-[#0c121e] border-slate-800">
            <CardHeader className="p-4 border-b border-slate-800">
              <CardTitle>Evidence Ingestion & Chain of Custody Record</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handleProcessUpload} className="space-y-4 text-xs">
                {/* Drag and drop upload zone */}
                <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/70 rounded-sm p-6 text-center transition-colors bg-slate-900/40 cursor-pointer">
                  <UploadCloud className="h-10 w-10 mx-auto text-cyan-400 mb-2" />
                  <div className="text-slate-200 font-bold">
                    {selectedFile ? selectedFile.name : 'Drop police evidence files, CDR sheets, or FASTag records here'}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Accepts Telecom CDR (.xlsx/.csv), Bank/UPI statements (.pdf), FASTag ANPR footage (.jpg/.mp4), audio intercepts (.wav)
                  </p>
                  
                  {/* Quick Preset Buttons for Indian evidence */}
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-400 mr-1">Sample SIH Feeds:</span>
                    <button
                      type="button"
                      onClick={() => handleSimulateFileSelect('CDR_DELHI_GZBD_07092026.xlsx', 'cdr', 'Ghaziabad')}
                      className="px-2.5 py-1 rounded-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] border border-slate-700"
                    >
                      CDR Tower Dump (.xlsx)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSimulateFileSelect('FASTAG_JEWAR_TOLL_CAM02.jpg', 'surveillance', 'Noida')}
                      className="px-2.5 py-1 rounded-xs bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] border border-slate-700"
                    >
                      FASTag Toll Camera (.jpg)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSimulateFileSelect('CANARA_HAZRATGANJ_AUDIT.pdf', 'financial', 'Lucknow')}
                      className="px-2.5 py-1 rounded-xs bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[10px] border border-slate-700"
                    >
                      Hawala Bank Statement (₹)
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase text-slate-400 font-semibold mb-1">
                      Evidence Category
                    </label>
                    <select
                      value={evidenceType}
                      onChange={(e) => setEvidenceType(e.target.value as EvidenceType)}
                      className="w-full h-9 rounded-sm border border-slate-700 bg-slate-900 px-3 text-xs text-slate-200"
                    >
                      <option value="cdr">Call Detail Record (CDR Telecom Dump)</option>
                      <option value="surveillance">FASTag / Toll ANPR Camera Record</option>
                      <option value="financial">Bank Account / UPI Statement (₹)</option>
                      <option value="wiretap">Intercepted Audio Recording</option>
                      <option value="forensics">Physical Seizure / Hardware Dump</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-slate-400 font-semibold mb-1">
                      Operating Jurisdiction / City
                    </label>
                    <select
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value)
                        setLocation(`${e.target.value} Sector Station`)
                      }}
                      className="w-full h-9 rounded-sm border border-slate-700 bg-slate-900 px-3 text-xs text-slate-200"
                    >
                      <option value="Delhi">Delhi (Special Cell Lodhi Road)</option>
                      <option value="Ghaziabad">Ghaziabad (Indirapuram / Sahibabad)</option>
                      <option value="Lucknow">Lucknow (Hazratganj / Gomti Nagar)</option>
                      <option value="Mirzapur">Mirzapur (Vindhyachal Corridor)</option>
                      <option value="Noida">Noida (Sector 62)</option>
                      <option value="Kanpur">Kanpur (Civil Lines)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-slate-400 font-semibold mb-1">
                      Evidence Title / Description
                    </label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Tower handover pings 98XXXXXX21 to 97XXXXXX45"
                      required
                      className="bg-slate-900 border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-slate-400 font-semibold mb-1">
                      Collecting Officer & Badge
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={custodyOfficer}
                        onChange={(e) => setCustodyOfficer(e.target.value)}
                        placeholder="Officer Name"
                        className="bg-slate-900 border-slate-700"
                      />
                      <Input
                        value={badgeNumber}
                        onChange={(e) => setBadgeNumber(e.target.value)}
                        placeholder="Badge #"
                        className="bg-slate-900 border-slate-700"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="cyan"
                    disabled={isProcessing}
                    className="w-full h-10 text-xs font-bold flex items-center justify-center space-x-2"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>PROCESSING EVIDENCE THROUGH AI PIPELINE...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        <span>INGEST & LINK TO OPERATION CHAKRAVYUH</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: AI Pipeline Live Telemetry */}
        <div className="space-y-4">
          <Card className="bg-[#0c121e] border-slate-800">
            <CardHeader className="p-4 border-b border-slate-800">
              <CardTitle>AI Processing Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              {/* Step 1 */}
              <div className={cn(
                'p-2.5 rounded-xs border transition-colors',
                pipelineStep >= 1 ? 'border-cyan-500/60 bg-cyan-950/30 text-cyan-200' : 'border-slate-800 bg-slate-900/30 text-slate-400'
              )}>
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    <Hash className="h-3.5 w-3.5" />
                    1. SHA-256 Integrity Check
                  </span>
                  {pipelineStep >= 1 && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Court-admissible cryptographic hash under Indian Evidence Act Sec 65B
                </div>
              </div>

              {/* Step 2 */}
              <div className={cn(
                'p-2.5 rounded-xs border transition-colors',
                pipelineStep >= 2 ? 'border-cyan-500/60 bg-cyan-950/30 text-cyan-200' : 'border-slate-800 bg-slate-900/30 text-slate-400'
              )}>
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    <Fingerprint className="h-3.5 w-3.5" />
                    2. Named Entity Extraction (NER)
                  </span>
                  {pipelineStep >= 2 && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Extracts suspect names, vehicles (UP14 AB 1234), and masked phones
                </div>
              </div>

              {/* Step 3 */}
              <div className={cn(
                'p-2.5 rounded-xs border transition-colors',
                pipelineStep >= 3 ? 'border-emerald-500/60 bg-emerald-950/30 text-emerald-200' : 'border-slate-800 bg-slate-900/30 text-slate-400'
              )}>
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    <Database className="h-3.5 w-3.5" />
                    3. Network Graph Vectorization
                  </span>
                  {pipelineStep >= 3 && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Automated linkage with core syndicate nodes in Operation Chakravyuh
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ingested Evidence Repository Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileCheck className="h-5 w-5 text-cyan-400" />
            <h2 className="text-sm font-bold tracking-wider uppercase text-slate-200">
              Verified Evidence Archive ({evidenceList.length} Records)
            </h2>
          </div>
          <Badge variant="cyan">AUTO-INDEXED</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {evidenceList.map((ev) => (
            <EvidenceCard key={ev.id} evidence={ev} />
          ))}
        </div>
      </div>
    </div>
  )
}
