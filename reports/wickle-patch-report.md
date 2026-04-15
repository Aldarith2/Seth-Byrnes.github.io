# Wickle patch report

## What changed

- Restored Wickle death behavior.
- Kept the lightswitch minigame active.
- Moved active Wickle dialogue into one editable block in `assets/site.js`.
- Reworked bubble placement so it is anchored to Wickle and clamped to the viewport.
- Restricted normal divider spawns to visible divider hosts so Wickle prefers appearing on-screen.
- Added the death sprite asset at `assets/ui/Wicklediesprite.png`.

## Dialogue block location

The active dialogue block is inside `setupDividerWickle()` in `assets/site.js` as:

- `WICKLE_DIALOGUE.global`
- `WICKLE_DIALOGUE.pages`

The page buckets are organized by:

- `top`
- `lower`
- `trailer`
- `switch`
- `headings`

## Death behavior

- Rapid repeated clicks during one appearance kill Wickle.
- Death persists across pages in the current tab via `sessionStorage`.
- Loading the index page clears the death flag and allows Wickle to return.

## Bubble behavior

- The bubble now renders in a fixed viewport layer.
- Its tail is positioned from Wickle's current screen position.
- If there is not enough room above him, it flips below him.
