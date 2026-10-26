# SabaqLoop · selected option 2 · Design QA

**final result: passed**

## Comparison target and normalization

- Source visual truth: `docs/fieldnotes-reference.png`, the second displayed generated option selected by the owner.
- Implementation: `docs/fieldnotes-desktop.png`, captured from the running app through the Codex in-app browser at `http://127.0.0.1:8910/#bank`.
- Source: 1487 × 1058 pixels; implementation: 1487 × 1058 pixels; CSS viewport: 1487 × 1058; density: 1. No browser chrome or device frame. No rescaling between the comparison inputs.
- State: first original English sample, version 1, three draft questions, first question selected, light theme. Synthetic QA data only. “Complete:” is the actual saved instruction and remains visible.
- Full-view comparison: `docs/fieldnotes-comparison.png`, source left and implementation right.
- Focused comparison: `docs/fieldnotes-comparison-detail.png`, source above and implementation below, question/answer/source/action region at equal pixel scale.
- Additional browser evidence: `docs/fieldnotes-mobile.png` (390px), `docs/fieldnotes-tablet.png` (768px), `docs/fieldnotes-desktop-dark.png`.

## Comparison history

1. Initial browser render: imported base styles overrode the editorial font and paper surface. [P1] Fixed by explicitly assigning the product's body font, foreground and background; the final interaction token file contains no foreign body theme.
2. First paper capture: the inline “Complete:” instruction wrapped the question and pushed the action below the source viewport. [P2] Moved the original instruction above the question without changing the saved prompt.
3. `desktop-iteration1.png` in the workspace output showed an extra row for answer variants pushing the action below 1058px. [P2] Put the disclosure beside the answer and re-captured. Primary action is now fully visible within the target viewport.
4. Source capture and final implementation were combined at equal density and inspected again, both full-view and focused. No actionable P0/P1/P2 findings remain.

## Required fidelity surfaces

- **Fonts and typography:** self-hosted Lora provides the editorial serif hierarchy and Cyrillic support. Caveat provides the authored margin note. Source 63.2px / 68.3px at the reference viewport; tight display tracking, relaxed body leading, restrained sans labels. The unknown generated reference face is approximated with Lora; small glyph/weight differences remain P3.
- **Spacing and layout:** warm page, 305px question index, vertical rule, 60px reading gutter, large highlighted source and a separate question proof below. Navigation, source hierarchy and carmine primary action follow the selected composition. The real source has no extra mock grammar paragraph; this intentional content constraint leaves more white space above the divider.
- **Colors and tokens:** paper, ink, carmine action and pale source highlight match the selected direction. Solid-color contrast ratios: light body 16.56:1, light muted 5.48:1, light primary 9.14:1; dark body 13.63:1, dark muted 7.67:1, dark primary 8.56:1.
- **Image/asset fidelity:** the target has no photo or hero illustration. Its paper, editable text and highlight are UI surfaces. The annotation uses a real packaged Phosphor arrow; no handcrafted SVG or screenshot-as-interface. Fonts and icon are local, with licenses and source hashes.
- **Copy and content:** generic mock source attribution and invented extra source prose were not copied. The actual source title, exact source text, authored explanation, status and version come from saved cards. Original instructions and answer variants remain accessible. Approval/archive/edit actions are real.

## Functional and responsive verification

Passed in the in-app browser: clean first-run state; sample load; selected-question/source change; no-results and status filters; clear filters; explicit approval; wrong-answer feedback and repeat queue; edit to version 2 resetting approval; reload retaining history with the original version-1 question; new deck; two drafts from an original text; manual draft; long source with punctuation without spaces; literal HTML-looking source title; JSON download and explicit restore; theme switch; keyboard activation and visible focus.

A downloaded synthetic backup contained 6 cards and 1 attempt; the current first card was version 2 while the historical prompt still ended in 2021. The clean three-draft sample was restored for the preview. Core grading/storage modules are unchanged.

Widths 390, 768 and 1487 had no horizontal page overflow. The phone rail intentionally scrolls horizontally and keeps the selected question in view. Approval/edit buttons measured 54px high on desktop, archive 44px. No browser console errors observed.

Reduced-motion, reduced-transparency and high-contrast CSS rules were inspected. The connected browser does not provide media-preference emulation, so these OS preferences were not emulated in this run. Safari and Firefox were not exercised.

## Follow-up polish

- [P3] Exact typeface and handwritten arrow stroke differ from generated pixels; the implemented reading hierarchy and product behavior are retained.

## Implementation checklist

- [x] Resolve selected displayed option 2.
- [x] Build the working interface in the existing product.
- [x] Reconcile mock text with the actual domain model.
- [x] Compare source and rendered implementation together at equal scale.
- [x] Fix P1/P2 differences and capture again.
- [x] Check primary flows, mobile, dark theme, keyboard and console.
- [x] Run all 19 tests and check the Git diff.

This pass covers SabaqLoop. Other repositories retain their earlier UX improvements; this design is not copied to them. Publication, merge and classroom outcomes are outside this verification.
