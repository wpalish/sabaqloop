# SabaqLoop · Fieldnotes

Selected by the owner on 26 October 2026: option 2 from the three displayed concepts.

## Product-specific direction

SabaqLoop is a source-reading desk. A numbered question index stays beside a large literal source, followed by the question, authored answer, version and explicit teacher approval. Use warm paper, editorial serif type, a carmine action and quiet rules. Do not reproduce this composition as a template for the other products: their core tasks must determine their layouts.

Practice, data and the existing information page share this typography and paper palette. Creating a deck, making source drafts and editing a question use the main reading area rather than a narrow sidebar form. On phones the index becomes a horizontal rail that keeps the selected question visible.

## Tokens and typography

- Paper `#f8f7f3`, ink `#191815`, muted `#68645e`, rules `#c9c5bc`.
- Carmine `#8d182a`, source highlight `#fbe7ac`.
- Dark paper `#211f1c`, ink `#f0e9de`, muted `#b8b0a5`, accent `#efa9ac`.
- Self-hosted Lora variable, normal and italic, for reading and editorial hierarchy; Caveat for the authored margin explanation; the system sans stack for small form labels.
- Display tracking tightens from body `0` to source `-.055em`; large source leading `1.08`, reading text `1.55`.
- Desktop 1487px: 305px index, 60px reading gutter, 180px margin note. Below 620px: one column with a scrolling question index.
- Primary controls, navigation links and source links have a minimum 44px target. Focus rings, high contrast rules, reduced motion and reduced transparency fallbacks are defined. Theme preference is local and separate from learning data.

## Visual assets and references

The selected image contains editable typography, a flat paper surface, text highlighting and an annotation arrow. No hero, photo or illustration requires raster generation. The arrow comes from Phosphor, not a handcrafted SVG. Fonts and the single packaged icon are self-hosted; licenses and source hashes are in `dist/assets/`.

- Selected visual target: `docs/fieldnotes-reference.png`.
- Font source: https://github.com/cyrealtype/Lora-Cyrillic (SIL OFL).
- Font distribution: https://github.com/google/fonts/tree/main/ofl/lora and https://github.com/google/fonts/tree/main/ofl/caveat.
- Icon: https://phosphoricons.com/ (`@phosphor-icons/core` 2.1.1, MIT).
- Editorial organisation reference: https://www.are.na/.
- Apple Design skill informed optical typography, restraint, focus, feedback and accessibility. The product's selected editorial composition takes precedence over adding glass effects.

## Truth and interaction

Source text always comes from the saved card. Highlighting is lossless and is not proof of correctness. The mock's generic source attribution and extra grammar prose were replaced by the actual authored source and explanation. Original instructions such as “Complete:” remain visible above the question. Status and version come from the domain model.

Approval, revision snapshots, grading, recovery copies and stale-tab guards stay in the existing domain/storage modules. Newly saved drafts are selected for review. Editing creates a new draft and preserves prior attempts. No learner accounts, AI requests, cloud sync or outcome claims were added.

See `design-qa.md` and `docs/fieldnotes-verification.json` for the verification boundary.

## Practice and unfinished work

Practice is a notebook of saved materials, approved questions and attempt history. During a round the margin shows the actual ordered questions and saved-answer state. Feedback stays paired with the exact question/source version. Teacher drafts retain their selected deck, survive tab reload when session storage is available, and warn when only in-page memory is available.
