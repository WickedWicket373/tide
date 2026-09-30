# Tide

Tide is a personal fork of [Actual Budget](https://github.com/actualbudget/actual) (MIT),
restyled and extended to match the approved Tide mockup. `tide/DESIGN.md` is the design spec.

Rules for this fork:
- Keep Tide's code in its own files where possible, so upstream Actual updates merge cleanly.
- Never change how Actual stores budget data. Tide's extra data (logos, review status,
  receipts, holdings) lives separately, so the budget always stays compatible with stock Actual.

Based on Actual v26.9.0.
