# TRACE — UX case study

*Sabnam Pariyar · Independent portfolio exploration · November 2026*

## The question

I wanted to examine a challenging enterprise interaction: a person notices an exception in a payment workflow, has to decide whether it is safe to proceed, and may need a second person to authorize the next step.

My framing question was:

> How might I help a treasury operations team move from a warning to a confident, traceable decision, while making responsibility and evidence clear?

TRACE is a fictional answer to that question. It explores the experience of exception handling, not a production payment engine.

## People and scenario

I modeled three roles to examine permission boundaries:

| Role in the prototype | Main need | Design consequence |
| --- | --- | --- |
| Treasury analyst — Mika | Find urgent cases, understand evidence, document an investigation | Queue priority, contextual explanation, decision notes |
| Payment approver — Leena | Independently assess a requested decision | Explicit review state, separate authority, confirmation |
| Auditor — Alex | Understand what happened without changing the record | Read-only mode, chronological audit trail |

These are design assumptions, not personas derived from research interviews. Their names and actions are fictional.

The core task begins with **PAY-2048**: a payment appears similar to a previously submitted item. Before proceeding, the analyst needs to inspect the supporting information, record a reason, and request independent review. The approver then accepts or rejects that request. After approval, the analyst can close the simulated case.

## What I prioritized

### 01 — A quiet foundation for loud signals

Many dashboard patterns compete for attention with bright colors. I chose a restrained slate-and-mist canvas, reserving coral for critical exceptions, amber for active review states, and teal for purposeful actions. Priority has a text label as well as a color treatment.

### 02 — Context before action

The case panel brings the exception description, amount, beneficiary, cutoff, source, and status into one surface. Evidence and history remain adjacent tabs. The `Explain this exception` disclosure is explicitly **rule-based**, so it supports understanding without suggesting an AI system has independently verified a bank record.

### 03 — Responsibility as part of the interface

Role switching is not merely cosmetic. It changes the actions the user can take. The analyst can investigate and request a review, but cannot approve that request. The approver can approve or reject a submitted review, but cannot perform the analyst's investigation. The auditor sees no mutation actions.

### 04 — Feedback and a trail

Each consequential decision uses a confirmation surface, and reasons are required for review requests, holds, and rejections. Successful actions add records containing an actor, action, timestamp, and note. The changing status appears immediately in the queue and detail view.

## Information architecture

I separated the demo into three operational views and a portfolio design story:

1. **Overview** — workload health, urgent featured case, illustrative trend, and a short priority list.
2. **Exception queue** — search, filters, full list, case information, evidence, history, and role-aware actions.
3. **Audit activity** — a cross-case overview of recorded events, with links back into individual cases.
4. **Behind the design** — moodboard, palette, interactive components, user journey, and future validation questions.

The overview is a starting point, not a second workflow. The decisive task lives in the queue/detail view.

## Key user journey

| Stage | User question | Prototype pattern |
| --- | --- | --- |
| Identify | What needs attention first? | Risk/status labels, bank cutoff, urgent queue |
| Investigate | Why was this flagged? | Summary, evidence list, explainable rule |
| Review | Who can decide, and on what basis? | Written note, role boundary, action confirmation |
| Trace | What happened afterwards? | Case history and activity trail |

## Interaction model

My intent was to make the prototype **tryable**. Visitors can search cases, filter work, switch roles, trigger permitted transitions, enter decision reasons, inspect history, and reset all fictional data. I also built a small interactive design system into the page itself: flip cards reveal rationale, color swatches show live use, and component states cycle.

## Accessibility and inclusive design

I used semantic headings, native buttons, labeled search and role controls, tab semantics, status text independent of color, visible focus styling, and a reduced-motion mode. Key actions have descriptive labels. Modal dialogs can be dismissed with Escape.

These are implementation choices, not a substitute for a formal accessibility audit. A next iteration should include keyboard-only and screen-reader testing on common desktop/browser combinations, focus-management verification for dialogs, contrast checks against WCAG criteria, and usability validation with specialist participants.

## What I would validate next

I haven't interviewed treasury users or tested this prototype against a real organization's procedures. My proposed learning plan is:

1. **Discovery interviews:** understand how teams distinguish routine exceptions from time-critical risks and what evidence they trust.
2. **Task-based usability tests:** ask participants to investigate a suspicious duplicate and request the next authorized action without prompting.
3. **Role comprehension:** observe whether analysts and approvers can predict which decisions are available and why.
4. **Information findability:** test how quickly a participant can find the exact reason, source, and prior reviewer note.
5. **Error recovery and accessibility:** test invalid reasons, wrong-role attempts, keyboard behavior, zoom, and assistive technology.

I would evaluate **task success, wrong-action attempts, evidence findability, comprehension of review responsibility, and qualitative confidence**. I would not claim an efficiency gain without baseline and post-change evidence.

## Boundaries

Everything in the prototype is illustrative: sample companies, payment amounts, account masks, thresholds, cutoffs, dates, policies, and user roles. No login, bank connection, payment submission, fraud detection, or external data persistence is implemented. The demo operates entirely in memory and resets on reload.

TRACE was created as an **independent UX portfolio concept**. It is not affiliated with Nomentia or its customers.

