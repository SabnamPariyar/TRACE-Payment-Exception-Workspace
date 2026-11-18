import { people, type AuditEntry, type Payment, type Role } from './data';

export type WorkflowAction = 'investigate' | 'request_review' | 'hold' | 'approve' | 'reject' | 'resolve';

export function canAct(payment: Payment, role: Role, action: WorkflowAction): boolean {
  if (role === 'auditor') return false;
  if (role === 'analyst') {
    if (action === 'investigate') return payment.status === 'flagged';
    if (action === 'request_review') return payment.status === 'investigating';
    if (action === 'hold') return ['flagged', 'investigating'].includes(payment.status);
    if (action === 'resolve') return payment.status === 'approved';
    return false;
  }
  if (role === 'approver' && payment.status === 'review_requested' && payment.requestedBy !== people.approver.name) {
    return action === 'approve' || action === 'reject';
  }
  return false;
}

const labels: Record<WorkflowAction, string> = {
  investigate: 'Investigation started',
  request_review: 'Review requested',
  hold: 'Case placed on hold',
  approve: 'Approved for next step',
  reject: 'Review rejected',
  resolve: 'Case resolved'
};

const nextStatuses: Record<WorkflowAction, Payment['status']> = {
  investigate: 'investigating',
  request_review: 'review_requested',
  hold: 'held',
  approve: 'approved',
  reject: 'rejected',
  resolve: 'resolved'
};

export function applyWorkflowAction(
  payment: Payment, role: Role, action: WorkflowAction, note = '', at = new Date().toISOString()
): Payment {
  if (!canAct(payment, role, action)) throw new Error('This role cannot perform that action in the current case state.');
  const cleanNote = note.trim();
  if (['request_review', 'hold', 'reject'].includes(action) && cleanNote.length < 8) {
    throw new Error('Add a reason of at least eight characters to document the decision.');
  }
  const actor = people[role].name;
  const entry: AuditEntry = {
    id: `${payment.id}-${payment.audit.length + 1}-${action}`,
    at, actor, action: labels[action],
    detail: cleanNote || (action === 'approve' ? 'Approved in the prototype. No payment was executed.' : 'State updated in the demonstration.')
  };
  return {
    ...payment,
    status: nextStatuses[action],
    requestedBy: action === 'request_review' ? actor : payment.requestedBy,
    reviewerNote: action === 'request_review' ? cleanNote : payment.reviewerNote,
    audit: [...payment.audit, entry]
  };
}

export const actionLabels: Record<WorkflowAction, string> = {
  investigate: 'Start investigation',
  request_review: 'Request approval',
  hold: 'Place on hold',
  approve: 'Approve resolution',
  reject: 'Reject request',
  resolve: 'Close resolved case'
};

export function availableActions(payment: Payment, role: Role): WorkflowAction[] {
  return (Object.keys(actionLabels) as WorkflowAction[]).filter(action => canAct(payment, role, action));
}
