export type Role = 'analyst' | 'approver' | 'auditor';
export type PaymentStatus = 'flagged' | 'investigating' | 'review_requested' | 'approved' | 'held' | 'rejected' | 'resolved';
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';
export type ExceptionKind = 'duplicate' | 'beneficiary' | 'cutoff' | 'approval' | 'reference' | 'amount';

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  detail: string;
}

export interface Payment {
  id: string;
  reference: string;
  entity: string;
  country: string;
  beneficiary: string;
  beneficiaryAccount: string;
  currency: 'EUR' | 'SEK' | 'GBP' | 'USD';
  amountMinor: number;
  source: string;
  risk: RiskLevel;
  kind: ExceptionKind;
  status: PaymentStatus;
  cutoff: string;
  received: string;
  reason: string;
  evidence: string[];
  reviewerNote?: string;
  requestedBy?: string;
  audit: AuditEntry[];
}

export const people: Record<Role, { name: string; title: string; initials: string }> = {
  analyst: { name: 'Mika Laine', title: 'Treasury analyst', initials: 'ML' },
  approver: { name: 'Leena Berg', title: 'Payment approver', initials: 'LB' },
  auditor: { name: 'Alex Niemi', title: 'Read-only auditor', initials: 'AN' }
};

export const statusLabels: Record<PaymentStatus, string> = {
  flagged: 'Flagged', investigating: 'Investigating', review_requested: 'Review requested',
  approved: 'Approved', held: 'On hold', rejected: 'Rejected', resolved: 'Resolved'
};

export const riskLabels: Record<RiskLevel, string> = {
  critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low'
};

export const kindLabels: Record<ExceptionKind, string> = {
  duplicate: 'Possible duplicate', beneficiary: 'Beneficiary mismatch',
  cutoff: 'Bank cutoff at risk', approval: 'Approval required',
  reference: 'Missing reference', amount: 'Unusual amount'
};

const seed = (
  id: string, entity: string, country: string, beneficiary: string,
  amountMinor: number, currency: Payment['currency'], kind: ExceptionKind,
  risk: RiskLevel, status: PaymentStatus, cutoff: string, reason: string,
  evidence: string[], source = 'ERP · SAP S/4HANA'
): Payment => ({
  id,
  reference: 'INV-' + id.slice(-4) + '-26',
  entity, country, beneficiary, amountMinor, currency, kind, risk, status, cutoff, reason, evidence, source,
  beneficiaryAccount: 'FI•• •••• •••• ' + id.slice(-4),
  received: '2026-11-18T08:41:00+02:00',
  requestedBy: status === 'review_requested' || status === 'approved' ? people.analyst.name : undefined,
  audit: [
    { id: id + '-a', at: '2026-11-18T08:41:00+02:00', actor: 'System', action: 'Batch imported', detail: 'Payment imported from the fictional ERP source.' },
    { id: id + '-b', at: '2026-11-18T08:42:00+02:00', actor: 'Rule engine', action: kindLabels[kind] + ' detected', detail: reason },
    ...(status === 'review_requested' || status === 'approved' ? [
      { id: id + '-c', at: '2026-11-18T09:12:00+02:00', actor: people.analyst.name, action: 'Review requested', detail: 'Supporting evidence submitted for a separate approver.' }
    ] : []),
    ...(status === 'approved' ? [
      { id: id + '-d', at: '2026-11-18T09:35:00+02:00', actor: people.approver.name, action: 'Approved for next step', detail: 'Simulation only. No bank instruction was sent.' }
    ] : [])
  ]
});

export const initialPayments: Payment[] = [
  seed('PAY-2048', 'Northstar Components Oy', 'Finland', 'Arctic Supply AB', 1845000, 'EUR', 'duplicate', 'critical', 'flagged', '2026-11-18T12:00:00+02:00', 'A similar payment with matching beneficiary, amount and invoice reference was submitted earlier.', [
    'Matches previous payment PAY-1984 for €18,450.00.',
    'Same beneficiary and invoice reference: INV-2048-26.',
    'Previous payment was marked sent at 08:15 EET.'
  ]),
  seed('PAY-2051', 'Nordwerk GmbH', 'Germany', 'Baltic Freight GmbH', 4280000, 'EUR', 'approval', 'high', 'review_requested', '2026-11-18T13:30:00+02:00', 'The batch exceeds the local approval threshold and awaits a second reviewer.', [
    'Payment amount exceeds the fictional €25,000 approval threshold.',
    'First review was submitted by Mika Laine.',
    'A second authorized person must decide.'
  ]),
  seed('PAY-2056', 'Sveca Industries AB', 'Sweden', 'Lindholm Logistics', 127500000, 'SEK', 'cutoff', 'critical', 'flagged', '2026-11-18T11:30:00+02:00', 'The destination bank cutoff is approaching and the payment has not cleared validation.', [
    'Cutoff time shown is a fictional training deadline.',
    'An outstanding validation issue prevents simulated submission.',
    'Urgency is based on the sample cutoff and case state.'
  ], 'ERP · Microsoft Dynamics'),
  seed('PAY-2060', 'Northstar Components Oy', 'Finland', 'Metsä Parts Oy', 685200, 'EUR', 'beneficiary', 'high', 'investigating', '2026-11-18T15:00:00+02:00', 'The saved beneficiary account differs from the account in the incoming payment file.', [
    'The account suffix on file is 7441.',
    'The approved beneficiary record has suffix 1128.',
    'No account changes can be made within this demo.'
  ]),
  seed('PAY-2063', 'Northstar UK Ltd', 'United Kingdom', 'Orion Consulting Ltd', 920000, 'GBP', 'reference', 'medium', 'flagged', '2026-11-18T17:30:00+02:00', 'The invoice reference is incomplete and needs confirmation before payment review.', [
    'Source reference is INV-2063.',
    'The mock accounts payable record expects a longer reference.'
  ], 'ERP · Oracle'),
  seed('PAY-2065', 'Nordwerk GmbH', 'Germany', 'Elbe Machinery', 8735000, 'EUR', 'amount', 'high', 'review_requested', '2026-11-18T14:30:00+02:00', 'The payment amount is higher than comparable fictional supplier payments.', [
    'Typical range in this sample: €15,000–€45,000.',
    'Current amount: €87,350.00.',
    'This is a modelled rule, not real fraud detection.'
  ]),
  seed('PAY-2071', 'Sveca Industries AB', 'Sweden', 'Göta Components AB', 32500000, 'SEK', 'approval', 'medium', 'approved', '2026-11-18T16:00:00+02:00', 'The approval chain was completed and the analyst can close the demo case.', [
    'Approval was provided by Leena Berg.',
    'No payment was transmitted to a bank.'
  ]),
  seed('PAY-2074', 'Northstar Components Oy', 'Finland', 'Lakeview Office Oy', 41000, 'EUR', 'reference', 'low', 'resolved', '2026-11-19T12:00:00+02:00', 'A missing reference was clarified in this fictional resolved case.', [
    'Reference confirmed and case marked resolved.'
  ]),
  seed('PAY-2076', 'Northstar UK Ltd', 'United Kingdom', 'Westhaven Tools', 740000, 'GBP', 'beneficiary', 'medium', 'held', '2026-11-19T14:00:00+02:00', 'The case was placed on hold pending beneficiary verification.', [
    'Beneficiary information requires external confirmation.',
    'The held status does not imply the account is unsafe.'
  ]),
  seed('PAY-2079', 'Nordwerk GmbH', 'Germany', 'Alpine Services', 2190000, 'EUR', 'duplicate', 'high', 'investigating', '2026-11-18T14:00:00+02:00', 'Two records share a similar invoice reference and need investigation.', [
    'Matching reference found in archived sample PAY-1912.',
    'Different invoice issue dates may explain the match.'
  ]),
  seed('PAY-2081', 'Northstar Components Oy', 'Finland', 'Nordic Packaging Oy', 138500, 'EUR', 'approval', 'low', 'resolved', '2026-11-19T11:00:00+02:00', 'The simulated approval workflow was completed earlier.', [
    'Resolution recorded in the demonstration history.'
  ]),
  seed('PAY-2084', 'Sveca Industries AB', 'Sweden', 'Skane Engineering AB', 55900000, 'SEK', 'amount', 'medium', 'review_requested', '2026-11-18T16:30:00+02:00', 'The payment triggered an amount variance rule and awaits review.', [
    'Rule threshold exceeded in the fictional sample.',
    'The approver can view the variance before deciding.'
  ])
];

export function formatMoney(amountMinor: number, currency: Payment['currency']): string {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amountMinor / 100);
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Helsinki' }).format(new Date(iso)) + ' EET';
}

export function makeExplanation(payment: Payment): { summary: string; why: string[]; caution: string } {
  const summaries: Record<ExceptionKind, string> = {
    duplicate: 'A similarity rule found an earlier transaction that may represent the same obligation.',
    beneficiary: 'Beneficiary details from the source file do not fully match the stored record.',
    cutoff: 'The payment is not ready, and a configured submission deadline is approaching.',
    approval: 'A separate authorized review is required before this item can move forward.',
    reference: 'The payment reference is incomplete or differs from the expected format.',
    amount: 'The amount is outside the sample range used by this demonstration rule.'
  };
  return {
    summary: summaries[payment.kind],
    why: payment.evidence,
    caution: 'Demonstration explanation derived from fictional rule data. Verify original records and follow your organization’s approval policy.'
  };
}
