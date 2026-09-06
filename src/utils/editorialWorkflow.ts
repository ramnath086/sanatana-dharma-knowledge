import type { WorkflowEvent, WorkflowState } from '../types/editorial'
import { workflowTransitions } from '../types/editorial'

export function canTransition(from: WorkflowState, to: WorkflowState) { return workflowTransitions[from].includes(to) }
export function transition(event: Omit<WorkflowEvent, 'id' | 'timestamp'>): WorkflowEvent {
  if (!canTransition(event.previousState, event.newState)) throw new Error(`Invalid editorial transition: ${event.previousState} -> ${event.newState}`)
  return { ...event, id: `${event.entityId}-${Date.now()}`, timestamp: new Date().toISOString() }
}