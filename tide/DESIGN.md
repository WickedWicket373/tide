# Tide design spec (approved Sep 30, 2026)

This is the look the Actual fork must match. The source of truth is the
"Tide Budget Mockup" canvas in Claude (Dashboard, Transactions, Accounts,
Budget, Investments, Goals, Phone Home, Phone Transactions). When building
a screen, match that mockup, not Actual's current layout.

## Colors
| Role | Value |
|---|---|
| Page background | #F3F6F5 |
| Sidebar background | #FAFCFB (border #E2E8E6) |
| Card | #FFFFFF, 1px border #E2E8E6, radius 16px |
| Row divider | #EEF2F1 |
| Table/section header band | #F8FAF9 |
| Text | #15201E |
| Secondary text | #5B6A65 |
| Section labels (uppercase) | #4E5C58, 11–13px, 700, letter-spacing 0.06em |
| Accent (buttons, active, lines) | #0E7C72 (hover/dark #0A5F57) |
| Accent soft (active nav, pills) | #DFF2EC / text #0A5F57 |
| Mint (chart fills, secondary bars) | #5ED3B5 (fill at 16–18% opacity), #3FBF9E |
| Progress: on track | #1C9585 |
| Progress: close to limit (flexible only) | #D9A21B |
| Progress: over | #C94A31 |
| Over pill | bg #FBE7E2, text #A73A24 |
| Remaining pill | bg #E1F4EE, text #0A5F57 |
| Zero pill | bg #EDF1F0, text #4E5C58 |
| Income amounts | #0A6E57 with "+" |
| Debt colors | #C9772B, #EBC08F |
| Progress track | #E8EEEC |

Category chips: soft tinted background + dark text + colored dot
(e.g. Groceries #E3F5EC / #1D6B45 / #2FA36B; Restaurants #FCEBE4 / #963820 / #E26B4A;
Gas #FDF1D8 / #7F5500 / #D9A21B; Shopping #EFEAFB / #523A96 / #8466D8;
Subscriptions #E3F0F9 / #1E5A7D / #3A8DC2; Transportation #E6EEFB / #2A4C90 / #4F7FDA).

## Type
- Font: Figtree (400/500/600/700/800), fallback system sans. Tabular numbers everywhere.
- Page title 30px / 800 / -0.025em. Card title 16px / 700. Big numbers 28–38px / 800.
- Body 14–15px; captions 12–13px.

## Spacing and shape
- Sidebar 236px wide, nav items 44px tall, radius 10px, 12px gap icon→label.
- Main content max-width 1200px, page padding 30px top / ~40px sides, 20px between sections.
- Card padding 22–24px; list rows 10–14px vertical, 20–24px horizontal.
- Radii: cards 16px, buttons/inputs 10px, pills 999px, merchant logos full circle (38–40px).
- Buttons 40px tall; primary = solid #0E7C72, secondary = white with 1px #D3DCD9 border.
- Segmented controls: #E6ECEA track, white selected pill with a soft shadow.
- No heavy shadows; separation comes from borders and the tinted background.

## Phone
- Bottom tab bar (Home, Transactions, Budget, Accounts, More), 84px tall, white, active tab teal.
- 16px side padding, cards stacked with 14px gaps, 44px minimum touch targets.
