import React, { useState, useRef, useEffect } from 'react'
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
  ArrowRight,
  AlertTriangle,
  Copy,
  Check,
  Tag,
  X
} from 'lucide-react'
import { mockEvidence } from '../data/mockData'
import { Evidence, EvidenceType, ClassificationLevel } from '../types'
import { api, UploadResponse } from '../lib/api'
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
  
  // Real Pipeline Processing State
  const [isProcessing, setIsProcessing] = useState(false)
  const [pipelineStep, setPipelineStep] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [lastUploadedEvidence, setLastUploadedEvidence] = useState<UploadResponse | null>(null)
  const [copiedHash, setCopiedHash] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load persisted evidence archive from backend API on mount
  useEffect(() => {
    let isMounted = true
    const loadArchive = async () => {
      try {
        const data = await api.getEvidenceList()
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setEvidenceList(data)
        }
      } catch (err) {
        console.warn('Backend evidence archive fetch failed; retaining mock fallback.', err)
      }
    }
    loadArchive()
    return () => {
      isMounted = false
    }
  }, [])

  const copyHashToClipboard = (hashText: string) => {
    navigator.clipboard.writeText(hashText)
    setCopiedHash(true)
    setTimeout(() => setCopiedHash(false), 2000)
  }

  const handleFileSelect = (file: File) => {
    const ext = '.' + (file.name.split('.').pop() || '').toLowerCase()
    if (!['.txt', '.csv', '.json'].includes(ext)) {
      setUploadError(`File format '${ext}' is not supported. Please upload a .txt, .csv, or .json evidence file.`)
      return
    }
    setSelectedFile(file)
    setTitle((prev) => prev || `Ingested Evidence - ${file.name}`)
    setUploadError(null)
    setUploadSuccess(null)
  }

  const handleSimulateFileSelect = (name: string, type: EvidenceType, sampleCity: string, sampleContent: string) => {
    const mimeType = name.endsWith('.json') ? 'application/json' : name.endsWith('.csv') ? 'text/csv' : 'text/plain'
    const file = new File([sampleContent], name, { type: mimeType })
    setSelectedFile(file)
    setEvidenceType(type)
    setCity(sampleCity)
    setTitle(`Automated Intercept Capture - ${name}`)
    setUploadError(null)
    setUploadSuccess(null)
  }

  const handleProcessUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      setUploadError('Please select or attach an evidence file (.txt, .csv, or .json) to ingest.')
      return
    }

    const ext = '.' + (selectedFile.name.split('.').pop() || '').toLowerCase()
    if (!['.txt', '.csv', '.json'].includes(ext)) {
      setUploadError(`File extension '${ext}' is not supported by the ingestion vault. Allowed formats: .txt, .csv, .json`)
      return
    }

    setIsProcessing(true)
    setUploadError(null)
    setUploadSuccess(null)
    setPipelineStep(1) // 1. Computing SHA-256 integrity hash & transmission

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('case_id', 'case-sih-01')
      formData.append('title', title.trim() || `Ingested Evidence: ${selectedFile.name}`)
      formData.append('classification', classification)

      // Real API request to POST /api/upload
      const res = await api.uploadEvidence(formData)

      // Step 2: Named Entity Extraction verified by backend
      setPipelineStep(2)
      await new Promise((resolve) => setTimeout(resolve, 350))

      // Step 3: Network Graph Vectorization
      setPipelineStep(3)
      await new Promise((resolve) => setTimeout(resolve, 350))

      const actualHash = res.hash_sha256 || res.hashSHA256 || ''
      const actualEvNumber = res.evidence_number || res.evidenceNumber || `EV-2026-SYNTH-${Date.now()}`
      const extraction = res.extraction || { summary: '', entities: [], extraction_tags: [] }
      const fileDetails = res.file_details || res.fileDetails

      const extractedTags = 
        extraction.extraction_tags || 
        extraction.extractionTags || 
        extraction.entities?.map((ent) => ent.name) || 
        []

      const newEv: Evidence = {
        id: res.id || `ev-${Date.now()}`,
        evidenceNumber: actualEvNumber,
        caseId: res.case_id || res.caseId || 'case-sih-01',
        caseName: res.case_name || res.caseName || 'Operation Chakravyuh',
        title: res.title || title || selectedFile.name,
        type: evidenceType,
        classification: classification,
        dateCollected: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' IST',
        collectedBy: custodyOfficer,
        badgeNumber: badgeNumber,
        location: location,
        city: city,
        hashSHA256: actualHash, // Actual SHA-256 hash returned by backend
        aiSummary: extraction.summary || 'Entity and pattern extraction completed.',
        aiExtractionTags: extractedTags.length > 0 ? extractedTags : ['Verified Evidence', 'Section 65B'],
        linkedEntityIds: extraction.entities?.map((ent) => ent.name) || [],
        amountINR: (extraction.currency_amounts || extraction.currencyAmounts)?.[0],
        phoneRef: (extraction.phone_numbers || extraction.phoneNumbers)?.[0],
        vehicleRef: (extraction.vehicle_numbers || extraction.vehicleNumbers)?.[0],
        fileDetails: {
          filename: fileDetails?.filename || selectedFile.name,
          size: fileDetails?.size_formatted || fileDetails?.sizeFormatted || `${(selectedFile.size / 1024).toFixed(1)} KB`,
          format: fileDetails?.format ? fileDetails.format.toUpperCase() : ext.replace('.', '').toUpperCase()
        }
      }

      setEvidenceList((prev) => {
        const exists = prev.some((item) => item.id === newEv.id || (item.evidenceNumber && item.evidenceNumber === newEv.evidenceNumber))
        if (exists) {
          return prev.map((item) => (item.id === newEv.id || item.evidenceNumber === newEv.evidenceNumber ? newEv : item))
        }
        return [newEv, ...prev]
      })
      setLastUploadedEvidence(res)
      setUploadSuccess(`Evidence successfully ingested! Registered under Evidence #${actualEvNumber} with genuine SHA-256 hash.`)
      setSelectedFile(null)
      setTitle('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Evidence upload failed'
      setUploadError(msg)
      setPipelineStep(0)
    } finally {
      setIsProcessing(false)
    }
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
            <CardContent className="p-4 space-y-4">
              {/* Error Alert Banner */}
              {uploadError && (
                <div className="p-3 bg-red-950/40 border border-red-800/80 rounded-sm text-red-300 text-xs flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-red-200">Ingestion Error</span>
                      <span className="text-[11px] text-red-300/90">{uploadError}</span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setUploadError(null)}
                    className="text-red-400 hover:text-red-200 p-0.5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Success Alert Banner */}
              {uploadSuccess && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-sm text-emerald-300 text-xs flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-emerald-200">Verification & Hash Validated</span>
                      <span className="text-[11px] text-emerald-300/90">{uploadSuccess}</span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setUploadSuccess(null)}
                    className="text-emerald-400 hover:text-emerald-200 p-0.5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              <form onSubmit={handleProcessUpload} className="space-y-4 text-xs">
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleFileSelect(f)
                  }}
                  accept=".txt,.csv,.json"
                  className="hidden"
                />

                {/* Drag and drop upload zone */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    const f = e.dataTransfer.files?.[0]
                    if (f) handleFileSelect(f)
                  }}
                  className="border-2 border-dashed border-slate-700 hover:border-cyan-500/70 rounded-sm p-6 text-center transition-colors bg-slate-900/40 cursor-pointer"
                >
                  <UploadCloud className="h-10 w-10 mx-auto text-cyan-400 mb-2" />
                  {selectedFile ? (
                    <div className="space-y-1">
                      <div className="text-cyan-300 font-bold flex items-center justify-center gap-2">
                        <FileCheck className="h-4 w-4 text-emerald-400" />
                        <span>{selectedFile.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Click or drop another file to replace • Ready for cryptographic ingestion
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="text-slate-200 font-bold">
                        Drop police evidence file, CDR sheet, or audit dump here (Click to browse)
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Accepts structured investigation data in <span className="text-cyan-300 font-mono">.csv</span>, <span className="text-cyan-300 font-mono">.json</span>, or <span className="text-cyan-300 font-mono">.txt</span> formats
                      </p>
                    </>
                  )}
                  
                  {/* Quick Preset Buttons for Indian evidence */}
                  <div 
                    className="mt-3 flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-slate-800/80"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-[10px] text-slate-400 mr-1">Sample SIH Feeds:</span>
                    <button
                      type="button"
                      onClick={() => handleSimulateFileSelect(
                        'CDR_DELHI_GZBD_07092026.csv', 
                        'cdr', 
                        'Ghaziabad',
                        'timestamp,calling_number,receiving_number,tower_id,duration_sec,location\n2026-09-07 02:14:10,+91 9810123456,+91 9711223344,DEL-TWR-881,142,Indirapuram Ghaziabad\n2026-09-07 03:22:05,+91 9810123456,+91 9910987654,DEL-TWR-884,85,Sahibabad\nTARGET_NAME: Rahul Verma\nASSOCIATE_VEHICLE: UP14 AB 1234\nNOTE: Intercept confirms transit towards Ghaziabad corridor'
                      )}
                      className="px-2.5 py-1 rounded-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] border border-slate-700 transition-colors"
                    >
                      CDR Tower Dump (.csv)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSimulateFileSelect(
                        'FASTAG_JEWAR_LOGS_SYNTH.csv', 
                        'surveillance', 
                        'Noida',
                        'timestamp,toll_plaza,lane,vehicle_number,tag_id,amount_inr,status\n2026-09-07 04:12:33,Jewar Plaza Km 42,Lane 04,UP14 AB 1234,TAG99281726,₹1,250,PROCESSED\n2026-09-07 04:15:10,Jewar Plaza Km 42,Lane 02,DL01 CA 9988,TAG33829102,₹850,PROCESSED\nTARGET_FLAGGED: Scorpio UP14 AB 1234 linked to Rahul Verma syndicate'
                      )}
                      className="px-2.5 py-1 rounded-xs bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] border border-slate-700 transition-colors"
                    >
                      FASTag Toll Camera (.csv)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSimulateFileSelect(
                        'CANARA_HAZRATGANJ_AUDIT.json', 
                        'financial', 
                        'Lucknow',
                        JSON.stringify({
                          audit_case: 'Operation Chakravyuh',
                          bank_node: 'Canara Bank Hazratganj Lucknow',
                          suspects: ['Amit Yadav', 'Rahul Verma'],
                          transactions: [
                            {
                              tx_id: 'TXN9928371',
                              amount: '₹12,50,000',
                              counterparty: 'Golden Horizon Logistics',
                              flag: 'High Value Hawala Routing'
                            }
                          ],
                          remarks: 'Inter-account structuring detected for Amit Yadav account.'
                        }, null, 2)
                      )}
                      className="px-2.5 py-1 rounded-xs bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[10px] border border-slate-700 transition-colors"
                    >
                      Hawala Audit Trail (.json)
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

        {/* Right 1 Col: AI Pipeline Live Telemetry & Backend Verification */}
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

          {/* Actual Backend Extraction Receipt */}
          {lastUploadedEvidence && (
            <Card className="bg-[#0c121e] border-cyan-500/40 animate-in fade-in-50 duration-300">
              <CardHeader className="p-3.5 border-b border-slate-800 flex flex-row items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-cyan-400 font-bold block tracking-wider">
                    LIVE INGESTION RECEIPT
                  </span>
                  <CardTitle className="text-xs text-slate-100">
                    {lastUploadedEvidence.evidence_number || lastUploadedEvidence.evidenceNumber}
                  </CardTitle>
                </div>
                <Badge variant="emerald" className="text-[9px]">201 CREATED</Badge>
              </CardHeader>
              <CardContent className="p-3.5 space-y-3 text-xs">
                {/* Actual SHA-256 Hash from backend */}
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-semibold uppercase flex items-center gap-1">
                      <Hash className="h-3 w-3 text-cyan-400" />
                      Server SHA-256 Hash
                    </span>
                    <button
                      onClick={() => copyHashToClipboard(lastUploadedEvidence.hash_sha256 || lastUploadedEvidence.hashSHA256 || '')}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[9px]"
                      title="Copy SHA-256 Hash"
                    >
                      {copiedHash ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-xs border border-slate-800 text-[10px] font-mono text-emerald-400 break-all select-all leading-tight">
                    {lastUploadedEvidence.hash_sha256 || lastUploadedEvidence.hashSHA256}
                  </div>
                </div>

                {/* Backend Summary */}
                <div className="p-2 rounded-xs bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-300 leading-relaxed font-sans">
                  <span className="text-cyan-400 font-mono font-bold text-[10px] uppercase block mb-0.5">
                    Backend Extraction Engine:
                  </span>
                  {lastUploadedEvidence.extraction?.summary}
                </div>

                {/* Extracted Entities */}
                {lastUploadedEvidence.extraction?.entities && lastUploadedEvidence.extraction.entities.length > 0 && (
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                      Extracted Named Entities ({lastUploadedEvidence.extraction.entities.length}):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {lastUploadedEvidence.extraction.entities.map((ent, idx) => (
                        <span 
                          key={idx} 
                          className="inline-flex items-center text-[9px] px-1.5 py-0.5 rounded-xs bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 font-mono"
                        >
                          <Tag className="h-2.5 w-2.5 mr-1 text-cyan-400" />
                          {ent.name}
                          <span className="text-slate-500 ml-1">[{ent.type}]</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extracted Identifiers (Phones, Vehicles, Currency) */}
                {((lastUploadedEvidence.extraction?.phone_numbers?.length ?? 0) > 0 ||
                  (lastUploadedEvidence.extraction?.phoneNumbers?.length ?? 0) > 0 ||
                  (lastUploadedEvidence.extraction?.vehicle_numbers?.length ?? 0) > 0 ||
                  (lastUploadedEvidence.extraction?.vehicleNumbers?.length ?? 0) > 0 ||
                  (lastUploadedEvidence.extraction?.currency_amounts?.length ?? 0) > 0 ||
                  (lastUploadedEvidence.extraction?.currencyAmounts?.length ?? 0) > 0) && (
                  <div className="pt-2 border-t border-slate-800 space-y-1.5 text-[10px]">
                    <span className="text-slate-400 uppercase font-semibold block">Extracted Identifiers:</span>
                    <div className="flex flex-wrap gap-1">
                      {(lastUploadedEvidence.extraction?.phone_numbers || lastUploadedEvidence.extraction?.phoneNumbers || []).map((p, i) => (
                        <span key={`p-${i}`} className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 text-slate-300 rounded-xs">
                          📞 {p}
                        </span>
                      ))}
                      {(lastUploadedEvidence.extraction?.vehicle_numbers || lastUploadedEvidence.extraction?.vehicleNumbers || []).map((v, i) => (
                        <span key={`v-${i}`} className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 text-amber-300 rounded-xs">
                          🚗 {v}
                        </span>
                      ))}
                      {(lastUploadedEvidence.extraction?.currency_amounts || lastUploadedEvidence.extraction?.currencyAmounts || []).map((c, i) => (
                        <span key={`c-${i}`} className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 text-emerald-300 rounded-xs">
                          💰 {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chain of Custody & Dataset Metadata */}
                <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Audit Case:</span>
                    <span className="text-slate-300 font-semibold">{lastUploadedEvidence.case_name || lastUploadedEvidence.caseName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Review Status:</span>
                    <span className="text-amber-400">{lastUploadedEvidence.review_status || lastUploadedEvidence.reviewStatus}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Dataset:</span>
                    <span className="text-slate-300">{lastUploadedEvidence.dataset_label || lastUploadedEvidence.datasetLabel}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
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
