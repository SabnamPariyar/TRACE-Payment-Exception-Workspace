# TRACE — Visual direction and component language

*A design system created for the TRACE portfolio prototype · Sabnam Pariyar*

## Design direction

I wanted TRACE to feel calm, precise, and credible. The visual language draws on Nordic editorial restraint and the needs of information-dense enterprise applications: quiet surfaces, disciplined hierarchy, warm human typography, and signals used with intent.

The moodboard is built into the live portfolio page as three interactive, CSS-drawn cards:

- **Signal:** an abstract orbit and target form, expressing attention among many inputs.
- **Evidence:** a layered document, expressing facts that can be examined.
- **Control:** a connected decision path, expressing separation of duties and accountable actions.

Each card flips to show the reason behind its direction. They are conceptual graphics, not actual banking screens or research artifacts.

## Color tokens

| Token | Hex | Intended use |
| --- | --- | --- |
| Midnight | `#17333F` | Navigation, hierarchy, quiet authority |
| Signal teal | `#1A777C` | Primary actions, active navigation, focus |
| Mist | `#EFF4F2` | Low-noise surfaces and breathing room |
| Amber | `#E7AB4E` | Attention, investigating, awaiting review |
| Coral | `#C8665E` | Critical cases and caution signals |

I paired these with warm off-white surfaces, subdued gray-green separators, and text with high contrast against its background. Color never carries the only meaning: a `Critical` or `Review requested` label remains visible in text.

## Typography and hierarchy

- **DM Serif Display:** editorial, expressive portfolio headlines. These set the mood for the case study, away from the dense working area.
- **DM Sans:** interface controls, tables, labels, body copy, and decisions. It emphasizes legibility at operational sizes.
- **Tabular numerals:** financial amounts, queue counts, and reference-like data align consistently.

The editorial headline and the application UI intentionally use different densities. The story is spacious; the workflow is compact.

## Component patterns

| Pattern | States or behavior | Reason |
| --- | --- | --- |
| Priority badge | Critical, High, Medium, Low | Text and color make triage scannable |
| Status pill | Flagged, Investigating, Review requested, Approved, On hold, Rejected, Resolved | A case's state stays recognizable across views |
| Queue row | Default, selected, actionable | Preserve context between list and details |
| Case tabs | Overview, Evidence, History | Keep decision facts close, without one overwhelming panel |
| Rule disclosure | Collapsed/expanded | Progressive disclosure for explanation and supporting evidence |
| Role picker | Analyst, Approver, Auditor | Show responsibility in the interaction itself |
| Confirmation dialog | Neutral, required note, validation error | Encourage deliberate action and documentation |
| Feedback toast | Success and prevention messaging | Confirm effects without interrupting the task |
| Moodboard card | Front/back | Reveal rationale through interaction |
| Color swatch | Selected token and live preview | Make tokens understandable beyond color samples |

## Motion guidelines

Motion should clarify rather than entertain. My prototype uses restrained hover and focus feedback, panel transitions, card flips, and small emphasis changes. The interactive moodboard is an intentional playful moment because it belongs to the design story rather than the financial decision-making flow.

`prefers-reduced-motion` removes nonessential movement for visitors who request it.

## Content principles

1. Name the action precisely: `Request approval` is more useful than `Continue`.
2. Explain the cause near the warning.
3. Keep provenance clear: simulated rule explanations are marked as such.
4. Distinguish a review decision from the actual execution of a payment.
5. Use direct, ordinary language instead of unexplained status codes.

## Responsive intent

The live experience is desktop-first because multi-column exception investigation is the core concept. On narrower screens, navigation collapses and the case view can stack below the queue. This is intended as a coherent mobile viewing experience for a portfolio visitor, not a claim that complex treasury approvals have been validated for mobile production use.

