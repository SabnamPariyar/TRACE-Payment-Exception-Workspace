import { useEffect, useMemo, useState } from 'react';
import {
  Activity, ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, Bell,
  Check, CheckCheck, CheckCircle2, ChevronDown, ChevronRight, CircleHelp,
  Clock3, Copy, FileClock, FileText, Filter, Fingerprint, History,
  LayoutDashboard, ListFilter, LockKeyhole, Menu, MoreHorizontal,
  RotateCcw, Search, ShieldAlert, ShieldCheck, SlidersHorizontal,
  Sparkles, SquareArrowOutUpRight, TriangleAlert, Wallet, X
} from 'lucide-react';
import {
  formatMoney, formatTime, initialPayments, kindLabels, makeExplanation,
  people, riskLabels, statusLabels, type Payment, type PaymentStatus, type Role
} from './data';
import { actionLabels, applyWorkflowAction, availableActions, type WorkflowAction } from './workflow';
import DesignStory from './DesignStory';

type Section = 'overview' | 'exceptions' | 'activity';
type DetailTab = 'summary' | 'evidence' | 'history';
type FilterName = 'All cases' | 'Urgent' | 'Awaiting review' | 'Completed';

const chartSeries = [
  { day: '12 Nov', exceptions: 9 }, { day: '13 Nov', exceptions: 6 },
  { day: '14 Nov', exceptions: 8 }, { day: '15 Nov', exceptions: 5 },
  { day: '16 Nov', exceptions: 7 }, { day: '17 Nov', exceptions: 4 },
  { day: '18 Nov', exceptions: 6 }
];
const chartCoordinates = chartSeries.map((entry,i) => ({ x: 28 + i * 70, y: 115 - entry.exceptions * 9 }));
const chartLine = chartCoordinates.map((point,i) => (i ? 'L ' : 'M ') + point.x + ' ' + point.y).join(' ');
const chartFill = chartLine + ' L 448 128 L 28 128 Z';

const navItems: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'exceptions', label: 'Exception queue', icon: ListFilter },
  { id: 'activity', label: 'Audit activity', icon: History }
];

const actionNotes: Record<WorkflowAction, string> = {
  investigate: 'This moves the case into investigation.',
  request_review: 'A different authorized user must review this case. Describe the evidence you checked.',
  hold: 'The case will remain blocked until it is reviewed outside this flow. Explain why.',
  approve: 'This approves the case for its next simulated step. No money will be sent.',
  reject: 'The review request will be rejected. Give the analyst a clear reason.',
  resolve: 'This closes the already-approved case in the demonstration.'
};

function statusClass(status: PaymentStatus) {
  if (status === 'resolved' || status === 'approved') return 'status-good';
  if (status === 'review_requested' || status === 'investigating') return 'status-warn';
  if (status === 'rejected' || status === 'held') return 'status-muted';
  return 'status-alert';
}
function riskClass(risk: Payment['risk']) {
  return risk === 'critical' ? 'risk-critical' : risk === 'high' ? 'risk-high' : risk === 'medium' ? 'risk-medium' : 'risk-low';
}
function isOpen(payment: Payment) {
  return !['resolved', 'rejected'].includes(payment.status);
}
function timeShort(iso: string) {
  return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Helsinki' }).format(new Date(iso));
}

export default function App() {
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [role, setRole] = useState<Role>('analyst');
  const [selectedId, setSelectedId] = useState('PAY-2048');
  const [section, setSection] = useState<Section>('overview');
  const [activeFilter, setActiveFilter] = useState<FilterName>('All cases');
  const [query, setQuery] = useState('');
  const [detailTab, setDetailTab] = useState<DetailTab>('summary');
  const [showExplanation, setShowExplanation] = useState(false);
  const [dialogAction, setDialogAction] = useState<WorkflowAction | null>(null);
  const [dialogNote, setDialogNote] = useState('');
  const [dialogError, setDialogError] = useState('');
  const [toast, setToast] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    if (!dialogAction) return;
    function onEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setDialogAction(null);
    }
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [dialogAction]);

  const selected = payments.find(payment => payment.id === selectedId) ?? payments[0];
  const openCount = payments.filter(isOpen).length;
  const urgentCount = payments.filter(payment => isOpen(payment) && payment.risk === 'critical').length;
  const reviewCount = payments.filter(payment => payment.status === 'review_requested').length;
  const closedCount = payments.filter(payment => ['resolved', 'rejected'].includes(payment.status)).length;

  const visiblePayments = useMemo(() => {
    const searched = payments.filter(payment =>
      [payment.id, payment.entity, payment.beneficiary, payment.reference, kindLabels[payment.kind]]
        .join(' ').toLowerCase().includes(query.toLowerCase().trim())
    );
    return searched.filter(payment =>
      activeFilter === 'All cases' ||
      (activeFilter === 'Urgent' && isOpen(payment) && (payment.risk === 'critical' || payment.risk === 'high')) ||
      (activeFilter === 'Awaiting review' && payment.status === 'review_requested') ||
      (activeFilter === 'Completed' && ['resolved', 'rejected', 'approved'].includes(payment.status))
    );
  }, [payments, query, activeFilter]);

  const activity = useMemo(() => [...payments.flatMap(payment => payment.audit.map(entry => ({ ...entry, paymentId: payment.id, entity: payment.entity })))]
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .slice(0, 30), [payments]);

  function selectPayment(payment: Payment) {
    setSelectedId(payment.id);
    setDetailTab('summary');
    setShowExplanation(false);
    setSection('exceptions');
  }

  function beginAction(action: WorkflowAction) {
    setToast('');
    if (action === 'investigate') {
      try {
        const updated = applyWorkflowAction(selected, role, action);
        setPayments(current => current.map(p => p.id === selected.id ? updated : p));
        setToast('Investigation started. The action has been added to the case history.');
      } catch (error) { setToast(error instanceof Error ? error.message : 'Unable to update case.'); }
      return;
    }
    setDialogAction(action);
    setDialogNote('');
    setDialogError('');
  }

  function confirmAction() {
    if (!dialogAction) return;
    try {
      const updated = applyWorkflowAction(selected, role, dialogAction, dialogNote);
      setPayments(current => current.map(p => p.id === selected.id ? updated : p));
      setToast(actionLabels[dialogAction] + ' — recorded in the demonstration history.');
      setDialogAction(null);
      setDialogNote('');
      setDetailTab('history');
    } catch (error) {
      setDialogError(error instanceof Error ? error.message : 'Unable to update case.');
    }
  }

  function resetDemo() {
    setPayments(initialPayments);
    setRole('analyst');
    setSelectedId('PAY-2048');
    setActiveFilter('All cases');
    setQuery('');
    setSection('overview');
    setDetailTab('summary');
    setShowExplanation(false);
    setToast('Demo reset to its original fictional cases.');
  }

  function navigate(next: Section) {
    setSection(next);
    setMobileNav(false);
    document.getElementById('workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const explanation = makeExplanation(selected);
  const actions = availableActions(selected, role);

  return <div className="site">
    <header className="portfolio-header">
      <a className="portfolio-brand" href="#top" aria-label="TRACE portfolio home"><span className="brand-sign"><span/></span> TRACE<span className="brand-period">.</span></a>
      <div className="portfolio-header-right"><span>UX CASE STUDY / 2026</span><a href="#design-direction">Behind the design <ArrowDownRight size={15}/></a></div>
    </header>

    <main id="top">
      <section className="portfolio-intro">
        <div className="hero-eyebrow"><span className="live-dot"/> INDEPENDENT ENTERPRISE UX CONCEPT <span className="hero-divider">/</span> SABNAM PARIYAR</div>
        <div className="intro-grid">
          <div><h1>Every payment<br/>has a <em>decision.</em></h1>
            <p>I explored how treasury teams could investigate exceptions, request a second review, and understand what happened next—without losing the context behind a decision.</p>
          </div>
          <div className="intro-side"><span>01 / WORKING PROTOTYPE</span><strong>Clarity under pressure.</strong><p>A fictional investigation workflow, designed around trust, traceability, and the details that matter.</p><a href="#workspace" className="hero-cta">Explore the prototype <ArrowUpRight size={18}/></a></div>
        </div>
      </section>

      <section className="workspace-frame" id="workspace" aria-label="Interactive TRACE payment exception prototype">
        <div className="workspace-caption"><div><span className="prototype-dot"/> INTERACTIVE PRODUCT PROTOTYPE <span className="caption-separator">/</span> SAMPLE DATA</div><span>Choose a case, switch roles, and try the approval flow <ArrowDownRight size={14}/></span></div>
        <div className="app-window">
          <aside className={'app-sidebar ' + (mobileNav ? 'mobile-visible' : '')}>
            <div className="app-logo"><span className="app-logo-icon"><Fingerprint size={22}/></span><div><strong>trace<span>.</span></strong><small>TREASURY OPERATIONS</small></div></div>
            <div className="side-group-label">WORKSPACE</div>
            <nav aria-label="Application navigation">
              {navItems.map(item => <button key={item.id} className={'side-nav-item ' + (section === item.id ? 'is-active' : '')} onClick={() => navigate(item.id)}>
                <item.icon size={18}/><span>{item.label}</span>{item.id === 'exceptions' && <b>{openCount}</b>}
              </button>)}
            </nav>
            <div className="side-divider"/>
            <div className="side-group-label">PORTFOLIO</div>
            <a className="side-nav-item side-link" href="#design-direction"><SlidersHorizontal size={18}/><span>Design system</span><ArrowUpRight size={14}/></a>
            <a className="side-nav-item side-link" href="#case-study"><FileText size={18}/><span>UX case study</span><ArrowUpRight size={14}/></a>
            <div className="sidebar-bottom"><span className="sidebar-shield"><ShieldCheck size={18}/></span><div><strong>Simulation only</strong><p>Fictional companies, payments and records. No money moves.</p></div></div>
          </aside>
          {mobileNav && <button className="mobile-backdrop" aria-label="Close navigation" onClick={()=>setMobileNav(false)}/>}
          <div className="app-content">
            <div className="app-topbar">
              <button className="mobile-menu icon-button" aria-label="Open navigation" onClick={() => setMobileNav(true)}><Menu size={19}/></button>
              <div className="workspace-crumb"><span>Northstar Group</span><ChevronRight size={14}/><strong>{section === 'overview' ? 'Overview' : section === 'activity' ? 'Audit activity' : 'Exception queue'}</strong></div>
              <div className="top-actions">
                <button className="icon-button help-button" aria-label="About this simulation" onClick={() => setHelpOpen(!helpOpen)}><CircleHelp size={18}/></button>
                <button className="reset-button" onClick={resetDemo}><RotateCcw size={15}/> Reset demo</button>
                <label className="role-picker"><span className="role-avatar">{people[role].initials}</span><span className="role-copy"><strong>{people[role].name}</strong><small>{people[role].title}</small></span><ChevronDown size={14}/><select aria-label="Switch demo role" value={role} onChange={event => {setRole(event.target.value as Role);setToast('Role switched. Available actions reflect the selected permissions.');}}><option value="analyst">Mika Laine — analyst</option><option value="approver">Leena Berg — approver</option><option value="auditor">Alex Niemi — auditor</option></select></label>
              </div>
            </div>
            {helpOpen && <div className="help-callout"><button aria-label="Close help" onClick={()=>setHelpOpen(false)}><X size={15}/></button><strong>About TRACE</strong><p>This is an independent, fictional UX study. All amounts, rules, cutoffs, organizations and approvals are illustrative. It never connects to a bank or initiates a transfer.</p></div>}
            {toast && <div className="toast" role="status"><CheckCircle2 size={16}/>{toast}<button aria-label="Dismiss message" onClick={()=>setToast('')}><X size={14}/></button></div>}
            {section === 'overview' && <>
              <div className="page-titlebar"><div><span className="eyebrow">WEDNESDAY, 18 NOVEMBER 2026 · FICTIONAL SESSION</span><h2>Good morning, {people[role].name.split(' ')[0]} <span>✳</span></h2><p>Here's what needs attention in your treasury operations.</p></div><div className="session-badge"><span className="session-indicator"/> DEMO ENVIRONMENT</div></div>
              <div className="metric-grid">
                <Metric icon={<Wallet size={21}/>} label="Open cases" value={openCount.toString().padStart(2,'0')} note="Across four entities" theme="navy"/>
                <Metric icon={<TriangleAlert size={21}/>} label="Critical exceptions" value={urgentCount.toString().padStart(2,'0')} note="Need immediate review" theme="coral"/>
                <Metric icon={<Clock3 size={21}/>} label="Awaiting approval" value={reviewCount.toString().padStart(2,'0')} note="Separate reviewer required" theme="amber"/>
                <Metric icon={<CheckCheck size={21}/>} label="Closed cases" value={closedCount.toString().padStart(2,'0')} note="Recorded in audit history" theme="green"/>
              </div>
              <div className="overview-panels">
                <div className="overview-focus"><div className="panel-kicker"><span><ShieldAlert size={16}/> REQUIRES ATTENTION</span><span>FEATURED CASE / 01</span></div><h3>One detail can change<br/><em>the entire decision.</em></h3><p>PAY-2048 may be a duplicate of a previously submitted payment. Examine the evidence before requesting approval.</p><div className="focus-meta"><span>€18,450.00</span><span>Northstar Components Oy</span></div><button onClick={()=>selectPayment(payments[0])}>Investigate this case <ArrowUpRight size={18}/></button></div>
                <div className="trend-card"><div className="trend-header"><div><span className="eyebrow">SAMPLE ACTIVITY</span><h3>Exceptions over time</h3></div><span className="trend-meta">PAST 7 DAYS</span></div><div className="trend-chart"><svg viewBox="0 0 476 162" role="img" aria-label="Illustrative seven-day trend of payment exception counts" preserveAspectRatio="none"><defs><linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#2f8b8c" stopOpacity=".25"/><stop offset="100%" stopColor="#2f8b8c" stopOpacity="0"/></linearGradient></defs>{[35,75,115].map(y=><line x1="25" x2="452" y1={y} y2={y} key={y} stroke="#e4eeeb" strokeDasharray="3 5"/>)}<path d={chartFill} fill="url(#trendFill)"/><path d={chartLine} fill="none" stroke="#247b80" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>{chartCoordinates.map((point,i)=><circle key={i} cx={point.x} cy={point.y} r="3.5" fill="#247b80" stroke="#fff" strokeWidth="2"/>)}{chartSeries.map((entry,i)=><text key={entry.day} x={chartCoordinates[i].x} y="151" fill="#8ca2a3" fontSize="10" textAnchor="middle">{i%2===0?entry.day.slice(0,2):''}</text>)}</svg></div><p>Illustrative figures for interface exploration; not operational reporting.</p></div>
              </div>
              <div className="overview-list-head"><div><span className="eyebrow">PRIORITY WORK</span><h3>Cases worth a closer look</h3></div><button className="link-button" onClick={()=>navigate('exceptions')}>View all cases <ArrowRight size={17}/></button></div>
              <QueueTable payments={payments.filter(p=>isOpen(p)).sort((a,b)=>({critical:0,high:1,medium:2,low:3}[a.risk]-{critical:0,high:1,medium:2,low:3}[b.risk])).slice(0,5)} selectedId={selectedId} onSelect={selectPayment} compact/>
            </>}
            {section === 'exceptions' && <>
              <div className="queue-head"><div><button className="backlink" onClick={()=>navigate('overview')}><ArrowLeft size={15}/> Back to overview</button><span className="eyebrow">EXCEPTIONS / INVESTIGATION</span><h2>Payment exceptions<span className="title-count">{payments.length}</span></h2><p>Identify the issue, inspect the evidence, and take the next permitted step.</p></div><div className="queue-head-right"><ShieldCheck size={17}/> Permission-aware workflow</div></div>
              <div className="filterbar"><div className="filter-chips">{(['All cases','Urgent','Awaiting review','Completed'] as FilterName[]).map(filter=><button key={filter} className={filter===activeFilter?'active':''} onClick={()=>setActiveFilter(filter)}>{filter}</button>)}</div><label className="search-box"><Search size={17}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search case, company, beneficiary..." aria-label="Search payment cases"/></label></div>
              <div className="investigation-layout">
                <div className="queue-panel"><div className="queue-panel-head"><strong>Exception queue</strong><span>{visiblePayments.length} cases</span></div><QueueTable payments={visiblePayments} selectedId={selectedId} onSelect={selectPayment}/>{!visiblePayments.length && <div className="queue-empty"><Filter size={27}/><strong>No matching cases</strong><p>Try another search or reset the filters.</p><button onClick={()=>{setQuery('');setActiveFilter('All cases');}}>Clear filters</button></div>}</div>
                <article className="detail-panel" aria-label={'Details for '+selected.id}>
                  <div className="detail-topline"><span>CASE DETAIL / {selected.id}</span><span className={'pill '+statusClass(selected.status)}>{statusLabels[selected.status]}</span></div>
                  <div className="detail-intro"><div className={'detail-risk-icon '+riskClass(selected.risk)}><TriangleAlert size={22}/></div><h3>{kindLabels[selected.kind]}</h3><p>{selected.reason}</p></div>
                  <div className="detail-amount"><span>PAYMENT AMOUNT</span><strong>{formatMoney(selected.amountMinor,selected.currency)}</strong><small>{selected.entity} · {selected.country}</small></div>
                  <div className="detail-tabs" role="tablist" aria-label="Case information">
                    {(['summary','evidence','history'] as DetailTab[]).map(tab=><button key={tab} role="tab" aria-selected={detailTab===tab} onClick={()=>setDetailTab(tab)} className={detailTab===tab?'active':''}>{tab==='summary'?'Overview':tab==='evidence'?'Evidence':'History'}</button>)}
                  </div>
                  {detailTab==='summary' && <div className="detail-content"><div className="kv-grid"><div><span>BENEFICIARY</span><strong>{selected.beneficiary}</strong></div><div><span>BANK CUTOFF</span><strong>{formatTime(selected.cutoff)}</strong></div><div><span>REFERENCE</span><strong>{selected.reference}</strong></div><div><span>SOURCE</span><strong>{selected.source}</strong></div><div><span>BENEFICIARY ACCOUNT</span><strong>{selected.beneficiaryAccount}</strong></div><div><span>RISK LEVEL</span><strong>{riskLabels[selected.risk]}</strong></div></div>
                    <button className="explain-button" onClick={()=>setShowExplanation(!showExplanation)} aria-expanded={showExplanation}><span><Sparkles size={18}/> Explain this exception</span><ChevronDown size={17}/></button>
                    {showExplanation && <div className="explain-panel"><div className="explain-top"><Sparkles size={15}/><strong>RULE-BASED EXPLANATION</strong><span>NOT GENERATIVE AI</span></div><p>{explanation.summary}</p><ul>{explanation.why.slice(0,3).map((item,i)=><li key={i}>{item}</li>)}</ul><small>{explanation.caution}</small></div>}
                  </div>}
                  {detailTab==='evidence' && <div className="detail-content"><h4>Supporting information</h4><p className="subtle-copy">These are fictional observations attached to the sample rule.</p><ul className="evidence-list">{selected.evidence.map((item,i)=><li key={i}><span>{String(i+1).padStart(2,'0')}</span>{item}</li>)}</ul><div className="read-only-note"><LockKeyhole size={16}/> Source records cannot be edited in this prototype.</div></div>}
                  {detailTab==='history' && <div className="detail-content"><h4>Decision history</h4><div className="audit-timeline">{[...selected.audit].reverse().map(event=><div className="audit-entry" key={event.id}><span className="audit-marker"/><div><div><strong>{event.action}</strong><time>{timeShort(event.at)}</time></div><small>{event.actor}</small><p>{event.detail}</p></div></div>)}</div></div>}
                  <div className="detail-actions"><div className="action-explainer"><LockKeyhole size={14}/><span>Viewing as {people[role].title.toLowerCase()}</span></div>{actions.length ? <div className="action-buttons">{actions.map((action,i)=><button key={action} onClick={()=>beginAction(action)} className={i===0?'action-primary':'action-secondary'}>{actionLabels[action]}{i===0?<ArrowRight size={16}/>:null}</button>)}</div> : <p className="no-actions">No further actions are permitted for this role and case status. Switch roles or choose another case to explore.</p>}</div>
                </article>
              </div>
            </>}
            {section === 'activity' && <><div className="queue-head"><div><span className="eyebrow">TRACEABILITY / SIMULATED EVENTS</span><h2>Every decision leaves a trail.</h2><p>Explore the history behind payments and human review. No actual banking activity takes place.</p></div><div className="queue-head-right"><FileClock size={18}/> Most recent first</div></div><div className="activity-panel"><div className="activity-header"><strong>Case activity</strong><span>{activity.length} visible events</span></div>{activity.map(event=><button key={event.id} className="activity-row" onClick={()=>selectPayment(payments.find(p=>p.id===event.paymentId)!)}><span className="activity-icon"><History size={17}/></span><span className="activity-main"><strong>{event.action}</strong><small>{event.detail}</small><em>{event.actor} · {event.entity}</em></span><span className="activity-right">{event.paymentId}<small>{timeShort(event.at)}</small></span><ChevronRight size={15}/></button>)}</div></>}
          </div>
        </div>
      </section>

      <DesignStory onExplore={()=>navigate('exceptions')} onReset={resetDemo}/>
    </main>

    {dialogAction && <div className="modal-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)setDialogAction(null);}}>
      <div className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-heading"><div className="modal-icon"><ShieldCheck size={22}/></div><button onClick={()=>setDialogAction(null)} aria-label="Cancel action"><X size={20}/></button></div>
        <span className="eyebrow">CONTROLLED WORKFLOW / {selected.id}</span><h3 id="modal-title">{actionLabels[dialogAction]}?</h3>
        <p>{actionNotes[dialogAction]}</p>
        {(['request_review','hold','reject'] as WorkflowAction[]).includes(dialogAction) && <label className="reason-field"><span>Reason for this decision <b>*</b></span><textarea autoFocus rows={4} value={dialogNote} onChange={event=>{setDialogNote(event.target.value);setDialogError('');}} placeholder="Summarize the evidence and reasoning..."/></label>}
        {dialogError && <p className="dialog-error" role="alert">{dialogError}</p>}
        <div className="modal-note"><LockKeyhole size={15}/> This is a fictional workflow. No bank instruction will be sent.</div>
        <div className="modal-buttons"><button onClick={()=>setDialogAction(null)}>Cancel</button><button className="modal-confirm" onClick={confirmAction}>Confirm decision <ArrowRight size={16}/></button></div>
      </div>
    </div>}
  </div>;
}

function Metric({icon,label,value,note,theme}:{icon:React.ReactNode,label:string,value:string,note:string,theme:string}) {
  return <article className="metric-card"><div className={'metric-icon '+theme}>{icon}</div><span>{label}</span><strong>{value}</strong><small>{note}</small></article>;
}

function QueueTable({payments,selectedId,onSelect,compact=false}:{payments:Payment[],selectedId:string,onSelect:(payment:Payment)=>void,compact?:boolean}) {
  return <div className={'table-overflow '+(compact?'table-compact':'')}><table className="payment-table"><thead><tr><th>Payment / issue</th><th>Beneficiary</th><th>Amount</th><th>Risk</th><th>Status</th><th><span className="sr-only">Open</span></th></tr></thead><tbody>{payments.map(payment=><tr key={payment.id} className={payment.id===selectedId?'selected-row':''}><td><button className="payment-open" onClick={()=>onSelect(payment)}><strong>{payment.id}</strong><span>{kindLabels[payment.kind]}</span></button></td><td><strong className="td-primary">{payment.beneficiary}</strong><small>{payment.entity}</small></td><td><strong className="td-amount">{formatMoney(payment.amountMinor,payment.currency)}</strong><small>{formatTime(payment.cutoff)} cutoff</small></td><td><span className={'risk-label '+riskClass(payment.risk)}><i/>{riskLabels[payment.risk]}</span></td><td><span className={'pill '+statusClass(payment.status)}>{statusLabels[payment.status]}</span></td><td><button className="row-arrow" onClick={()=>onSelect(payment)} aria-label={'Open '+payment.id}><ArrowUpRight size={17}/></button></td></tr>)}</tbody></table></div>;
}
