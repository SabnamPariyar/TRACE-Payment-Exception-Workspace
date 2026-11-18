import { describe, it, expect } from 'vitest';
import { initialPayments } from './data';
import { applyWorkflowAction, availableActions, canAct } from './workflow';

describe('payment review workflow', () => {
  const flagged = initialPayments[0];
  it('starts investigation and requests a second-person review', () => {
    const investigating = applyWorkflowAction(flagged, 'analyst', 'investigate');
    expect(investigating.status).toBe('investigating');
    const pending = applyWorkflowAction(investigating, 'analyst', 'request_review', 'Evidence checked against the earlier transaction.');
    expect(pending.status).toBe('review_requested');
    expect(pending.requestedBy).toBe('Mika Laine');
    const approved = applyWorkflowAction(pending, 'approver', 'approve');
    expect(approved.status).toBe('approved');
    expect(approved.audit.at(-1)?.actor).toBe('Leena Berg');
    const resolved = applyWorkflowAction(approved, 'analyst', 'resolve');
    expect(resolved.status).toBe('resolved');
    expect(resolved.audit).toHaveLength(flagged.audit.length + 4);
  });
  it('never allows an auditor to mutate payments', () => {
    expect(availableActions(flagged, 'auditor')).toEqual([]);
    expect(() => applyWorkflowAction(flagged, 'auditor', 'approve')).toThrow();
  });
  it('blocks self-approval and invalid transitions', () => {
    const pending = { ...flagged, status: 'review_requested' as const, requestedBy: 'Leena Berg' };
    expect(canAct(pending, 'approver', 'approve')).toBe(false);
    expect(() => applyWorkflowAction(flagged, 'analyst', 'resolve')).toThrow();
  });
  it('requires an explanation for consequential review actions', () => {
    const investigating = applyWorkflowAction(flagged, 'analyst', 'investigate');
    expect(() => applyWorkflowAction(investigating, 'analyst', 'request_review', 'ok')).toThrow();
  });
  it('preserves the source record rather than mutating it', () => {
    const changed = applyWorkflowAction(flagged, 'analyst', 'investigate');
    expect(changed).not.toBe(flagged);
    expect(flagged.status).toBe('flagged');
    expect(changed.audit).not.toBe(flagged.audit);
  });
});
