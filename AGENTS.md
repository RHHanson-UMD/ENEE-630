# ENEE 630 Learning Lab — Repository Agent Instructions

## Mission and scope

This repository is the **independent, student-created, public learning companion** for the University of Maryland ENEE 630 (Advanced Digital Signal Processing). It is **not** an official University of Maryland course website. The repository is `RHHanson-UMD/ENEE-630`; the published site is `https://rhhanson-umd.github.io/ENEE-630/`.

Work **only within ENEE 630** in this repository. Do not modify or assume control of the portal, `learning-core`, `course-template`, or other course repositories. Coordinate cross-repository work through the main-site project using an issue, PR, or an explicit handoff.

## Verify current state before acting

1. Read the live repository's `README.md`, this file, relevant source code, current issues/PRs, and workflows. **Live GitHub state is canonical**; old project handoffs and previous chat summaries are historical context, not proof of current code or deployment.
2. Review the relevant tracking issues before starting or resuming work:
   - **#2**: verified course-section and **every-figure** source inventory, newest to oldest;
   - **#3**: suitability and priority of original interactive visualizations;
   - **#4**: mathematical concepts, notation, assumptions, dependencies and tests;
   - **#5**: verified syllabus, public mastery checklist and learning guide;
   - **#6**: checked public supplemental resources;
   - **#7–#9**: agent guidance, structured source audit, and CI hardening.
3. Check the latest issue comments and relevant branches/PRs so work is not repeated. For a resumed audit, read its exact last completed source/page/overlay checkpoint from #2 before proceeding.
4. Confirm connector read/write permissions rather than assuming a prior session's permissions persist.

## Source evidence and course fidelity

Course lectures, notes, recitations, slides, transcripts and the actual syllabus are maintained privately (for example, in connected Google Drive); they are **evidence**, not assets to copy into this public repository.

- For every course-specific claim, **open the exact relevant source** before describing the instructor's notation, examples, figures, or coverage. A filename, syllabus schedule, search snippet, older summary, or deck's existence alone is insufficient.
- The Fall 2026 syllabus schedule is **tentative**. Distinguish **confirmed classroom coverage**, **scheduled but unverified**, **source available but coverage unverified**, and **independently developed supplemental examples**. Where dated actual notes disagree with the tentative schedule, state the discrepancy and do not present the schedule as historical fact.
- Preserve source-specific mathematical assumptions, Fourier/DFT sign, normalized-frequency units (cycles/sample versus radians/sample), indexing, autocorrelation orientation, PSD normalization, conjugation and AR coefficient sign. If unsure, mark as **unverified**, do not silently choose a convention.
- For a visual figure audit, **render and inspect every PDF page or slide overlay**, including diagrams in handwritten notes and photographs. Text extraction alone is not a visual audit. Record a neutral page/slide/overlay identifier, diagram type, whether numbering actually appears, confirmed/unconfirmed details and interactive suitability. Audit *non-interactive* figures too. Distinguish figure counts, mathematics-only displays, page-level first passes and enlarged-photograph uniqueness checks.
- Never claim an exhaustive audit or mark an issue checkbox complete until its stated verification has actually happened. Update #2 and cross-reference #3/#4 with the exact next chronological source/page.
- Curate public references only after **opening** each URL and checking topical relevance. Publicly viewable does **not** imply permission to redistribute; third-party resources do not establish instructor coverage. Bibliographic references from the syllabus are references, not automatically required purchases.

## Publication and privacy: non-negotiable

This is a **public GitHub repository**. Never put the following in any public branch, commit, PR, issue, comment, workflow artifact, or GitHub Pages output:

- Private Drive/ELMS file or folder URLs, access tokens, passwords, secrets, credentials, session links, or private-access metadata.
- Instructor-provided PDFs, slide decks, raw lecture/recitation transcripts, whiteboard photos, screenshots, textbook artwork, copyrighted figures or solutions unless public redistribution rights have been explicitly confirmed.
- Student information, grades, or identifying details from classroom materials.
- **Unreleased or confidential homework/exam/project solutions, answer keys or worked instructor answers.** Even if official solutions are released, publication additionally requires confirmed public sharing/redistribution rights.

Use neutral source references such as `Lecture 16 (Nov 2), PDF p. 2` in public provenance records, without exposing private access locations or copying source solutions. Prefer independently created examples, synthetic signals and original explanatory diagrams. A figure *inspired by a topic* must be identified as original, not passed off as an instructor figure.

Before committing, review both tracked changes and generated artifacts for these restrictions. If source access or sharing rights are uncertain, stop the source-derived publication step, record the blocker without sensitive details, and continue with safe original material.

## Architecture and implementation

**Do not rewrite the stack without an explicit, justified decision.** The current repository uses:

- `site/`: static HTML, CSS and browser JavaScript; deployable as-is by GitHub Pages.
- `site/assets/`: shared styles, theme behavior and site assets.
- `site/visualizations/`: standalone original interactive lessons; mathematical logic belongs in separate pure JS engine modules, not in DOM/controller code.
- `test/`: Node's built-in test runner for independent math/engine regression cases.
- `package.json`: `npm test` runs `node --test test/*.test.mjs`.
- `.github/workflows/tests.yml`: mathematical tests on PRs and `main`.
- `.github/workflows/deploy.yml`: deploys `site/` to Pages after pushes to `main`.

Follow the existing visual language. Default to dark mode with a **persisted, user-selectable light option**; preserve keyboard navigation, focus visibility, contrast, semantics, descriptive text for figures, reduced-motion behavior and usable layouts on smaller screens. Give each visualization meaningful parameter controls, reset, explicit units/conventions, intermediate steps/invariants, failure cases and accessible explanations.

### Mathematical correctness

For every new numerical engine:

1. State the exact statistical/signal model, units, normalization, dimensions and valid parameter range.
2. Separate mathematically pure deterministic functions from generation, display and input controls.
3. Verify independently derived expected results; do not only compare the code with itself.
4. Test an ordinary case, a boundary/degenerate case, an invalid-input case and a counterexample to an assumption where relevant (e.g., singular covariance, insufficient samples, aliasing, unstable AR, zero innovation variance or non-independent averaging).
5. Confirm interactive changes/reset and explanations agree with the computed results and limit cases; avoid a visualization that only *looks* plausible.
6. Do not expose assignment-specific numerical answers as public examples.

## Change, test, review and deployment process

- Prefer small feature branches and focused, reviewable PRs linked to their existing issues; avoid combining unrelated sections, course repos or wholesale refactors.
- Before committing, inspect the diff for content restrictions and verify that source citations are accurate. Do not merge or close a task just because a PR exists.
- Run `npm test` for changes affecting numerical logic or tests. Also perform available HTML/link/JS syntax checks, keyboard and light/dark theme checks, desktop and narrow-viewport review for affected pages. Record what was **actually** run; never report unexecuted tests as passing.
- PR review should check independent math results, boundary conditions, accessibility, source fidelity, licensing and data exposure. If tooling cannot execute a needed verification, state the limitation and leave it as an explicit review item.
- Merge only after appropriate checks and content review are successful. **Passing tests does not prove Pages deployment.** After merging, confirm the Pages workflow succeeded and independently verify the public URL when access permits. Do not claim live changes based only on a successful commit.
- Update the relevant existing issues with source/date/page provenance, decisions, PR/commit, actual test results, deployment state, unresolved risks and the exact next step. Close issues only when their acceptance criteria are satisfied; keep blocked items visibly open or explicitly documented.

## Reporting for every work batch

Finish with a short factual report covering: **(1)** exact sources opened (without private URLs), **(2)** files changed, **(3)** mathematical and UI tests actually performed, **(4)** PR/commit URL or absence of changes, **(5)** Pages status and whether the public page was independently verified, **(6)** licensing/privacy/coverage uncertainties, and **(7)** the next concrete work item and checkpoint.

These instructions apply to this repository only. Follow any more specific verified file-level conventions when consistent with these publication protections.

## Repository instruction maintenance (issue #7)

Keep this file updated alongside changes to the public lesson structure, `package.json`, workflows or audit conventions. Review `AGENTS.md` together with the existing #2 source-and-figure inventory and #8 structured registry whenever new figures are catalogued; one verified figure identifier or source page is not evidence that the entire source was audited. Follow the project's **desktop-focused** scope while retaining usable small-screen layout where already present; do not invent a new mobile-first requirement. If a requested source-specific update cannot open the original instructor material, record the source as unavailable and avoid inventing notation or release status.

When a maintenance PR changes only these instructions, perform text/path/privacy checks and request normal CI; report Node mathematical tests as *not executed* if they have not been run. Do not claim a Pages update or successful CI until observed separately.


## Mandatory publication and workflow security rules

These constraints apply to both human contributors and automated coding agents.
Before creating a public commit, PR, Issue, comment, artifact, or Pages deployment:

1. **No secrets:** Never paste or commit access tokens, GitHub PATs, API keys, passwords, SSH/private keys, session cookies, sensitive configuration, or credentials. Read secrets only from a dedicated secret store, and use a least-privilege short-lived credential if needed. If exposure occurs, stop publication, revoke/rotate privately, and never copy the value into a public remediation issue.
2. **No restricted academic data:** Never publish private Drive/ELMS URLs, instructor PDFs, office/lecture material, student records, answer keys, unreleased homework or copyrighted figures without documented redistribution rights. Solution release alone is insufficient. Prefer original independent examples and neutral source references.
3. **No dangerous workflows:** Keep third-party GitHub Actions pinned to verified full commit SHAs; set minimal explicit workflow permissions; do not introduce \`pull_request_target\`, \`workflow_run\`, or workflow-wide write tokens without separate security review. Deploy only from reviewed \`main\` changes.
4. **Do not bypass checks:** The publication safety gate and Gitleaks secret scan must pass before merge. Never disable, skip, weaken or add an exclusion to either tool merely to clear a failing check. A false positive requires documented maintainer review and a tested narrow fix.
5. **Pre-merge review:** Inspect the full diff for accidental publication and workflow privilege changes. Require independent approval for security-control changes when GitHub branch protections support it. Verify Pages after deploy; do not treat passing CI as proof of publication safety or licensing.
6. **New repositories:** Copy this policy, the pinned-workflow baseline, secret scanning and publication guard into every new course repo before enabling Pages.

The automated \`scripts/check_publication.py\` gate blocks common accidental disclosure paths, selected restricted file formats, private course-storage URLs, and unsafe workflow references. It cannot determine copyright ownership or detect every secret; maintain human rights/security review as a separate requirement.
