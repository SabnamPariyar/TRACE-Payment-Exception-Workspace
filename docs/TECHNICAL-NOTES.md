# TRACE — Prototype implementation notes

This document is for developers and design reviewers interested in how the interactive prototype works. The main README and hosted portfolio focus on the product and design story.

## Architecture

- **Frontend:** React 19, TypeScript, Vite 6, authored CSS, Lucide iconography.
- **State:** in-memory React state; no backend or external storage.
- **Fixture data:** `src/data.ts` defines twelve sample cases and deterministic evidence across EUR, SEK and GBP.
- **Workflow:** `src/workflow.ts` contains a pure state-transition function with role checks, reason validation, and audit append.
- **Tests:** `src/workflow.test.ts` exercises permissions, valid transitions, immutable updates, and required reasons.
- **Design story:** `src/DesignStory.tsx` supplies the interactive visual direction, palette, component behaviors, and journey.
- **Visualization:** an inline SVG trend is illustrative. No external charting dependency or analytics source is used.

## Roles and status model

| Action | Allowed role | Valid starting status | Result |
| --- | --- | --- | --- |
| Start investigation | Analyst | Flagged | Investigating |
| Request approval | Analyst | Investigating | Review requested |
| Place on hold | Analyst | Flagged or Investigating | On hold |
| Approve resolution | Approver | Review requested, other requester | Approved |
| Reject request | Approver | Review requested, other requester | Rejected |
| Close resolved case | Analyst | Approved | Resolved |

The auditor can inspect but never mutate. Request approval, hold, and rejection require a trimmed reason of at least eight characters. Each successful action appends an actor/time/action/detail record without mutating the original object.

The model is an **interaction prototype** rather than a complete payments-control system. In production, roles would be authenticated by an identity provider, changes would require server authorization, state transitions would be atomic and durable, and the audit trail would be tamper-evident. A dropdown that changes roles is not a security control.

## Safety and data honesty

- No bank connectivity or ability to move money.
- No real beneficiary or bank account information.
- No real decision automation; the explanation is generated deterministically from case kind and sample evidence.
- No server logs or external record persistence.
- Financial values are stored in integer minor units to avoid basic decimal representation problems in the fixture model.
- All dates and rules are invented to demonstrate visual and workflow states.

## Run locally

```bash
npm ci
npm run dev
```

## Quality checks

```bash
npm run build
npm test
```

`npm run build` typechecks and produces static files in `dist/`. The GitHub Pages workflow sets Vite's repository base path for project-page hosting.

## Scope still to validate

Formal UX testing, WCAG audit, keyboard focus trapping, mobile financial-workflow suitability, and any real-world workflow or compliance requirements remain outside this prototype's claims.

