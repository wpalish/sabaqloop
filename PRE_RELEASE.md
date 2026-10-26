# SabaqLoop · pre-release candidate

26 October 2026. Implemented and locally verified for the scoped workflows below. Draft PR only; no merge or deployment. This is a local candidate for review, with operational release checks still required.

## Product changes

Сохранён выбранный Fieldnotes: крупная цитата, указатель заданий и рукописная пометка. Практика стала отдельным рабочим экраном с материалами, историей и последовательностью круга. Добавлены восстановление круга и защита незавершённых форм.

Design direction: **Редакторская тетрадь: источник, вопрос, практика**. Current visual decisions and tokens are in DESIGN.md. The approved Fieldnotes source-reading composition remains the design authority. Practice, form drafts and round feedback use actual saved learning data.

## Verified

- Node 24.19.0 full suite: **30/30 passed**, zero failed/skipped/cancelled; JavaScript syntax and whitespace checks passed.
- Browser: Первый несохранённый набор пережил перезагрузку. Ручной вопрос восстановился и сохранился. Ответ в круге восстановился без повторной отправки; круг из двух вопросов завершился с итогом 2/2. Изменение версии в другой вкладке отклонило устаревший круг, сохранив историю.
- Captured and inspected at 390×844, 768×1024 and 1440×1000. No page-level horizontal overflow on the captured working screens. Visible button/input/select/summary targets measured at least44px high (native check/radio controls are checked through their labelled hit areas).
- Form-draft restoration, source selection and practice transitions were checked in the browser. Light and dark practice/bank screens were measured for text contrast. Computed text contrast on captured primary screens met4.5:1 for normal /3:1 for large text; this is a scoped check, not a complete accessibility certification.
- Saved answers are recovered by real attempt IDs, workspace/revision and card version, rather than trusting a cached score. Unit checks cover stale/malformed session data, first-workspace identity, selected/missing decks and denied/full draft storage. Existing domain and learning-storage suites remain passing.

Evidence is in the parent task's outputs/pre-release/evidence/sabaqloop/, test log and machine-readable checks. Browser fixtures use synthetic data; HTTP fixture checks and UI checks are recorded separately. No external operational outcome is inferred.

## Remaining release checks

Локальное хранилище одного браузера, без синхронизации и разграничения пользователей. При запрете временного хранилища черновик остаётся только в памяти открытой страницы; интерфейс предупреждает об этом.

Before a real pilot: configure and verify production HTTPS/origin/session cookie settings, hosting/restart behavior, backup and restore on the actual host, account/access procedures and retention. Screen-reader testing, real-device touch/zoom, OS reduced-motion emulation, initial-network-failure injection and load testing were not performed in this increment. For the browser-only SabaqLoop, validate browser storage/export and device policy instead of server deployment settings. Existing limits in README.md and PRODUCT.md apply.

## Design review

Apple-design, frontend-ui-engineering, Impeccable and interface-polish guidance informed this increment. The mechanical style detector produced suggestions for redundant side stripes and warm palettes. Stripes in the server workspaces were thinned/removed; three deliberate product palettes were retained after contrast checks. The detector output is preserved; it is not reported as a zero-warning scan. No new dependency or external service is required.

The Impeccable context tool reported legacy PRODUCT.md / .impeccable/design.json context. Current selected direction is recorded in DESIGN.md; legacy tool context can be refreshed separately through Impeccable init/document.
