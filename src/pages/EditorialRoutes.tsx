import { useState, useEffect } from 'react'
import { ContentCard } from '../components/Cards'
import { Breadcrumbs } from '../components/UI'
import { duplicateSuggestions, editorialEntities, evidenceCoverage, editorialSources, orphanReports, relationships, readiness } from '../generated'
import { PageFrame } from '../layouts/SiteLayout'
import { authProvider } from '../utils/editorialAuth'
import type { ClaimRecord, EvidenceRecord, WorkflowEvent, WorkflowState } from '../types/editorial'
import { canTransition, transition, loadWorkflowState, loadWorkflowEvents, loadClaims, loadEvidence, saveClaim, saveEvidence, applyWorkflowTransition } from '../utils/editorialWorkflow'
import { supabase } from '../utils/supabaseClient'

export function EditorialRoutes({ path }: { path: string }) {
  if (path === '/editorial/login') return <PageFrame title="Editorial sign in" description="Sign in to the editorial workspace."><EditorialLogin /></PageFrame>
  if (path === '/editorial/sources') return <PageFrame title="Source dashboard" description="Internal editorial view of source coverage, rights and monitoring state."><EditorialSources /></PageFrame>
  if (path === '/editorial/review') return <PageFrame title="Review queue" description="Internal editorial worklist. These records are not public content."><ReviewQueue /></PageFrame>
  if (path === '/editorial/evidence') return <PageFrame title="Evidence coverage" description="Read-only editorial coverage report for claims, sources and evidence."><EvidenceCoveragePage /></PageFrame>
  const entityId = path.split('/').at(-1)
  const entity = editorialEntities.find((item) => item.id === entityId)
  if (!entity) return <PageFrame title="Editorial record not found" description="This record is not in the editorial registry."><Breadcrumbs current="Not found" /></PageFrame>
  return <PageFrame title={entity.title} description="Internal editorial workspace."><EditorialEntityPage entity={entity} preview={path.startsWith('/editorial/preview/')} /></PageFrame>
}

function EditorialLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    const user = await authProvider.signIn(email, password)
    setLoading(false)
    if (user) {
      window.location.href = '/editorial/review'
    } else {
      setError('Invalid email or password.')
    }
  }

  return (
    <div className="editorial-login">
      <form onSubmit={handleSubmit} className="editorial-login-form">
        <label htmlFor="editorial-email">Email</label>
        <input id="editorial-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <label htmlFor="editorial-password">Password</label>
        <input id="editorial-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
        {error && <p role="alert">{error}</p>}
      </form>
    </div>
  )
}

function EditorialSources() {
  const [filter, setFilter] = useState('All')
  const stats = { total: editorialSources.length, knownRights: editorialSources.filter((source) => source.copyrightStatus !== 'unknown').length, unknownRights: editorialSources.filter((source) => source.copyrightStatus === 'unknown').length }
  const filterMap: Record<string, string | undefined> = { All: undefined, Government: 'government', Academic: 'academic', Traditional: 'traditional-institution', 'Digital Library': 'digital-library', Manuscript: 'manuscript-archive', Other: 'other' }
  const visible = editorialSources.filter((source) => !filterMap[filter] || source.sourceType === filterMap[filter])
  return <div className="editorial-dashboard"><div className="card-grid"><ContentCard item={{ title: String(stats.total), description: 'Registered source records.', href: '/editorial/sources', eyebrow: 'Total sources' }} /><ContentCard item={{ title: String(stats.knownRights), description: 'Sources with recorded rights state.', href: '/editorial/sources', eyebrow: 'Rights recorded' }} /><ContentCard item={{ title: String(stats.unknownRights), description: 'Sources requiring rights review before reuse.', href: '/editorial/sources', eyebrow: 'Unknown rights' }} /></div><div className="filter-list" aria-label="Filter sources">{Object.keys(filterMap).map((option) => <button className={filter === option ? 'active' : ''} type="button" onClick={() => setFilter(option)} key={option}>{option}</button>)}</div><div className="entity-sections"><section><h2>Sources</h2>{visible.map((source) => <p key={source.id}><a href={`/sources/${source.id}`}>{source.name}</a> · {source.authorityLevel} · {source.copyrightStatus}</p>)}</section></div></div>
}

function ReviewQueue() { return <div className="editorial-dashboard"><div className="card-grid">{editorialEntities.filter((entity) => entity.status !== 'published').map((entity) => <ContentCard item={{ title: entity.title, description: `${entity.sourceIds.length} source(s) · ${entity.verification} · ${entity.publicationReadiness.blockers.length} blocker(s)`, href: `/editorial/content/${entity.type}/${entity.id}`, eyebrow: `${entity.type} · ${entity.status}` }} key={entity.id} />)}</div></div> }
function EvidenceCoveragePage() { return <div className="editorial-dashboard"><div className="card-grid"><ContentCard item={{ title: String(evidenceCoverage.filter((item) => item.statusLabel === 'STRONG').length), description: 'Records with evidence coverage.', href: '/editorial/evidence', eyebrow: 'Strong' }} /><ContentCard item={{ title: String(duplicateSuggestions.length), description: 'Duplicate or alias suggestions.', href: '/editorial/review', eyebrow: 'Quality suggestions' }} /></div><div className="entity-sections"><section><h2>Evidence coverage</h2>{evidenceCoverage.filter((item) => item.statusLabel !== 'NOT_APPLICABLE').map((item) => <p key={item.entityId}>{item.title} · {item.statusLabel} · {item.evidenceCount} evidence record(s)</p>)}</section><section><h2>Orphan diagnostics</h2>{orphanReports.filter((item) => item.classification !== 'VALID_ISOLATED_ENTITY').map((item) => <p key={item.entityId}>{item.title} · {item.classification}</p>)}</section></div></div> }
function EditorialEntityPage({ entity, preview }: { entity: (typeof editorialEntities)[number]; preview: boolean }) {
  const [state, setState] = useState<WorkflowState>((entity.workflowState as WorkflowState | undefined) ?? (entity.status === 'published' ? 'PUBLISHED' : 'DRAFT'))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [events, setEvents] = useState<WorkflowEvent[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [claimsData, setClaimsData] = useState<ClaimRecord[]>([])
  const [evidenceData, setEvidenceData] = useState<EvidenceRecord[]>([])
  const [claimsLoading, setClaimsLoading] = useState(false)
  const [claimsError, setClaimsError] = useState<string | null>(null)
  const [editingClaim, setEditingClaim] = useState<ClaimRecord | null>(null)
  const [newClaimMode, setNewClaimMode] = useState(false)
  const [claimForm, setClaimForm] = useState({ claim: '', claimType: 'textual' as ClaimRecord['claimType'], confidence: 'medium' as ClaimRecord['confidence'], status: 'draft' as ClaimRecord['status'], editorialNotes: '' })
  const [claimSaving, setClaimSaving] = useState(false)
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null)
  const [editingEvidenceId, setEditingEvidenceId] = useState<string | null>(null)
  const [editingEvidenceClaimId, setEditingEvidenceClaimId] = useState<string | null>(null)
  const [newEvidenceForClaimId, setNewEvidenceForClaimId] = useState<string | null>(null)
  const [evidenceForm, setEvidenceForm] = useState({ sourceId: '', location: '', evidenceType: 'primary-text' as EvidenceRecord['evidenceType'], confidence: 'medium' as EvidenceRecord['confidence'], reviewStatus: 'needs-review' as EvidenceRecord['reviewStatus'], perspective: undefined as EvidenceRecord['perspective'], notes: '' })
  const [evidenceSaving, setEvidenceSaving] = useState(false)
  const [evidenceSuccess, setEvidenceSuccess] = useState<string | null>(null)
  const [authenticated, setAuthenticated] = useState(authProvider.isAuthenticated())

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      setAuthenticated(authProvider.isAuthenticated())
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    let cancelled = false
    setError(null)
    loadWorkflowState(entity.id)
      .then((persistedState) => {
        if (!cancelled && persistedState) setState(persistedState)
      })
      .catch(() => {
        if (!cancelled) {
          // preserve existing initial state on load failure
        }
      })
    return () => {
      cancelled = true
    }
  }, [entity.id])

  useEffect(() => {
    let cancelled = false
    setHistoryLoading(true)
    setHistoryError(null)
    loadWorkflowEvents(entity.id)
      .then((items) => {
        if (!cancelled) setEvents(items)
      })
      .catch((err) => {
        if (!cancelled) setHistoryError(err instanceof Error ? err.message : 'Failed to load workflow history.')
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [entity.id])

  useEffect(() => {
    let cancelled = false
    setClaimsLoading(true)
    setClaimsError(null)
    loadClaims(entity.id)
      .then((items) => {
        if (!cancelled) setClaimsData(items)
      })
      .catch((err) => {
        if (!cancelled) setClaimsError(err instanceof Error ? err.message : 'Failed to load claims.')
      })
      .finally(() => {
        if (!cancelled) setClaimsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [entity.id])

  useEffect(() => {
    let cancelled = false
    loadEvidence(entity.id)
      .then((items) => {
        if (!cancelled) setEvidenceData(items)
      })
      .catch(() => {
        if (!cancelled) {
          // preserve empty evidence state on load failure
        }
      })
    return () => {
      cancelled = true
    }
  }, [entity.id])

  const currentReadiness = readiness[entity.id]
  const entityClaims = claimsData
  const entityEvidence = evidenceData
  const nextStates = (['DISCOVERED', 'RESEARCHING', 'DRAFT', 'SOURCE_CHECK', 'EDITORIAL_REVIEW', 'TRADITIONAL_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'] as WorkflowState[]).filter((next) => canTransition(state, next))

  const handleTransition = async (next: WorkflowState) => {
    if (!authProvider.isAuthenticated()) {
      setError('You must be signed in to change workflow state.')
      return
    }
    const user = authProvider.getCurrentUser()
    if (!user) {
      setError('You must be signed in to change workflow state.')
      return
    }
    if (!canTransition(state, next)) {
      setError('Invalid transition.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const event = transition({ previousState: state, newState: next, actor: user.id, action: 'transition', entityId: entity.id })
      await applyWorkflowTransition(entity.id, next, event.action, event.reason)
      setState(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save workflow change.')
    } finally {
      setSaving(false)
    }
  }

  const startEditClaim = (claim: ClaimRecord) => {
    setEditingClaim(claim)
    setClaimForm({ claim: claim.claim, claimType: claim.claimType, confidence: claim.confidence, status: claim.status, editorialNotes: claim.editorialNotes ?? '' })
    setClaimSuccess(null)
  }

  const startNewClaim = () => {
    setEditingClaim(null)
    setNewClaimMode(true)
    setClaimForm({ claim: '', claimType: 'textual', confidence: 'medium', status: 'draft', editorialNotes: '' })
    setClaimSuccess(null)
  }

  const cancelNewClaim = () => {
    setNewClaimMode(false)
    setEditingClaim(null)
    setClaimForm({ claim: '', claimType: 'textual', confidence: 'medium', status: 'draft', editorialNotes: '' })
    setClaimSuccess(null)
  }

  const handleSaveClaim = async () => {
    if (!authProvider.isAuthenticated()) {
      setClaimsError('You must be signed in to edit claims.')
      return
    }
    setClaimSaving(true)
    setClaimSuccess(null)
    try {
      const saved = await saveClaim({ ...claimForm, id: editingClaim?.id ?? '', entityId: entity.id })
      await loadClaims(entity.id).then((items) => setClaimsData(items))
      setClaimSuccess(`Claim ${editingClaim ? 'updated' : 'created'}: ${saved.id}`)
      setEditingClaim(null)
      setNewClaimMode(false)
      setClaimForm({ claim: '', claimType: 'textual', confidence: 'medium', status: 'draft', editorialNotes: '' })
    } catch (err) {
      setClaimsError(err instanceof Error ? err.message : 'Failed to save claim.')
    } finally {
      setClaimSaving(false)
    }
  }

  const startEditEvidence = (evidence: EvidenceRecord) => {
    setEditingEvidenceId(evidence.id)
    setEditingEvidenceClaimId(evidence.claimId ?? null)
    setNewEvidenceForClaimId(null)
    setEvidenceForm({ sourceId: evidence.sourceId, location: evidence.location ?? '', evidenceType: evidence.evidenceType, confidence: evidence.confidence, reviewStatus: evidence.reviewStatus, perspective: evidence.perspective, notes: evidence.notes ?? '' })
    setEvidenceSuccess(null)
  }

  const startNewEvidence = (claimId: string) => {
    setEditingEvidenceId(null)
    setNewEvidenceForClaimId(claimId)
    setEvidenceForm({ sourceId: '', location: '', evidenceType: 'primary-text', confidence: 'medium', reviewStatus: 'needs-review', perspective: undefined, notes: '' })
    setEvidenceSuccess(null)
  }

  const cancelEvidenceForm = () => {
    setEditingEvidenceId(null)
    setEditingEvidenceClaimId(null)
    setNewEvidenceForClaimId(null)
    setEvidenceForm({ sourceId: '', location: '', evidenceType: 'primary-text', confidence: 'medium', reviewStatus: 'needs-review', perspective: undefined, notes: '' })
    setEvidenceSuccess(null)
  }

  const handleSaveEvidence = async () => {
    if (!authProvider.isAuthenticated()) {
      setClaimsError('You must be signed in to edit evidence.')
      return
    }
    setEvidenceSaving(true)
    setEvidenceSuccess(null)
    try {
      const claimId = newEvidenceForClaimId ?? editingEvidenceClaimId
      if (!claimId) {
        throw new Error('Missing claim ID for evidence.')
      }
      const saved = await saveEvidence({ ...evidenceForm, id: editingEvidenceId ?? '', entityId: entity.id, claimId })
      await loadEvidence(entity.id).then((items) => setEvidenceData(items))
      setEvidenceSuccess(`Evidence ${editingEvidenceId ? 'updated' : 'created'}: ${saved.id}`)
      cancelEvidenceForm()
    } catch (err) {
      setClaimsError(err instanceof Error ? err.message : 'Failed to save evidence.')
    } finally {
      setEvidenceSaving(false)
    }
  }

  return <div className="editorial-workspace">
    <div className="preview-banner">{preview ? 'UNPUBLISHED / EDITORIAL PREVIEW' : 'INTERNAL EDITORIAL WORKSPACE'}</div>
    <div className="entity-meta"><span>{entity.type}</span><span>{state}</span><span>{entity.verification}</span></div>
    <p className="entity-description">{entity.description}</p>
    <section className="entity-sections">
      <section>
        <h2>Publication readiness</h2>
        <p>{currentReadiness.publishable ? 'READY' : 'BLOCKED'} · {currentReadiness.blockers.length} blocker(s)</p>
        {currentReadiness.blockers.map((item) => <p key={item.code}>{item.message}</p>)}
      </section>
      <section>
        <h2>Claims & evidence</h2>
        {claimsLoading && <p>Loading claims...</p>}
        {claimsError && <p role="alert">{claimsError}</p>}
        {!claimsLoading && !claimsError && (
          <div className="claims-list">
            {newClaimMode && (
              <div className="claim-item claim-unsupported">
                <div className="claim-form">
                  <label htmlFor="new-claim">Claim</label>
                  <textarea id="new-claim" value={claimForm.claim} onChange={(event) => setClaimForm((form) => ({ ...form, claim: event.target.value }))} required />
                  <label htmlFor="new-claim-type">Claim type</label>
                  <select id="new-claim-type" value={claimForm.claimType} onChange={(event) => setClaimForm((form) => ({ ...form, claimType: event.target.value as ClaimRecord['claimType'] }))}>
                    {(['definition', 'textual', 'historical', 'traditional', 'linguistic', 'ritual', 'philosophical', 'geographical', 'biographical', 'bibliographical'] as ClaimRecord['claimType'][]).map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                  <label htmlFor="new-confidence">Confidence</label>
                  <select id="new-confidence" value={claimForm.confidence} onChange={(event) => setClaimForm((form) => ({ ...form, confidence: event.target.value as ClaimRecord['confidence'] }))}>
                    {(['high', 'medium', 'low', 'uncertain'] as ClaimRecord['confidence'][]).map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                  <label htmlFor="new-status">Status</label>
                  <select id="new-status" value={claimForm.status} onChange={(event) => setClaimForm((form) => ({ ...form, status: event.target.value as ClaimRecord['status'] }))}>
                    {(['discovered', 'researching', 'draft', 'source-check', 'editorial-review', 'traditional-review', 'approved', 'published'] as ClaimRecord['status'][]).map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                  <label htmlFor="new-notes">Editorial notes</label>
                  <textarea id="new-notes" value={claimForm.editorialNotes} onChange={(event) => setClaimForm((form) => ({ ...form, editorialNotes: event.target.value }))} />
                  <div className="filter-list">
                    <button type="button" disabled={claimSaving} onClick={handleSaveClaim}>{claimSaving ? 'Saving...' : 'Save'}</button>
                    <button type="button" onClick={cancelNewClaim}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
            {entityClaims.length === 0 && !newClaimMode && <p>No persisted claims found for this entity.</p>}
            {entityClaims.map((claim) => {
              const claimEvidence = entityEvidence.filter((item) => claim.evidenceIds.includes(item.id) || item.entityId === entity.id)
              const hasEvidence = claimEvidence.length > 0
              const isEditing = editingClaim?.id === claim.id
              if (isEditing) {
                return (
                  <div key={claim.id} className={`claim-item${hasEvidence ? ' claim-supported' : ' claim-unsupported'}`}>
                    <div className="claim-form">
                      <label htmlFor={`claim-${claim.id}`}>Claim</label>
                      <textarea id={`claim-${claim.id}`} value={claimForm.claim} onChange={(event) => setClaimForm((form) => ({ ...form, claim: event.target.value }))} required />
                      <label htmlFor={`claim-type-${claim.id}`}>Claim type</label>
                      <select id={`claim-type-${claim.id}`} value={claimForm.claimType} onChange={(event) => setClaimForm((form) => ({ ...form, claimType: event.target.value as ClaimRecord['claimType'] }))}>
                        {(['definition', 'textual', 'historical', 'traditional', 'linguistic', 'ritual', 'philosophical', 'geographical', 'biographical', 'bibliographical'] as ClaimRecord['claimType'][]).map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                      <label htmlFor={`confidence-${claim.id}`}>Confidence</label>
                      <select id={`confidence-${claim.id}`} value={claimForm.confidence} onChange={(event) => setClaimForm((form) => ({ ...form, confidence: event.target.value as ClaimRecord['confidence'] }))}>
                        {(['high', 'medium', 'low', 'uncertain'] as ClaimRecord['confidence'][]).map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                      <label htmlFor={`status-${claim.id}`}>Status</label>
                      <select id={`status-${claim.id}`} value={claimForm.status} onChange={(event) => setClaimForm((form) => ({ ...form, status: event.target.value as ClaimRecord['status'] }))}>
                        {(['discovered', 'researching', 'draft', 'source-check', 'editorial-review', 'traditional-review', 'approved', 'published'] as ClaimRecord['status'][]).map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                      <label htmlFor={`notes-${claim.id}`}>Editorial notes</label>
                      <textarea id={`notes-${claim.id}`} value={claimForm.editorialNotes} onChange={(event) => setClaimForm((form) => ({ ...form, editorialNotes: event.target.value }))} />
                      <div className="filter-list">
                        <button type="button" disabled={claimSaving} onClick={handleSaveClaim}>{claimSaving ? 'Saving...' : 'Save'}</button>
                        <button type="button" onClick={() => setEditingClaim(null)}>Cancel</button>
                      </div>
                    </div>
                  </div>
                )
              }
              return (
                <div key={claim.id} className={`claim-item${hasEvidence ? ' claim-supported' : ' claim-unsupported'}`}>
                  <div className="claim-header">
                    <span className="claim-type">{claim.claimType}</span>
                    <span className={`claim-confidence claim-confidence-${claim.confidence}`}>{claim.confidence}</span>
                    <span className="claim-status">{claim.status}</span>
                    <button type="button" onClick={() => startEditClaim(claim)}>Edit</button>
                  </div>
                  <p className="claim-text">{claim.claim}</p>
                  {claim.editorialNotes && <p className="claim-notes">{claim.editorialNotes}</p>}
                  <div className="claim-evidence">
                    <strong>{hasEvidence ? 'Evidence' : 'No evidence'}</strong>
                    {claimEvidence.length === 0 && <span className="evidence-missing"> — claims require supporting evidence before publication.</span>}
                    {claimEvidence.map((item) => (
                      <div key={item.id} className="evidence-item">
                        <span className="evidence-type">{item.evidenceType}</span>
                        <span className="evidence-confidence">{item.confidence}</span>
                        <span className="evidence-status">{item.reviewStatus}</span>
                        {item.sourceId && <span className="evidence-source">Source: {item.sourceId}</span>}
                        {item.location && <span className="evidence-location">{item.location}</span>}
                        {item.notes && <p className="evidence-notes">{item.notes}</p>}
                        <div className="filter-list">
                          <button type="button" onClick={() => startEditEvidence(item)}>Edit</button>
                        </div>
                      </div>
                    ))}
                    <div className="filter-list">
                      <button type="button" onClick={() => startNewEvidence(claim.id)}>Add evidence</button>
                    </div>
                    {((editingEvidenceId && claimEvidence.some((item) => item.id === editingEvidenceId)) || newEvidenceForClaimId === claim.id) && (
                      <div className="evidence-form">
                        <label htmlFor={`evidence-source-${claim.id}`}>Source ID</label>
                        <input id={`evidence-source-${claim.id}`} value={evidenceForm.sourceId} onChange={(event) => setEvidenceForm((form) => ({ ...form, sourceId: event.target.value }))} required />
                        <label htmlFor={`evidence-location-${claim.id}`}>Location</label>
                        <input id={`evidence-location-${claim.id}`} value={evidenceForm.location} onChange={(event) => setEvidenceForm((form) => ({ ...form, location: event.target.value }))} />
                        <label htmlFor={`evidence-type-${claim.id}`}>Evidence type</label>
                        <select id={`evidence-type-${claim.id}`} value={evidenceForm.evidenceType} onChange={(event) => setEvidenceForm((form) => ({ ...form, evidenceType: event.target.value as EvidenceRecord['evidenceType'] }))}>
                          {(['primary-text', 'secondary-source', 'traditional-account', 'scholarly-interpretation', 'modern-interpretation', 'regional-tradition'] as EvidenceRecord['evidenceType'][]).map((option) => <option key={option} value={option}>{option}</option>)}
                        </select>
                        <label htmlFor={`evidence-confidence-${claim.id}`}>Confidence</label>
                        <select id={`evidence-confidence-${claim.id}`} value={evidenceForm.confidence} onChange={(event) => setEvidenceForm((form) => ({ ...form, confidence: event.target.value as EvidenceRecord['confidence'] }))}>
                          {(['high', 'medium', 'low', 'uncertain'] as EvidenceRecord['confidence'][]).map((option) => <option key={option} value={option}>{option}</option>)}
                        </select>
                        <label htmlFor={`evidence-review-${claim.id}`}>Review status</label>
                        <select id={`evidence-review-${claim.id}`} value={evidenceForm.reviewStatus} onChange={(event) => setEvidenceForm((form) => ({ ...form, reviewStatus: event.target.value as EvidenceRecord['reviewStatus'] }))}>
                          {(['needs-review', 'in-review', 'accepted', 'rejected', 'conflict'] as EvidenceRecord['reviewStatus'][]).map((option) => <option key={option} value={option}>{option}</option>)}
                        </select>
                        <label htmlFor={`evidence-perspective-${claim.id}`}>Perspective</label>
                        <select id={`evidence-perspective-${claim.id}`} value={evidenceForm.perspective} onChange={(event) => setEvidenceForm((form) => ({ ...form, perspective: event.target.value as EvidenceRecord['perspective'] }))}>
                          <option value="">None</option>
                          {(['traditional-account', 'historical-scholarly-account', 'modern-interpretation', 'regional-tradition', 'sampradaya-specific'] as EvidenceRecord['perspective'][]).map((option) => <option key={option} value={option}>{option}</option>)}
                        </select>
                        <label htmlFor={`evidence-notes-${claim.id}`}>Notes</label>
                        <textarea id={`evidence-notes-${claim.id}`} value={evidenceForm.notes} onChange={(event) => setEvidenceForm((form) => ({ ...form, notes: event.target.value }))} />
                        <div className="filter-list">
                          <button type="button" disabled={evidenceSaving} onClick={handleSaveEvidence}>{evidenceSaving ? 'Saving...' : 'Save'}</button>
                          <button type="button" onClick={cancelEvidenceForm}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            {!newClaimMode && (
              <div className="filter-list">
                <button type="button" onClick={startNewClaim}>Add claim</button>
              </div>
            )}
            {claimSuccess && <p role="status">{claimSuccess}</p>}
            {evidenceSuccess && <p role="status">{evidenceSuccess}</p>}
          </div>
        )}
      </section>
      <section>
        <h2>Workflow</h2>
        <div className="filter-list">
          {nextStates.map((next) => <button type="button" disabled={(next === 'PUBLISHED' && !currentReadiness.publishable) || saving || !authenticated} onClick={() => handleTransition(next)} key={next}>Move to {next}</button>)}
        </div>
        {error && <p role="alert">{error}</p>}
      </section>
      <section>
        <h2>Workflow history</h2>
        {historyLoading && <p>Loading workflow history...</p>}
        {historyError && <p role="alert">{historyError}</p>}
        {!historyLoading && !historyError && (
          <div className="workflow-history">
            {events.length === 0 && <p>No workflow events recorded yet.</p>}
            {events.map((event) => (
              <div key={event.id} className="workflow-history-item">
                <span className="workflow-history-time">{new Date(event.timestamp).toLocaleString()}</span>
                <span className="workflow-history-states">{event.previousState} → {event.newState}</span>
                <span className="workflow-history-action">{event.action}</span>
                {event.reason && <span className="workflow-history-reason">{event.reason}</span>}
                <span className="workflow-history-actor">{event.actor}</span>
              </div>
            ))}
          </div>
        )}
      </section>
      <section>
        <h2>Relationships</h2>
        {relationships.filter((relationship) => relationship.from === entity.id || relationship.to === entity.id).map((relationship) => <p key={relationship.id}>{relationship.relationship}: {relationship.from === entity.id ? relationship.to : relationship.from}</p>)}
      </section>
    </section>
  </div>
}
