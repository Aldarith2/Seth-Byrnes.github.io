# Benevolent haunted-creature implementation report

## Proposed creature
**Name:** Wickle

Wickle is a small, shy, helpful gremlin-like maintenance creature tied to the site’s fusebox, dust, and secret-message tone. It is not malicious. It appears briefly, watches the visitor, fusses with page details, and occasionally leaves tiny gifts.

## Behavioral goal
Wickle should make the site feel quietly inhabited rather than busy.

The creature should:
- appear infrequently
- stay small
- avoid covering important content
- behave differently on different pages
- remember prior visits
- respect reduced-motion preferences

## Visual direction
- tiny sprite-sheet character, 24px to 48px tall depending on viewport
- silhouette readable against both light and dark themes
- idle loop, peek loop, walk loop, wave loop, vanish loop
- optional alternate poses for sitting on dividers, fuseboxes, or image frames

## Core implementation model

### 1. Overlay actor layer
Create a single fixed-position DOM layer above the page content but below modal/lightbox interactions.

**Element structure**
- `div#wickle-layer`
- `button.wickle-actor`
- optional `div.wickle-bubble`

This allows Wickle to be interactive, keyboard-focusable if needed, and easy to disable.

### 2. Simple state machine
Wickle should be driven by a lightweight state machine.

**Recommended states**
- hidden
- peeking
- walking
- perched
- inspecting
- waving
- leaving
- gifting

**Example flow**
`hidden -> peeking -> walking -> perched -> leaving -> hidden`

### 3. Spawn controller
A small controller decides if Wickle appears on each page load.

**Recommended rules**
- 15% to 25% appearance chance on normal page loads
- hard cooldown between appearances, stored in local storage
- guaranteed appearance after several pages with no visit
- one special first-visit appearance on the home page

**Stored values**
- `wickle_last_seen`
- `wickle_affinity`
- `wickle_seen_pages`
- `wickle_special_events`

### 4. Anchor-point navigation
Instead of free pathfinding, Wickle should use authored anchor points.

Each page can expose a few safe perches with attributes such as:
- `data-wickle-anchor="sidebar-top"`
- `data-wickle-anchor="hero-frame"`
- `data-wickle-anchor="section-divider-2"`

Wickle moves between these points using short authored hops and walks.

This is much safer than dynamic collision logic on a professional portfolio site.

## Page-specific behavior ideas

### Home page
- peeks from the sidebar
- dusts the nameplate
- points at the avatar after the secret message has been found once

### CV page
- sits on a section divider
- stamps the page corner briefly
- leaves a tiny checklist tick animation

### The Deep page
- avoids contamination spots
- shines a tiny light toward a trailer or design sample
- leaves a bubble note such as "clean enough"

### B-17 page
- scurries along the edge of a gallery image like it is inspecting a shelf

## Interaction design
Wickle should be optional and gentle.

**Good interactions**
- click to wave
- hover to make it glance at the cursor
- rare gift drop such as a tiny badge, note, or sound cue
- after repeated visits, Wickle recognizes the user and lingers slightly longer

**Avoid**
- loud sounds
- blocking clicks
- large motion arcs over readable text
- constant presence
- jumpscares or horror cues

## Accessibility and device behavior

### Reduced motion
If `prefers-reduced-motion: reduce` is active:
- no wandering
- no drifting camera-like motion
- only rare static peeks or none at all

### Mobile
On mobile:
- shrink sprite scale
- use fewer appearances
- restrict anchors to corners, divider edges, and sidebar/footer zones
- never place Wickle near tap-heavy controls

### Keyboard and screen readers
- mark the decorative actor `aria-hidden="true"` by default
- if interactive rewards are added later, provide an explicit opt-in accessible control

## Technical approach

### CSS responsibilities
- sprite sizing
- step-based animation
- page-edge shadows
- speech bubble styling
- theme-aware tint adjustments

### JavaScript responsibilities
- spawn scheduling
- state machine transitions
- anchor lookup
- local storage persistence
- page-specific event hooks
- cooldown and affinity systems

### Asset package
Minimum viable Wickle set:
- idle sprite sheet
- walk sprite sheet
- peek sprite sheet
- wave sprite sheet
- vanish puff sprite
- optional one tiny chirp or rustle sound

## Example implementation phases

### Phase 1: passive haunting
- Wickle appears, peeks, walks to one perch, waves, leaves
- no rewards yet

### Phase 2: recognition
- remembers pages visited
- changes behavior after repeat visits
- leaves rare text bubbles

### Phase 3: gifts and secrets
- drops tiny collectible notes
- ties into fuse hunt or page stamps
- can unlock one hidden cosmetic site state

## Why this is a good fit for the current codebase
Wickle is feasible because the site already has:
- DOM overlay effects
- page-specific behavior hooks
- local storage usage
- subtle animation patterns
- secret interaction precedent

That means the creature can be implemented as one more shared script and a small set of assets rather than a site-wide rewrite.
