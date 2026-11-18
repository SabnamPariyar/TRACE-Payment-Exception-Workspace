# TRACE — Review and test plan

This plan separates what was verified in the prototype from research and production requirements that have not been validated.

## Automated checks

- TypeScript production compile: `npm run build`.
- Pure workflow tests: `npm test`.
- Tests cover the analyst → approver → analyst journey, auditor restrictions, no self-approval, required reasons, and immutable case updates.

## Manual prototype acceptance checklist

- [ ] Overview exposes counts, a featured case, illustrative trend, and priority cases.
- [ ] Queue search finds cases by reference, company, beneficiary, and exception type.
- [ ] Priority, review, and completed filters show relevant cases; empty search is recoverable.
- [ ] Selecting a case updates summary, evidence, and history.
- [ ] Rule explanation states that its reasoning comes from fictional data.
- [ ] Analyst starts PAY-2048 investigation and submits a note with eight or more characters.
- [ ] Approver can approve or reject; analyst cannot approve their own review.
- [ ] Analyst closes an approved item; all successful steps appear in history and activity.
- [ ] Auditor has no mutation actions.
- [ ] Modal cancellation and Escape do not change the case.
- [ ] Reset restores the original sample data and selected role.
- [ ] Moodboard cards flip; palettes, component states, and journey cards respond.
- [ ] Mobile layout keeps content and controls accessible without horizontal page overflow.
- [ ] Keyboard focus is visible; reduced-motion setting is respected.

## Future usability protocol (proposed, not conducted)

Recruit treasury-domain participants with varied experience and ask them to find a suspicious duplicate, identify the evidence, and request the correct reviewer. Observe task completion and understanding without giving hints. Follow with a review-role task, a history reconstruction task, and a short confidence interview. Record critical misinterpretations and prioritise them before considering performance optimisations.

