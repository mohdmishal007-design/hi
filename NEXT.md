# Handoff: continuing on a local machine

Branch: `claude/tender-euler-pzelt5`. Read `PRODUCT.md`, `README.md` and `hero/STORYBOARD.md` first.

## Where it stands
- **Built:** a bilingual (EN/AR RTL) Next.js static site for Lonestar Shipping KSA.
  - Scroll story "Houston to the Rig" playing six Google Flow clips as frame sequences.
  - Homepage sections, nine service pages, a PDPL privacy notice, and the shipment-brief quote form.
- **Preview:** a claude.ai artifact with placeholder branding (`scripts/build_artifact.py`): https://claude.ai/artifact/W2NcUT8SYrrJcyqqEFRhn7

## User feedback to act on first
"Pretty underwhelming." Ask what fell flat before redesigning. Likely suspects:
- The sections below the story are mostly text lists on flat navy, with little imagery or motion compared with the story above them.
- The artifact preview runs without Next and without Lenis smooth scrolling on some viewers, and phones get cropped widescreen frames. Judge the design on `npm run dev`, not on the artifact.
- C6 (finale) is trimmed to 2.7 s because of a light-beam artifact; a re-roll would give the ending more weight.

## Open items
- An Impeccable finish review was started in the cloud session. Its verdict did not arrive before the move, so re-run it locally: impeccable skill → new-work section 7.
- `code-review`, `simplify` and `security-review` have not been run yet.
- Content Lonestar still has to supply: see README → "Before launch".
- The Flow source clips (`hero/drafts/*.mp4`) are git-ignored. Copy them in only if the frames need rebuilding (`python3 scripts/build_frames.py`).
