import { useState } from 'react';
import {
  ArrowRight, ArrowUpRight, BookOpen, Check, ChevronDown, ChevronRight,
  CircleCheck, ClipboardCheck, Copy, Fingerprint, GitBranch, Layers3,
  LockKeyhole, MousePointer2, ScanSearch, ShieldCheck, Sparkles,
  Table2, TriangleAlert, Workflow
} from 'lucide-react';

const colors = [
  { name: 'Midnight', hex: '#17333F', note: 'Quiet structure and focus', light: false },
  { name: 'Signal teal', hex: '#1A777C', note: 'Primary actions and progress', light: false },
  { name: 'Mist', hex: '#EFF4F2', note: 'Breathing room for dense data', light: true },
  { name: 'Amber', hex: '#E7AB4E', note: 'Attention without panic', light: true },
  { name: 'Coral', hex: '#C8665E', note: 'Exceptions that need care', light: false }
];

const mood = [
  { label: 'Signal', eyebrow: '01 / VISUAL DIRECTION', title: 'See what matters.', why: 'Financial work presents many competing signals. I kept the overall interface quiet so urgent exceptions can stand out when they need to.', visual: 'signal' },
  { label: 'Evidence', eyebrow: '02 / INFORMATION DESIGN', title: 'Make the reason visible.', why: 'A warning without context creates more work. I wanted the evidence, source, and next permitted action to appear together.', visual: 'evidence' },
  { label: 'Control', eyebrow: '03 / INTERACTION DESIGN', title: 'Make decisions traceable.', why: 'In a sensitive workflow, confirmation and accountability matter. A second reviewer and a visible decision history make the journey easier to understand.', visual: 'control' }
];

const journey = [
  { title: 'Identify', caption: 'Find the cases that need attention', detail: 'Prioritization should use clear status labels, urgency, and bank cutoffs. I would test whether users can distinguish genuinely urgent items from routine warnings.' },
  { title: 'Investigate', caption: 'Understand why a payment was flagged', detail: 'The detail view groups transaction facts with the rule evidence. I would test whether the explanation answers the user’s first question without hiding important context.' },
  { title: 'Review', caption: 'Respect responsibility and permissions', detail: 'An analyst can document findings, but a separate approver handles the next decision. The prototype demonstrates this boundary through a role switcher.' },
  { title: 'Trace', caption: 'Know what happened afterwards', detail: 'The timeline records a reason, actor, and time for each simulated action. I would test whether a reviewer can reconstruct a decision without asking a colleague.' }
];

export default function DesignStory({onExplore,onReset}:{onExplore:()=>void,onReset:()=>void}) {
  const [flipped,setFlipped] = useState<number | null>(null);
  const [activeColor,setActiveColor] = useState(colors[1]);
  const [activeJourney,setActiveJourney] = useState(0);
  const [saved,setSaved] = useState(false);
  const [sampleStatus,setSampleStatus] = useState<'Flagged'|'Investigating'|'Approved'>('Flagged');

  return <div className="design-story" id="design-direction">
    <div className="story-container">
      <div className="story-topline"><div className="story-monogram"><Fingerprint size={24}/> <strong>trace<span>.</span></strong></div><span>THE DESIGN BEHIND THE DECISIONS / 2026</span></div>
      <div className="story-introduction"><span className="story-index">01 / DESIGN INTENT</span><h2>Complex work.<br/><em>Clear thinking.</em></h2><p>I'm exploring what happens when an interface must support financial decisions that need both speed and care. TRACE is my independent UX study of exception investigation, approval boundaries, and evidence people can follow.</p></div>
      <div className="moodboard-grid" aria-label="Interactive visual direction moodboard">
        {mood.map((item,i)=><div className="moodboard-item" key={item.label}><button className={'moodboard-card mood-'+item.visual+(flipped===i?' flipped':'')} aria-label={(flipped===i?'Show visual for ':'Read the design reason for ')+item.label} aria-pressed={flipped===i} onClick={()=>setFlipped(flipped===i?null:i)}>
          <span className="mood-inner"><span className="mood-front">
            {item.visual==='signal' && <span className="visual-signal"><span className="signal-grid"/><span className="signal-orbit orbit-a"/><span className="signal-orbit orbit-b"/><span className="signal-orbit orbit-c"/><span className="signal-core"><span/></span><span className="visual-tag">SIGNAL / 01</span></span>}
            {item.visual==='evidence' && <span className="visual-evidence"><span className="evidence-paper"><span className="paper-index">PAYMENT 2048 / REVIEW</span><span className="paper-total">€18,450.00</span><span className="paper-line"/><span className="paper-line short"/><span className="paper-divider"/><span className="paper-check"><CircleCheck size={18}/> EVIDENCE ATTACHED</span></span><span className="visual-tag">CLARITY / 02</span></span>}
            {item.visual==='control' && <span className="visual-control"><span className="visual-path"/><span className="control-block block-one"><ScanSearch size={23}/></span><span className="control-block block-two"><ClipboardCheck size={23}/></span><span className="control-block block-three"><ShieldCheck size={23}/></span><span className="visual-tag">CONTROL / 03</span></span>}
            <span className="mood-flip-hint">Click to reveal idea <ArrowUpRight size={14}/></span>
          </span><span className="mood-back"><span>{item.eyebrow}</span><strong>{item.title}</strong><p>{item.why}</p><small>↶ Return to visual</small></span></span>
        </button><div className="moodboard-label"><strong>{item.label}</strong><span>{String(i+1).padStart(2,'0')}</span></div></div>)}
      </div>

      <div className="story-section palette-section"><div className="story-heading"><div><span className="story-index">02 / DESIGN TOKENS</span><h2>Color has a <em>job.</em></h2></div><p>I use color to organize attention, not decorate every surface. Select a swatch to see how each tone works as an action color.</p></div>
        <div className="palette-grid">{colors.map(color=><button key={color.name} className={'palette-tile '+(activeColor.name===color.name?'chosen':'')} aria-pressed={activeColor.name===color.name} onClick={()=>setActiveColor(color)}><span className="palette-swatch" style={{background:color.hex}}/><strong>{color.name}</strong><small>{color.hex}</small></button>)}</div>
        <div className="palette-example"><div><span className="story-index">LIVE TOKEN PREVIEW</span><h3>{activeColor.name}</h3><p>{activeColor.note}</p></div><button style={{background:activeColor.hex,color:activeColor.light?'#17333f':'#fff'}} onClick={()=>setActiveColor(colors[(colors.indexOf(activeColor)+1)%colors.length])}>Inspect next token <ArrowUpRight size={17}/></button></div>
      </div>

      <div className="story-section components-section"><div className="story-heading"><div><span className="story-index">03 / INTERFACE COMPONENTS</span><h2>Details that earn <em>trust.</em></h2></div><p>Reusable patterns are only useful if their states are understandable. These small examples are interactive.</p></div>
        <div className="component-grid">
          <article className="component-card"><div className="component-top"><span>01</span><strong>STATUS LANGUAGE</strong></div><h3>States with meaning.</h3><p>A status should be understandable without relying on color alone.</p><div className="component-demo"><span className={'pill '+(sampleStatus==='Flagged'?'status-alert':sampleStatus==='Investigating'?'status-warn':'status-good')}>{sampleStatus}</span><button className="component-tiny" onClick={()=>setSampleStatus(sampleStatus==='Flagged'?'Investigating':sampleStatus==='Investigating'?'Approved':'Flagged')}>Cycle state <ArrowRight size={14}/></button></div></article>
          <article className="component-card"><div className="component-top"><span>02</span><strong>REVIEW & FEEDBACK</strong></div><h3>Feedback is visible.</h3><p>Every action should confirm what changed and what still needs attention.</p><div className="component-demo sample-save"><button onClick={()=>setSaved(!saved)} aria-pressed={saved}><span className={saved?'saved-icon':''}><Check size={17}/></span>{saved?'Marked reviewed':'Mark as reviewed'}</button><span>{saved?'Sample state updated':'Try the button'}</span></div></article>
          <article className="component-card"><div className="component-top"><span>03</span><strong>READABLE DATA</strong></div><h3>Numbers deserve care.</h3><p>Amounts, currencies, and references stay aligned and legible.</p><div className="component-demo mini-transaction"><span>PAY-2048</span><strong>€18,450.00</strong><small>EUR · 18 NOV 2026</small></div></article>
        </div>
      </div>

      <div className="story-section journey-section" id="case-study"><div className="story-heading"><div><span className="story-index">04 / THE USER JOURNEY</span><h2>From a warning<br/>to a <em>decision.</em></h2></div><p>I concentrated on one end-to-end scenario: investigate a possible duplicate, request separate approval, and make the resulting decision traceable.</p></div>
        <div className="journey-grid">{journey.map((step,i)=><button key={step.title} onClick={()=>setActiveJourney(i)} className={'journey-card '+(activeJourney===i?'current':'')} aria-pressed={activeJourney===i}><span>{String(i+1).padStart(2,'0')}</span><strong>{step.title}</strong><small>{step.caption}</small><ArrowUpRight size={17}/></button>)}</div>
        <div className="journey-detail"><div><span>DESIGN QUESTION / {String(activeJourney+1).padStart(2,'0')}</span><h3>{journey[activeJourney].title}</h3></div><p>{journey[activeJourney].detail}</p></div>
      </div>

      <div className="research-section"><div><span className="story-index">05 / WHAT I WOULD VALIDATE</span><h2>Design is a question.<br/><em>Evidence comes next.</em></h2><p>This is a fictional portfolio prototype, not a commissioned financial product. I have not conducted interviews with Nomentia customers or measured real payment-processing outcomes.</p></div><ol><li><span>01</span>Learn from treasury specialists which exception details matter first.</li><li><span>02</span>Test whether analysts can find the right next action.</li><li><span>03</span>Evaluate permission boundaries and review confirmation states.</li><li><span>04</span>Check accessibility, error recovery, and understanding of audit history.</li></ol></div>

      <footer className="story-footer"><div><strong>trace<span>.</span></strong><p>Every payment has a decision.</p><small>Independent portfolio concept for Sabnam Pariyar · 2026</small></div><div><button onClick={onExplore}>Return to prototype <ArrowUpRight size={16}/></button><button onClick={()=>{onReset();onExplore();}}>Restart investigation <ArrowUpRight size={16}/></button><a href="https://github.com/sabnumpariyar-png" target="_blank" rel="noreferrer">Sabnam's GitHub <ArrowUpRight size={16}/></a></div></footer>
    </div>
  </div>;
}
