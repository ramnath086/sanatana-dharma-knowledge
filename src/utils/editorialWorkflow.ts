import type { WorkflowEvent, WorkflowState, ClaimRecord, EvidenceRecord } from '../types/editorial'
import { workflowTransitions } from '../types/editorial'
import { supabase } from './supabaseClient'

function camelizeKeys(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())] = obj[key]
    }
  }
  return result
}

export function canTransition(from: WorkflowState, to: WorkflowState) { return workflowTransitions[from].includes(to) }
export function transition(event: Omit<WorkflowEvent, 'id' | 'timestamp'>): WorkflowEvent {
  if (!canTransition(event.previousState, event.newState)) throw new Error(`Invalid editorial transition: ${event.previousState} -> ${event.newState}`)
  return { ...event, id: `${event.entityId}-${Date.now()}`, timestamp: new Date().toISOString() }
}

export async function loadWorkflowState(entityId: string): Promise<WorkflowState | null> {
  const { data, error } = await supabase.from('editorial_workflow_state').select('workflow_state').eq('entity_id', entityId).maybeSingle()
  if (error) throw new Error(`Failed to load workflow state: ${error.message}`)
  return data?.workflow_state ?? null
}

export async function loadWorkflowEvents(entityId: string): Promise<WorkflowEvent[]> {
  const { data, error } = await supabase
    .from('editorial_workflow_events')
    .select('*')
    .eq('entity_id', entityId)
    .order('timestamp', { ascending: true })
  if (error) throw new Error(`Failed to load workflow events: ${error.message}`)
  return (data ?? []) as WorkflowEvent[]
}

export async function applyWorkflowTransition(entityId: string, newState: WorkflowState, action = 'transition', reason?: string): Promise<void> {
  const { error } = await supabase.rpc('apply_workflow_transition', {
    _entity_id: entityId,
    _new_state: newState,
    _action: action,
    _reason: reason ?? null,
  })
  if (error) throw new Error(`Failed to apply workflow transition: ${error.message}`)
}

export async function loadClaims(entityId: string): Promise<ClaimRecord[]> {
  const { data, error } = await supabase
    .from('editorial_claims')
    .select('*')
    .eq('entity_id', entityId)
    .order('claim_type', { ascending: true })
  if (error) throw new Error(`Failed to load claims: ${error.message}`)
  return (data ?? []).map(camelizeKeys) as unknown as ClaimRecord[]
}

export async function loadEvidence(entityId: string): Promise<EvidenceRecord[]> {
  const { data, error } = await supabase
    .from('editorial_evidence')
    .select('*')
    .eq('entity_id', entityId)
    .order('evidence_type', { ascending: true })
  if (error) throw new Error(`Failed to load evidence: ${error.message}`)
  return (data ?? []).map(camelizeKeys) as unknown as EvidenceRecord[]
}

export async function saveEvidence(evidence: Partial<EvidenceRecord> & { entityId: string; claimId: string; sourceId: string; evidenceType: EvidenceRecord['evidenceType']; confidence: EvidenceRecord['confidence']; reviewStatus: EvidenceRecord['reviewStatus'] }): Promise<EvidenceRecord> {
  const payload = {
    entity_id: evidence.entityId,
    claim_id: evidence.claimId,
    source_id: evidence.sourceId,
    location: evidence.location ?? null,
    evidence_type: evidence.evidenceType,
    confidence: evidence.confidence,
    review_status: evidence.reviewStatus,
    perspective: evidence.perspective ?? null,
    notes: evidence.notes ?? null,
    updated_at: new Date().toISOString(),
  }

  if (evidence.id) {
    const { data, error } = await supabase
      .from('editorial_evidence')
      .update(payload)
      .eq('id', evidence.id)
      .select('*')
      .single()
    if (error) throw new Error(`Failed to update evidence: ${error.message}`)
    return camelizeKeys(data) as unknown as EvidenceRecord
  }

  const id = `evidence-${evidence.entityId}-${Date.now()}`
  const { data, error } = await supabase
    .from('editorial_evidence')
    .insert({ ...payload, id })
    .select('*')
    .single()
  if (error) throw new Error(`Failed to create evidence: ${error.message}`)
  return camelizeKeys(data) as unknown as EvidenceRecord
}

export async function saveClaim(claim: Partial<ClaimRecord> & { entityId: string; claim: string; claimType: ClaimRecord['claimType']; status: ClaimRecord['status']; confidence: ClaimRecord['confidence'] }): Promise<ClaimRecord> {
  const payload = {
    entity_id: claim.entityId,
    claim: claim.claim,
    claim_type: claim.claimType,
    source_ids: claim.sourceIds ?? [],
    evidence_ids: claim.evidenceIds ?? [],
    status: claim.status,
    confidence: claim.confidence,
    editorial_notes: claim.editorialNotes ?? null,
    conflict_group_id: claim.conflictGroupId ?? null,
    updated_at: new Date().toISOString(),
  }

  if (claim.id) {
    const { data, error } = await supabase
      .from('editorial_claims')
      .update(payload)
      .eq('id', claim.id)
      .select('*')
      .single()
    if (error) throw new Error(`Failed to update claim: ${error.message}`)
    return camelizeKeys(data) as unknown as ClaimRecord
  }

  const id = `claim-${claim.entityId}-${Date.now()}`
  const { data, error } = await supabase
    .from('editorial_claims')
    .insert({ ...payload, id })
    .select('*')
    .single()
  if (error) throw new Error(`Failed to create claim: ${error.message}`)
  return camelizeKeys(data) as unknown as ClaimRecord
}
