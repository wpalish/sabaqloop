---
name: SabaqLoop
description: Pine ink, warm working paper, and source-linked educational practice.
colors:
  ink: "#20352f"
  muted: "#52625a"
  pine: "#183e35"
  paper: "#f6f5ef"
  white: "#fff"
  line: "#d7ddd4"
  soft: "#eaf0e3"
  accent: "#d9e9c3"
  error: "#96372d"
  error-bg: "#fff0eb"
  amber: "#755514"
  amber-bg: "#fff4d5"
  success: "#255736"
  pine-hover: "#285548"
  control-border: "#91a096"
  secondary-border: "#82948a"
  focus: "#84621c"
  nav-ground: "#edf0e7"
  success-bg: "#edf5e9"
  success-border: "#a3b99c"
typography:
  headline:
    fontFamily: "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
    fontSize: "2rem"
    fontWeight: 730
    lineHeight: 1.2
    letterSpacing: "-.035em"
  title:
    fontFamily: "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
    fontSize: "1.22rem"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "-.015em"
  question:
    fontFamily: "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
    fontSize: "1.3rem"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
    fontSize: ".875rem"
    fontWeight: 650
    lineHeight: 1.55
  small:
    fontFamily: "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
    fontSize: ".875rem"
    fontWeight: 400
    lineHeight: 1.55
  badge:
    fontFamily: "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
    fontSize: ".75rem"
    fontWeight: 650
    lineHeight: 1.55
rounded:
  badge: "4px"
  field: "6px"
  control: "7px"
  feedback: "8px"
  workspace: "12px"
spacing:
  label-gap: ".35rem"
  inline-gap: ".5rem"
  control-block: ".65rem"
  unit: "1rem"
  compact-inset: "1.2rem"
  work-inset: "1.7rem"
  shell-inset: "2rem"
  column-gap: "2.2rem"
components:
  button-primary:
    backgroundColor: "{colors.pine}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: ".65rem 1rem"
  button-primary-hover:
    backgroundColor: "{colors.pine-hover}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.pine}"
    rounded: "{rounded.control}"
    padding: ".65rem 1rem"
  button-secondary-hover:
    backgroundColor: "{colors.soft}"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.pine}"
    rounded: "{rounded.control}"
    padding: ".4rem .7rem"
  button-danger:
    backgroundColor: "{colors.white}"
    textColor: "{colors.error}"
    rounded: "{rounded.control}"
    padding: ".65rem 1rem"
  field:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: ".65rem .75rem"
  nav:
    backgroundColor: "{colors.nav-ground}"
    textColor: "{colors.muted}"
    padding: "0 2rem"
  badge:
    backgroundColor: "{colors.soft}"
    textColor: "{colors.pine}"
    rounded: "{rounded.badge}"
    padding: ".15rem .5rem"
  badge-draft:
    backgroundColor: "{colors.amber-bg}"
    textColor: "{colors.amber}"
    rounded: "{rounded.badge}"
    padding: ".15rem .5rem"
  work-area:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.workspace}"
    padding: "1.7rem"
  answer-option:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: ".8rem 1rem"
  answer-option-selected:
    backgroundColor: "{colors.soft}"
  feedback:
    backgroundColor: "{colors.success-bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.feedback}"
    padding: "1.2rem"
  feedback-wrong:
    backgroundColor: "{colors.error-bg}"
    textColor: "{colors.ink}"
---
# Design System: SabaqLoop

## Overview

**Creative North Star: "The Teacher’s Correction Key"**

Pine ink anchors a warm paper workspace. White work areas hold the active task; quiet green notes and narrow evidence sections keep explanations close to the material they explain. Density comes from ordinary reading and form controls, with no decorative imagery competing with a question.

This is an operational interface: a modest system sans hierarchy, clear labels, restrained color states, and flat bordered surfaces. The recurring visual signature is an answer or question paired with a source excerpt beneath a fine divider.

**Key Characteristics:**

- Pine masthead and actions over a warm paper ground.
- White task areas, fine rules, and compact softly rounded controls.
- Adjacent explanations, source excerpts, and answer history.
- Text-labelled green, amber, and terracotta states.

This record describes `dist/styles.css`, the corresponding HTML and component templates, and the supplied rendered evidence. Product truth remains in the inherited `../../PRODUCT.md`; the surface direction remains in `docs/sabaqloop-surface.md`. No external comp, quality-bar card, user-selected aesthetic approval, or whole-surface ceiling approval is implied.

## Colors

The palette combines dark pine and warm neutral working surfaces with restrained correction colors. The frontmatter values are normative; the names below explain their use.

### Primary

- **Pine** (`pine`): masthead, primary action, links, checked controls, and active navigation. `pine-hover` deepens primary button interaction.
- **Fresh correction tint** (`accent`): the brand icon ground and selected text, paired with pine marks.

### Secondary

- **Terracotta correction** (`error`, `error-bg`): error notices and incorrect-answer feedback; headings carry the correction color while longer explanation text stays ink.
- **Pending amber** (`amber`, `amber-bg`): unreviewed status and backup replacement preview.
- **Confirmed green** (`success`, `success-bg`, `success-border`): correct-answer heading and feedback field.

### Neutral

- **Reading ink** (`ink`) and **quiet ink** (`muted`): primary reading versus support text, dates, counts, and form hints.
- **Warm paper** (`paper`), **working white** (`white`), and **soft green** (`soft`): page ground, active task surface, and explanatory notes or selected controls.
- **Fine rule** (`line`), **control stroke** (`control-border`), and **secondary stroke** (`secondary-border`): separation, input edges, and secondary controls or supporting panel rules.
- **Navigation ground** (`nav-ground`): the horizontal route strip below the pine masthead.
- **Focus amber** (`focus`): the global keyboard outline, independent of approval or feedback status.

**The Ink and Paper Rule.** Use pine for the masthead, primary actions, and active navigation; keep reading and form surfaces on paper or white.

## Typography

**Body and UI Font:** the frontmatter system sans stack. It supports RU, KK, and EN source material through the browser’s available fonts. There is no separate display face or custom webfont in this build.

**Character:** compact, legible, and instructional. Page titles identify a working destination; question text receives more room than metadata, while labels use weight instead of ornamental uppercase treatment.

### Hierarchy

- **Headline:** the main page title. It steps down to `1.75rem` at the tablet breakpoint and `1.65rem` at the narrow breakpoint; the narrow about-article title remains `1.75rem`.
- **Title:** section and feedback headings. Supporting-column headings and question-bank prompts use the base reading size.
- **Question:** the active prompt, with a `60ch` measure, preserved line breaks, and safe wrapping. It steps down to `1.1rem` on narrow screens.
- **Body:** ordinary prose and form values. General paragraphs stop at `72ch`; introductory support copy stops at `65ch`.
- **Label:** field labels and compact controls; **small** carries supporting prose and source excerpts.
- **Badge:** short textual state. Dates and footer copy use the same font size without the badge weight; version metadata follows the small-text role. Statistics use tabular numerals.

**The Readable Evidence Rule.** Keep question and source text in the reading hierarchy; metadata stays visibly subordinate without replacing labels.

## Layout

The shared shell is centered with a `1200px` maximum width. Desktop header, navigation, main, and footer use the shell inset token. Main content starts with a heading-and-filter row, then a flexible work area beside a `285px` supporting column, separated by the column-gap token. The work area permits shrinking with `min-width: 0` rather than forcing long source text outside the viewport.

The working rhythm uses the recorded fractional rem values for label gaps and controls, with whole-rem spacing between larger groups. Forms use two equal columns where space permits. Buttons and links in action rows wrap. Standard buttons and fields have a `44px` minimum height; quiet row actions have a `38px` minimum height.

At `850px` and below, the supporting column moves under the task and splits into two sections. At `560px` and below, it becomes one column; headings stack over filters, two-column forms collapse, task padding contracts to the compact inset, and shell horizontal padding becomes `1.2rem`. Navigation remains a horizontally scrollable row of full text links. The about article has a separate `760px` reading maximum.

## Elevation & Depth

Tone and one-pixel borders carry depth. The masthead is solid pine; the navigation has its own pale ground; white tasks sit on warm paper. Feedback and notes use their state grounds. No source component declares a box shadow or backdrop blur.

**The Flat Working Sheet Rule.** Separate surfaces with tone and fine borders. The current system has no box-shadow vocabulary.

Feedback arrives through a short `180ms ease-out` upward settling motion, from a four-pixel offset to rest. The source disables animations and restores automatic scrolling when reduced motion is requested. Buttons change fill immediately; no general transition system is implemented.

## Shapes

A restrained nested radius scale distinguishes large work areas from controls, feedback, and badges. Fine borders mark cards, fields, answers, and source divisions. The brand icon is a soft square with three pine reference lines and a small directional mark; it is an existing SVG asset, not a general icon library.

Long questions, excerpts, answers, and history content wrap safely. Source blockquotes preserve meaningful line breaks. The interface does not depend on cropped imagery, masks, or decorative illustration.

## Components

### Buttons

Solid pine primary actions use the control radius and recorded primary padding; the hover fill is `pine-hover`. Secondary actions are transparent with the secondary stroke and a soft-green hover fill. Quiet row actions have smaller text, reduced padding, and a fine-rule border. The danger variant has white fill, correction text, and a muted terracotta border; it exists in CSS but is not currently instantiated by the application templates.

All variants inherit the global three-pixel focus outline with a four-pixel offset. Disabled buttons reduce opacity to `.55` and show the unavailable cursor. The source provides no distinct active/pressed styling. The danger selector preserves the source’s inherited primary-hover behavior; it is not promoted as a recommended interaction pattern.

### Cards / Containers

The active task uses working white, the work-area radius, fine-rule border, and the work inset. Notes use soft green and the control radius. Supporting explanations sit directly on paper below a short top rule. Lists and history entries separate with rules rather than nesting more cards.

### Inputs / Fields

Labels sit above fields with the label-gap token. Fields use white, reading ink, a control-stroke border, and the field radius. Textareas resize vertically, starting at a `100px` minimum height. Hints sit below in quiet ink. Keyboard focus uses the shared outline; there is no separate per-field error border or disabled-field design established by this source.

### Navigation

A pale horizontal strip follows the pine masthead. Routes use quiet ink and semibold text. The current route changes to pine and gains a three-pixel bottom rule through `aria-current="page"`. Narrow navigation retains full labels with horizontal scrolling. Hover adds no independent navigation surface or motion.

### Chips

Compact rectangular badges use the badge radius and explicit status words. Approved/default states pair pine with soft green. Draft states pair amber with the pending ground. Archived state is gray-green. Badges label state; they are not clickable filter controls.

### Answer Options

Radio answers sit inside full-width bordered rows with the control radius. A checked radio turns the border pine and the row soft green; hover adds a very pale green fill. Native radio marks use pine. Rows wrap long answer text and keep the radio from shrinking.

### Feedback and Source Evidence

The signature feedback block groups result, submitted answer, explanation, source title, source excerpt, and the next review date. Correct feedback uses confirmed green; wrong feedback switches the ground, border, and heading to correction colors. The source section is separated by a fine top rule and keeps the excerpt in quiet ink. Question-bank and history details reuse this source presentation so the evidence remains legible in each context.

### Notices and Backup Preview

The global live notice is absent when empty. A populated notice uses soft green, a fine border, and the control radius; errors switch to the correction ground, text, and border. Backup replacement preview uses the pending ground and feedback radius, with full text and explicit action buttons. The preview is cleared when a new file is selected, including invalid file selection; its visual presence must represent a currently validated file.

## Do's and Don'ts

### Do:

- **Do** use the recorded pine, paper, white, and state colors for their existing roles.
- **Do** keep a source excerpt visibly paired with the question or feedback it supports.
- **Do** retain text labels for approval, pending, error, and answer states.
- **Do** keep the source’s visible focus outline and reduced-motion behavior.
- **Do** collapse the work area and supporting column before compressing the reading text.

### Don't:

- **Don't** add elevated shadows to the flat working-sheet components.
- **Don't** use amber pending treatment as the only error cue.
- **Don't** turn source text into decorative imagery or hide it behind an unlabeled icon.
- **Don't** infer a display-font or illustration system from this operational interface.

**Not canonized:** the CSS-only danger button’s inherited hover has no independently designed or reviewed treatment. No app repair, external quality-bar comparison, or approval of the whole surface is claimed by this documentation pass.


## Bank search refinement · 26 October 2026

The existing green learning workspace, typography and local storage contract remain authoritative. Bank search matches literal case-insensitive text in the question, answer, source title or excerpt, combined with the selected deck and status. A visible result count and an explicit search/status reset support an empty result. The responsive two-column filter toolbar stacks below 700px. Selected answer options receive the existing pale-green selection surface. No answer, approval, review date or stored material is changed by filtering.
