# Compatibility audit and patch summary

## What I examined

I reviewed the shared HTML structure, the common stylesheet, and the shared site script that drive the portfolio across desktop and mobile layouts.

## Highest-impact findings

1. The uploaded archive does **not** include the `assets/media` and `assets/docs` folders referenced by the project pages.
2. The shared background builder in `assets/site.js` points at `assets/ui/Randomized Background/...`, but that folder is also absent from the uploaded build.
3. The site relied heavily on modern `aspect-ratio` layout behavior without a fallback for older engines.
4. The pages declared `color-scheme` as `light` only, even though the site actively switches between dark and light themes.
5. There was no graceful fallback for missing images, videos, or linked local documents.
6. Mobile safe-area padding and text-size normalization were not explicitly handled.

## What the patch changes

### Browser and mobile behavior
- Adds a small compatibility stylesheet and script to every page.
- Normalizes text scaling on mobile browsers.
- Adds safe-area padding handling for notched phones.
- Improves tap target reliability.
- Adds `aspect-ratio` fallbacks for trailers and hero media.
- Keeps long text and labels from causing overflow.
- Updates browser UI metadata so theme-aware browser chrome behaves correctly in both light and dark mode.

### Media resilience
- Replaces missing non-UI images with an inline placeholder instead of a broken image icon.
- Replaces unavailable local video embeds with a readable fallback panel.
- Marks missing local document and media links as unavailable when the site is served over HTTP and the file returns a missing response.

### Background behavior
- Replaces the broken missing-folder background reference with available background assets already included in the site build.

## What this patch does not do

- It does not recreate the missing `assets/media` or `assets/docs` content, because those files are not present in the uploaded archive.
- It does not redesign page layouts or alter the existing site personality, interactions, or copy.

## Install

Unzip this patch into the site root and allow overwrite where prompted. The patch adds:
- modified HTML files that load the compatibility patch
- `assets/compat-patch.css`
- `assets/compat-patch.js`
