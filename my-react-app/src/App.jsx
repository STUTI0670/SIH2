// ════════════════════════════════════════════════════════════════
//  BEGINNER'S COMPLETE GUIDE — App.jsx
//  Read this file top to bottom like a tutorial.
//  Every line is explained. Nothing is skipped.
// ════════════════════════════════════════════════════════════════


// ──────────────────────────────────────────────────────────────
//  SECTION 1 — IMPORTS
//  "Importing" means borrowing tools from other packages.
//  Think of it like picking tools from a toolbox before starting work.
// ──────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
// React      → The core library. Lets us write UI as components.
// useState   → A "hook" — lets us store data that can change over time.
//              Example: the text typed in an input box.
// useEffect  → Another hook — lets us run code at specific moments.
//              Example: automatically load data when the page opens.

import axios from "axios";
// axios → library for making HTTP requests to our Express backend.
// It handles GET (read), POST (create), PUT (update), DELETE (remove).

import { motion, AnimatePresence } from "framer-motion";
// motion        → Wrap any HTML element with <motion.div> instead of <div>
//                 to get smooth animations for free.
// AnimatePresence → Watches when elements appear or disappear from the screen
//                   and plays an exit animation before removing them.

import { Receipt, Tag, Pencil, Trash2, Search, Plus, Check, Sun, Moon, ImagePlus } from "lucide-react";
// lucide-react → A package full of ready-made SVG icons.
// We pick only the icons we actually need using { curly braces }.
// User   → person silhouette icon
// MapPin → location pin icon
// Pencil → edit/pen icon
// Trash2 → delete/bin icon
// Search → magnifying glass icon
// Plus   → + icon
// Check  → ✓ tick icon
// Sun    → sun icon (for light mode)
// Moon   → moon icon (for dark mode)


// ──────────────────────────────────────────────────────────────
//  SECTION 2 — CONSTANTS
//  A "constant" is a value that never changes while the app runs.
//  We define it once at the top, then reuse it everywhere.
// ──────────────────────────────────────────────────────────────

const API = "http://localhost:5000/items";
// URL of our Express backend running on this machine.
// All axios calls hit this endpoint to read/write MongoDB.


// ──────────────────────────────────────────────────────────────
//  SECTION 3 — CSS STRING
//  Normally CSS goes in a .css file. Here we write it as a
//  JavaScript string (text between backticks ` `) so it lives
//  in the same file. The StyleInjector component (below) then
//  injects it into the page's <head> automatically.
//
//  KEY CSS CONCEPTS USED HERE:
//  • CSS Custom Properties (variables) — like --bg, --text
//    You define them once, use them everywhere.
//    Changing one variable updates every element that uses it —
//    that's how dark/light mode works with ZERO extra JavaScript.
//  • Selectors — .className targets elements with that class.
//  • :root — targets the entire page, great for global variables.
//  • transition — animates changes smoothly instead of snapping.
// ──────────────────────────────────────────────────────────────

const css = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
  /*
    @import → loads an external font from Google Fonts.
    IBM Plex Sans  → clean, readable font for body text.
    IBM Plex Mono  → monospace font (all characters same width) for labels and numbers.
    wght@300;400;500;600 → which font weights (thicknesses) to load.
    300 = thin, 400 = normal, 500 = medium, 600 = semibold.
  */

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  /*
    * = "every element on the page"
    *::before, *::after = invisible helper elements browsers sometimes add
    box-sizing: border-box → padding and border are INCLUDED in an element's
      width/height. Without this, adding padding makes elements wider unexpectedly.
    margin: 0; padding: 0 → removes default spacing browsers add to things
      like headings and paragraphs. We start from scratch.
  */

  /* ── LIGHT MODE COLOUR TOKENS ── */
  :root {
    /*
      :root targets the very top of the HTML document.
      -- prefix means these are CSS Custom Properties (variables).
      We name our colours here once. Every style below uses var(--name)
      to reference them. Change the value here → changes everywhere.
    */
    --bg:        #f5f4f0;   /* main background — warm off-white              */
    --bg2:       #edecea;   /* slightly darker background for sections       */
    --line:      #d4d2cd;   /* colour for all divider/border lines           */
    --text:      #1a1917;   /* primary text — near-black with warm tone      */
    --text2:     #6b6864;   /* secondary text — medium grey for subtext      */
    --text3:     #a8a5a0;   /* muted text — light grey for placeholders/labels */
    --accent:    #1a1917;   /* accent colour (same as text in light mode)    */
    --red:       #c0392b;   /* danger/delete colour                          */
    --blue:      #1a56db;   /* highlight for "Editing" badge                 */
    --surface:   #ffffff;   /* pure white for button backgrounds on hover    */
    --hover:     #f0efeb;   /* subtle background tint when hovering a row    */
    --focus:     #1a1917;   /* border colour when an input is focused/active */
  }

  /* ── DARK MODE COLOUR TOKENS ── */
  .dark {
    /*
      When the <div> has class="dark" on it, ALL these variables
      get replaced. React adds/removes "dark" from the className
      when the toggle button is clicked. The transition on each
      element then smoothly animates between the two sets of values.
    */
    --bg:        #111110;   /* very dark near-black background */
    --bg2:       #1a1917;   /* slightly lighter dark for sections */
    --line:      #2c2b28;   /* dark subtle divider lines */
    --text:      #e8e6e1;   /* light warm-white text */
    --text2:     #8a8880;   /* medium grey text */
    --text3:     #4a4845;   /* muted dark grey */
    --accent:    #e8e6e1;   /* accent same as text in dark mode */
    --red:       #e05c4a;   /* brighter red for dark backgrounds */
    --blue:      #4d8ef0;   /* brighter blue for dark backgrounds */
    --surface:   #1a1917;   /* dark surface for hover states */
    --hover:     #222120;   /* very subtle hover background */
    --focus:     #e8e6e1;   /* light focus border */
  }

  body {
    background: var(--bg);           /* use the --bg variable as background colour */
    font-family: 'IBM Plex Sans', sans-serif; /* set the default font for everything */
    color: var(--text);              /* default text colour */
    transition: background 0.3s, color 0.3s;
    /* transition → when --bg or --text changes (theme switch),
       animate the change over 0.3 seconds instead of snapping */
    -webkit-font-smoothing: antialiased;
    /* antialiased → renders font edges smoother on Mac/Safari.
       Makes text look crisper, less pixelated. */
  }

  /* ── MAIN WRAPPER ── */
  .shell {
    min-height: 100vh;
    /* vh = "viewport height" — 100vh = full screen height.
       min-height means it's AT LEAST the full screen, can be taller. */
    background: var(--bg);
    transition: background 0.3s; /* smooth dark/light background change */
  }

  /* ── PAGE HEADER ── */
  .header {
    display: grid;
    /* grid → a 2D layout system. Much more powerful than flexbox for page structure. */
    grid-template-columns: 1fr auto;
    /* 1fr = "one fraction" = takes all remaining space.
       auto = only as wide as its content.
       So: left side stretches, right side (toggle button) stays compact. */
    align-items: end;
    /* end → align children to the BOTTOM of the grid row.
       This lines up the button with the baseline of the big headline text. */
    padding: 48px 48px 0;
    /* padding: top right bottom left (but 3 values = top, left+right, bottom)
       Here: 48px top, 48px sides, 0 bottom */
    border-bottom: 1px solid var(--line);
    /* draws a thin horizontal dividing line under the header */
    padding-bottom: 24px;
    transition: border-color 0.3s; /* animate the line colour on theme change */
  }

  .wordmark {
    font-family: 'IBM Plex Mono', monospace; /* monospace font for the small label */
    font-size: 11px;
    font-weight: 400;           /* normal weight */
    letter-spacing: 0.12em;
    /* letter-spacing → space between each character.
       0.12em = 12% of the font size. Creates the "spaced out" label look. */
    text-transform: uppercase;  /* forces text to UPPERCASE regardless of source */
    color: var(--text3);        /* use the muted/grey colour */
    margin-bottom: 8px;         /* space below this element before the headline */
    transition: color 0.3s;
  }

  .headline {
    font-size: 28px;
    font-weight: 300;           /* light/thin weight for the big title */
    letter-spacing: -0.03em;
    /* negative letter-spacing → pulls characters CLOSER together.
       Big headings often look better tightly spaced. */
    color: var(--text);
    line-height: 1;
    /* line-height: 1 → line height equals the font size exactly.
       No extra space above/below the text. */
    transition: color 0.3s;
  }

  .headline strong {
    font-weight: 600;
    /* targets the <strong> tag INSIDE .headline.
       "Dashboard" is bold, " — Records" is light-weight. */
  }

  /* ── THEME TOGGLE BUTTON ── */
  .toggle {
    display: flex;              /* lay out icon + text side by side */
    align-items: center;        /* vertically centre them */
    gap: 8px;                   /* 8px space between icon and text */
    background: none;           /* no background fill — transparent */
    border: 1px solid var(--line); /* thin border using our line colour */
    border-radius: 4px;         /* slightly rounded corners */
    padding: 6px 12px;          /* space inside the button */
    cursor: pointer;            /* shows the hand cursor on hover */
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text2);
    transition: border-color 0.2s, color 0.2s, background 0.2s;
  }
  .toggle:hover {
    /* :hover → styles that apply ONLY when the mouse is over the element */
    background: var(--hover);   /* show subtle background tint */
    color: var(--text);         /* make text darker */
    border-color: var(--text3); /* make border slightly darker */
  }

  /* ── META / STATS BAR ── */
  .meta {
    display: flex;              /* lay out stats side by side in a row */
    align-items: center;
    gap: 0;                     /* no gap — we use borders + padding instead */
    padding: 0 48px;            /* same side padding as the header */
    border-bottom: 1px solid var(--line);
    transition: border-color 0.3s;
  }

  .metaItem {
    display: flex;
    align-items: baseline;
    /* baseline → aligns elements by the bottom of their text.
       This lines up the big number and the small label text neatly. */
    gap: 6px;
    padding: 14px 24px 14px 0;
    margin-right: 24px;
    border-right: 1px solid var(--line);
    /* creates a vertical divider line between each stat */
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text3);        /* muted colour for the label */
    transition: color 0.3s, border-color 0.3s;
  }
  .metaItem:last-child {
    /* :last-child → targets only the FINAL .metaItem element.
       The last stat doesn't need a right border or right margin. */
    border-right: none;
    margin-right: 0;
  }

  .metaNum {
    font-size: 18px;
    font-weight: 500;
    letter-spacing: -0.03em;   /* tighter spacing for the big number */
    color: var(--text);         /* full-strength text colour for the number */
    font-family: 'IBM Plex Sans', sans-serif; /* switch back to sans for the number */
    transition: color 0.3s;
  }

  .editingTag {
    /* This badge only shows when editing an existing record.
       It pushes itself to the far right of the meta bar. */
    margin-left: auto;
    /* auto left margin in a flex container pushes the element
       all the way to the right — a common flex trick */
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--blue);
    border: 1px solid var(--blue);
    padding: 3px 8px;
    border-radius: 2px;
    opacity: 0.8;               /* slightly transparent so it's not too aggressive */
  }

  /* ── FORM SECTION ── */
  .formWrap {
    padding: 24px 48px;
    border-bottom: 1px solid var(--line);
    display: flex;              /* lay out all form fields in a row */
    gap: 0;                     /* no gap — fields use internal padding/borders */
    transition: border-color 0.3s;
  }

  .field {
    flex: 1;
    /* flex: 1 → each field grows equally to fill available space.
       If there are 3 fields they each get 1/3 of the width. */
    border-right: 1px solid var(--line); /* vertical divider between fields */
    padding-right: 20px;
    margin-right: 20px;
    transition: border-color 0.3s;
  }
  .field:last-of-type {
    /* last field has no right border (nothing to divide from) */
    border-right: none;
    margin-right: 0;
    padding-right: 0;
  }

  .fieldLabel {
    display: block;
    /* block → makes the label sit on its own line above the input.
       By default <label> is inline and sits beside content. */
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text3);       /* muted colour — label is secondary info */
    margin-bottom: 6px;
    transition: color 0.3s;
  }

  .fieldInput {
    width: 100%;               /* stretch to fill the field container */
    background: none;          /* no box around the input — just text */
    border: none;              /* remove default browser input border */
    border-bottom: 1px solid var(--line);
    /* only a bottom border — gives a clean "underline" style input */
    outline: none;
    /* outline is the blue ring browsers add on focus — we remove it
       and style focus ourselves for more control */
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: var(--text);
    padding: 6px 0;            /* vertical padding, no horizontal (no box) */
    transition: border-color 0.2s, color 0.3s;
  }
  .fieldInput::placeholder {
    color: var(--text3);       /* style the greyed-out hint text */
  }
  .fieldInput:focus {
    /* :focus → styles applied when the user clicks into the input */
    border-color: var(--focus); /* darken the underline when active */
  }

  .formActions {
    display: flex;
    align-items: flex-end;
    /* flex-end → aligns buttons to the BOTTOM of the form row.
       This lines them up with the bottom of the input fields. */
    gap: 8px;
    flex-shrink: 0;
    /* flex-shrink: 0 → this group will NOT shrink even if space is tight.
       The input fields shrink first, buttons always stay full size. */
  }

  /* ── PRIMARY (ADD/UPDATE) BUTTON ── */
  .btnPrimary {
    display: flex;
    align-items: center;
    gap: 6px;                  /* space between icon and text inside button */
    background: var(--text);   /* button background = text colour (black in light mode) */
    color: var(--bg);          /* button text = background colour (white in light mode) */
    /* This is an inversion trick: dark button on light bg, light button on dark bg */
    border: none;
    padding: 8px 16px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    border-radius: 2px;        /* very slightly rounded — almost sharp */
    transition: opacity 0.15s, background 0.3s, color 0.3s;
    white-space: nowrap;       /* prevents the text from wrapping to a new line */
  }
  .btnPrimary:hover {
    opacity: 0.75;             /* just reduce opacity on hover — simple and clean */
  }

  /* ── SECONDARY (CANCEL) BUTTON ── */
  .btnSecondary {
    display: flex;
    align-items: center;
    gap: 6px;
    background: none;          /* no fill — just a bordered outline button */
    color: var(--text2);
    border: 1px solid var(--line);
    padding: 8px 14px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    border-radius: 2px;
    transition: border-color 0.2s, color 0.2s, background 0.2s;
  }
  .btnSecondary:hover {
    border-color: var(--text3);
    color: var(--text);
    background: var(--hover);  /* subtle fill appears on hover */
  }

  /* ── SEARCH BAR ── */
  .searchWrap {
    display: flex;
    align-items: center;
    gap: 0;
    padding: 0 48px;
    border-bottom: 1px solid var(--line);
    transition: border-color 0.3s;
  }

  .searchField {
    display: flex;
    align-items: center;
    gap: 10px;                 /* space between icon and input */
    flex: 1;                   /* both search fields share space equally */
    padding: 12px 0;
    border-right: 1px solid var(--line); /* divider between the two search fields */
    margin-right: 24px;
    padding-right: 24px;
    transition: border-color 0.3s;
  }
  .searchField:last-child {
    border-right: none;
    margin-right: 0;
    padding-right: 0;
  }

  .searchInput {
    background: none;          /* invisible input — just text on the page */
    border: none;
    outline: none;
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 13px;
    color: var(--text);
    width: 100%;               /* fills the full search field area */
    transition: color 0.3s;
  }
  .searchInput::placeholder { color: var(--text3); }

  /* ── DATA TABLE ── */
  .tableWrap { padding: 0 48px 48px; }
  /* padding: 0 top, 48px sides, 48px bottom — no top padding, table starts at the line */

  .tableHead {
    display: grid;
    grid-template-columns: 40px 2fr 80px 2fr 88px;
    /*
      4 columns:
      2fr   → Name column — takes 2 parts of available space
      80px  → Age column — fixed 80px wide (numbers don't need much room)
      2fr   → Location column — takes 2 parts of available space
      88px  → Actions column — fixed 88px (just enough for 2 icon buttons)
    */
    padding: 12px 0;
    border-bottom: 1px solid var(--line);
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text3);       /* column headers are muted */
    transition: color 0.3s, border-color 0.3s;
  }

  .tableRow {
    display: grid;
    grid-template-columns: 40px 2fr 80px 2fr 88px;
    /* MUST match tableHead columns exactly so data lines up with headers */
    padding: 16px 0;
    border-bottom: 1px solid var(--line); /* separates each row */
    align-items: center;       /* vertically centre all cell content */
    transition: background 0.15s, border-color 0.3s;
  }
  .tableRow:hover {
    background: var(--hover);
    margin: 0 -12px;           /* EXPAND the highlight 12px beyond normal edges */
    padding: 16px 12px;
    /* The negative margin trick: row appears to "bleed" slightly past its container
       on hover. The extra padding compensates so content doesn't shift.
       This creates a nice "full bleed" hover highlight effect. */
  }

  .cellName {
    font-size: 14px;
    font-weight: 500;          /* medium weight — names are primary info */
    color: var(--text);
    letter-spacing: -0.01em;
    transition: color 0.3s;
  }

  .cellAge {
    font-family: 'IBM Plex Mono', monospace;
    /* numbers look better in monospace — all digits same width, they align perfectly */
    font-size: 13px;
    color: var(--text2);       /* secondary colour — less important than name */
    transition: color 0.3s;
  }

  .cellLoc {
    display: flex;
    align-items: center;
    gap: 8px;                  /* space between the dot and the location text */
    font-size: 13px;
    color: var(--text2);
    transition: color 0.3s;
  }

  .locDot {
    /* A small circle before the location text — decorative but purposeful */
    width: 5px; height: 5px;
    border-radius: 50%;        /* 50% radius on a square = perfect circle */
    background: var(--text3);  /* muted dot colour */
    flex-shrink: 0;
    /* flex-shrink: 0 → the dot will never get squished or shrink
       even if the location text is very long */
    transition: background 0.3s;
  }

  .cellActions {
    display: flex;
    gap: 4px;
    justify-content: flex-end; /* push buttons to the RIGHT side of the cell */
  }

  /* ── ICON BUTTONS (Edit & Delete) ── */
  .iconBtn {
    width: 28px; height: 28px; /* fixed square size */
    display: flex; align-items: center; justify-content: center;
    /* centres the icon perfectly inside the square */
    background: none;
    border: 1px solid transparent;
    /* transparent border = invisible but SPACE is already reserved.
       On hover, it becomes visible without the layout jumping. */
    border-radius: 2px;
    cursor: pointer;
    color: var(--text3);       /* icon starts muted/invisible-ish */
    transition: border-color 0.15s, color 0.15s, background 0.15s;
  }
  .iconBtn:hover {
    border-color: var(--line); /* border appears on hover */
    color: var(--text);        /* icon becomes fully visible */
    background: var(--surface); /* subtle white background */
  }

  .iconBtn.danger {
    /* .danger is an extra class added to the delete button specifically */
    color: var(--text3);       /* same muted start as regular icon button */
  }
  .iconBtn.danger:hover {
    color: var(--red);         /* turns RED only on hover — restraint = trust */
    border-color: var(--red);  /* red border on hover too */
    background: none;          /* no background fill for danger state */
  }

  /* ── EMPTY STATE ── */
  .empty {
    /* Shown when there are zero records to display */
    padding: 64px 0;           /* lots of vertical breathing room */
    text-align: center;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
    color: var(--text3);       /* very muted — it's just a helper message */
    transition: color 0.3s;
  }

  /* ── IMAGE UPLOAD FIELD ── */
  .imgUploadLabel {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text3);
    border-bottom: 1px solid var(--line);
    padding: 6px 0;
    transition: color 0.2s, border-color 0.2s;
    white-space: nowrap;
  }
  .imgUploadLabel:hover { color: var(--text); border-color: var(--focus); }

  .imgPreview {
    /* Small preview shown in the form field once an image is chosen */
    width: 36px; height: 36px;
    object-fit: cover;
    border-radius: 2px;
    border: 1px solid var(--line);
    display: block;
    margin-top: 4px;
  }

  /* ── IMAGE THUMBNAIL IN TABLE ── */
  .cellImg {
    display: flex;
    align-items: center;
  }
  .imgThumb {
    width: 32px; height: 32px;
    object-fit: cover;
    border-radius: 2px;
    border: 1px solid var(--line);
  }
  .imgEmpty {
    /* Shown when a receipt has no image attached */
    width: 32px; height: 32px;
    border-radius: 2px;
    border: 1px dashed var(--line);
    background: var(--bg2);
    transition: border-color 0.3s, background 0.3s;
  }

  /* ── LIGHTBOX MODAL ── */
  .lightbox {
    /* Fixed overlay that covers the entire screen */
    position: fixed;
    inset: 0;              /* shorthand for top/right/bottom/left: 0 */
    background: rgba(0, 0, 0, 0.88);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;         /* sits above everything else */
    cursor: zoom-out;      /* hint to user: click to close */
  }
  .lightboxImg {
    max-width: 90vw;       /* never wider than 90% of the viewport */
    max-height: 90vh;      /* never taller than 90% of the viewport */
    object-fit: contain;   /* show the whole image, no cropping */
    border-radius: 4px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.6);
  }
  .imgThumb {
    cursor: zoom-in;       /* hint that the thumbnail is clickable */
  }

  /* ── ERROR BANNER ── */
  .errorBanner {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 48px;
    background: var(--red);
    color: #fff;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
  }
  .errorBanner button {
    margin-left: auto;
    background: rgba(255,255,255,0.2);
    border: 1px solid rgba(255,255,255,0.4);
    color: #fff;
    padding: 4px 10px;
    border-radius: 2px;
    cursor: pointer;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .errorBanner button:hover { background: rgba(255,255,255,0.35); }

  /* ── LOADING SKELETON ── */
  .loading {
    padding: 64px 0;
    text-align: center;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
    color: var(--text3);
    animation: pulse 1.2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.3; }
  }
`;
// End of the CSS string — the backtick closes it.


// ──────────────────────────────────────────────────────────────
//  SECTION 4 — STYLE INJECTOR COMPONENT
//  This is a tiny helper component whose ONLY job is to take
//  the css string above and insert it into the browser's <head>.
//  It's invisible — it renders nothing (returns null).
// ──────────────────────────────────────────────────────────────

function StyleInjector() {
  useEffect(() => {
    // useEffect runs AFTER the component appears on screen.

    const el = document.createElement("style");
    // document.createElement("style") → creates a new <style> HTML element in memory.
    // It doesn't appear on screen yet — we're just building it.

    el.textContent = css;
    // Paste our entire CSS string as the content of the <style> element.

    document.head.appendChild(el);
    // appendChild → inserts the <style> element inside <head>.
    // Now the browser reads it and applies all the styles to the page.

    return () => document.head.removeChild(el);
    // This is a "cleanup function". React calls it when the component is removed.
    // It deletes the style tag from <head> to avoid duplicates.
    // The () => syntax is an "arrow function" — a short way to write a function.

  }, []);
  // The empty [] means: run this effect ONCE when the component first mounts.
  // If we omitted [], it would re-run on every render (bad — adds infinite style tags).

  return null;
  // This component has no visible output — it only does work as a side effect.
}


// ──────────────────────────────────────────────────────────────
//  SECTION 5 — MAIN APP COMPONENT
//  This is the heart of the application.
//  "export default" means this is the main thing this file exports.
//  main.jsx (or index.jsx) imports App and renders it into the DOM.
// ──────────────────────────────────────────────────────────────

export default function App() {

  // ── STATE VARIABLES ──────────────────────────────────────────
  // useState returns [currentValue, functionToUpdateIt].
  // We use destructuring [ ] to grab both in one line.
  // When the update function is called, React re-renders the UI
  // automatically with the new value. You never manually update the DOM.

  const [form, setForm] = useState({ store: "", amount: "", category: "", image: "" });
  // form → an OBJECT holding all three input field values together.
  // { name: "", age: "", location: "" } → all start as empty strings.
  // Using one object instead of 3 separate states keeps updates clean.
  // To update just name: setForm({ ...form, name: "John" })
  // The ...form (spread operator) copies ALL existing values first,
  // then we override just the one we're changing.

  const [items, setItems] = useState([]);
  // items → the array (list) of people fetched from the backend.
  // [] → starts empty. Gets filled when fetchItems() runs.

  const [editId, setEditId] = useState(null);
  // editId → stores the database ID of the person being edited.
  // null → means we're in "Add" mode (not editing anyone).
  // When user clicks Edit on a row, we store that person's ID here.
  // submit() checks: if editId has a value → PUT request. If null → POST.

  const [search, setSearch] = useState("");
  // search → the text typed in the "Search by name" input.
  // Used to filter the displayed list in real-time as the user types.

  const [filterCat, setFilterCat] = useState("");
  // filterLoc → the text typed in the "Filter by location" input.
  // Combined with search to narrow down visible rows.

  const [viewImg, setViewImg] = useState(null);
  // viewImg → stores the image URL to show in the fullscreen lightbox.

  const [error, setError] = useState(false);
  // error → true when the backend is unreachable.
  // Shows a banner so the user knows why the table is empty.

  const [loading, setLoading] = useState(true);
  // loading → true while the first fetch is in progress.
  // Shows a pulsing "Loading..." text instead of an empty table.
  // null = lightbox closed. Set to an image URL = lightbox opens.

  const [isDark, setIsDark] = useState(false);
  // isDark → boolean (true/false) for dark mode.
  // false = light mode by default.
  // When true, the class "dark" is added to the shell div,
  // which activates all the dark-mode CSS variables.


  // ── SIDE EFFECT: LOAD DATA ON STARTUP ────────────────────────

  useEffect(() => { fetchItems(); }, []);
  // useEffect runs fetchItems() once when App first appears on screen.
  // [] = dependency array. Empty means "run once and never again".


  // ── FETCH ALL RECORDS FROM MONGODB ───────────────────────────

  const fetchItems = async () => {
    try {
      const res = await axios.get(API);

      if (res.data.length === 0) {
        const defaults = [
          { store: "Swiggy",     amount: "450",  category: "Food",          image: "" },
          { store: "Amazon",     amount: "1299", category: "Shopping",      image: "" },
          { store: "Uber",       amount: "180",  category: "Travel",        image: "" },
          { store: "Big Bazaar", amount: "2340", category: "Groceries",     image: "" },
          { store: "Netflix",    amount: "649",  category: "Entertainment", image: "" },
        ];
        await Promise.all(defaults.map((d) => axios.post(API, d)));
        const seeded = await axios.get(API);
        setItems(seeded.data);
      } else {
        setItems(res.data);
      }
      setError(false); // connection restored — hide the banner
    } catch {
      // axios throws when the server is unreachable (backend not running).
      // Instead of crashing the app we just show an error banner.
      setError(true);
    }
  };


  // ── SUBMIT FORM (ADD OR UPDATE) ───────────────────────────────

  const submit = async () => {

    if (!form.store || !form.amount || !form.category) return;

    try {
      if (editId) {
        await axios.put(`${API}/${editId}`, form);
        setEditId(null);
      } else {
        await axios.post(API, form);
      }
      setForm({ store: "", amount: "", category: "", image: "" });
      fetchItems();
    } catch {
      setError(true);
    }
  };


  // ── DELETE A RECORD ───────────────────────────────────────────

  const remove = async (id) => {
    try {
      await axios.delete(`${API}/${id}`);
      fetchItems();
    } catch {
      setError(true);
    }
  };


  // ── START EDITING A RECORD ────────────────────────────────────

  const edit = (item) => {
    // item → the full person object: { _id, name, age, location }
    // Passed in when the pencil button on a row is clicked.

    setForm({ store: item.store, amount: item.amount, category: item.category, image: item.image || "" });
    // Fill all three input fields with this person's existing data.
    // Now the form shows their current values ready to be changed.

    setEditId(item._id);
    // Store their ID. This switches submit() to use PUT instead of POST.
    // Also triggers the "Editing" badge to appear in the meta bar.
  };


  // ── CANCEL EDITING ────────────────────────────────────────────

  const cancel = () => {
    setForm({ store: "", amount: "", category: "", image: "" });
    // Clear the form back to empty.

    setEditId(null);
    // Reset to null → back to "Add" mode. "Editing" badge disappears.
  };


  // ── IMAGE UPLOAD HANDLER ──────────────────────────────────────

  const handleImage = (e) => {
    // e.target.files → a FileList of files the user selected.
    // [0] → grab the first (and only) file.
    const file = e.target.files[0];
    if (!file) return; // user cancelled the file picker — do nothing

    const reader = new FileReader();
    // FileReader is a built-in browser API that can read file contents.
    // We use it to convert the image file into a base64 data URL string
    // so it can be stored in state and sent to the backend as plain text.

    reader.onload = () => setForm((prev) => ({ ...prev, image: reader.result }));
    // (prev) => ... uses the LATEST form state, not the stale captured value.
    // Without this, form fields typed before the file finishes reading get lost.
    // onload fires when reading is complete.
    // reader.result → the full base64 string, e.g. "data:image/png;base64,iVBOR..."
    // We spread the existing form values and override just image.

    reader.readAsDataURL(file);
    // readAsDataURL → starts reading the file and converts it to a base64 data URL.
    // When done, onload fires automatically.
  };


  // ── FILTER LOGIC (SEARCH + LOCATION FILTER) ───────────────────

  const rows = items.filter(
    // .filter() → loops through every item in the array.
    // Keeps only the items where the function returns true.
    // Items where it returns false are excluded from "rows".

    (i) =>
      (i.store || "").toLowerCase().includes(search.toLowerCase()) &&
      (i.category || "").toLowerCase().includes(filterCat.toLowerCase())

    // i → each individual person object as we loop
    // .toLowerCase() → converts to lowercase so search is case-insensitive.
    //   "John" and "john" and "JOHN" all match a search for "john".
    // .includes() → returns true if the string contains the search text.
    //   "John Smith".includes("john") → false (case sensitive)
    //   "john smith".includes("john") → true
    // && → AND: BOTH conditions must be true for the row to show.
    //   Name must match AND location must match.
  );


  // ── COUNT UNIQUE LOCATIONS ────────────────────────────────────

  const catCount = [...new Set(items.map((i) => i.category))].length;
  const totalSpent = items.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0).toFixed(2);
  // Breaking this down step by step:
  //
  // items.map((i) => i.location)
  //   .map() loops through items and returns a new array with just locations.
  //   Example: ["Delhi", "Mumbai", "Delhi", "Chennai"]
  //
  // new Set(...)
  //   A Set is like an array but it AUTOMATICALLY removes duplicates.
  //   new Set(["Delhi", "Mumbai", "Delhi", "Chennai"])
  //   → Set { "Delhi", "Mumbai", "Chennai" }  (Delhi appears only once)
  //
  // [...new Set(...)]
  //   The spread operator ... converts the Set back into a regular array.
  //   → ["Delhi", "Mumbai", "Chennai"]
  //
  // .length
  //   How many items are in that deduplicated array.
  //   → 3


  // ── JSX — WHAT GETS RENDERED ON SCREEN ───────────────────────
  // JSX = JavaScript XML. Looks like HTML but it's actually JavaScript.
  // Rules:
  //   • Use className instead of class (class is a reserved JS word)
  //   • JavaScript expressions go inside { curly braces }
  //   • Every component must return ONE root element
  //   • Self-closing tags must have a slash: <input /> not <input>
  //   • Comments inside JSX use {/* this syntax */}

  return (
    <>
      {/*
        <> </> is a "Fragment" — an invisible wrapper.
        React requires ONE root element returned from a component.
        Fragment lets us return multiple elements without adding a real div.
      */}

      <StyleInjector />
      {/* Renders our invisible style-injecting component. No visible output. */}

      <div className={`shell ${isDark ? "dark" : ""}`}>
        {/*
          className → the CSS class(es) to apply to this div.
          Template literal with ternary:
            isDark is true  → className="shell dark"
            isDark is false → className="shell "
          Adding "dark" as a class activates all the .dark CSS variables.
        */}


        {/* ── HEADER SECTION ── */}
        <div className="header">
          <div>
            {/* Left side: wordmark + headline */}
            <div className="wordmark">Receipt Tracker</div>
            {/* Small uppercase label above the big title */}

            <div className="headline">
              <strong>Dashboard</strong> — Receipts
              {/* <strong> makes "Dashboard" bold (font-weight: 600)
                  The rest " — Records" stays light (font-weight: 300) */}
            </div>
          </div>

          {/* Right side: theme toggle button */}
          {/* motion button → this is a button that can be animated using Framer Motion props. */}
          {/*
              onClick fires when the button is clicked.
              () => is an arrow function — runs the code after =>.
              !isDark → flips the boolean: true becomes false, false becomes true.
              setIsDark(!isDark) → updates the state to the flipped value.
              React re-renders → className on shell div changes → CSS variables swap.
            */}
          {/* whileTap is a Framer Motion prop.
                While the button is being pressed, scale it to 97% of normal size.
                Feels like a physical button press. */}
          <motion.button
            className="toggle"
            onClick={() => setIsDark(!isDark)}

            whileTap={{ scale: 0.97 }}

          >
            <AnimatePresence mode="wait">
              {/*
                AnimatePresence watches its children.
                When a child's key changes, it plays the exit animation
                on the old element before showing the new one.
                mode="wait" → fully finish exit animation before starting enter.
              */}
              {/*
                  key → React's identifier for each element.
                  When key changes (d → l or l → d), AnimatePresence
                  sees it as a completely new element and animates it.
                */}
                //motion span → we want to animate the icon (Sun/Moon), so we wrap it in a motion.span.
              {/* initial → starting state before the animation begins */}
              {/* animate → the target state to animate TO */}
              {/* exit → what to animate TO when the element is being removed */}
              {/* duration → how long the animation takes in seconds */}
              {/* inline style to make the span behave like flex (for icon alignment) */}
              <motion.span
                key={isDark ? "d" : "l"}

                initial={{ opacity: 0 }}

                animate={{ opacity: 1 }}

                exit={{ opacity: 0 }}

                transition={{ duration: 0.15 }}

                style={{ display: "flex" }}

              >
                {isDark ? <Sun size={11} /> : <Moon size={11} />}
                {/*
                  Ternary: if dark mode → show Sun icon (click to go light)
                           if light mode → show Moon icon (click to go dark)
                  size={11} → icon will be 11px × 11px
                */}
              </motion.span>
            </AnimatePresence>

            {isDark ? "Light" : "Dark"}
            {/* Button label text: tells user what will happen if they click */}
          </motion.button>
        </div>{/* end .header */}


        {/* ── META / STATS BAR ── */}
        <div className="meta">

          <div className="metaItem">
            <span className="metaNum">{items.length}</span>
            Receipts
            {/*
              items.length → JavaScript array property: how many items exist.
              {} curly braces render the JavaScript value into JSX.
              So if items has 5 elements, this renders: "5 Records"
            */}
          </div>

          <div className="metaItem">
            <span className="metaNum">₹{totalSpent}</span>
            Total Spent
          </div>

          <div className="metaItem">
            <span className="metaNum">{catCount}</span>
            Categories
            {/* locCount = the unique location count we calculated above */}
          </div>

          <div className="metaItem">
            <span className="metaNum">{rows.length}</span>
            Visible
            {/* rows = filtered list. rows.length = how many pass the search filter */}
          </div>

          {editId && <div className="editingTag">Editing</div>}
          {/*
            Conditional rendering using &&.
            editId && <div>...</div> means:
              if editId is truthy (not null) → render the div
              if editId is null/falsy → render nothing
            The "Editing" badge only appears while editing a record.
          */}
        </div>{/* end .meta */}


        {/* ── FORM (ADD / UPDATE) ── */}
        <div className="formWrap">

          {/* NAME FIELD */}
          <div className="field">
            <label className="fieldLabel">Store</label>
            {/*
              <label> describes the input below it.
              Clicking a <label> also focuses its associated input (accessibility).
            */}
            {/* input → this is where the user types the name. */}
            {/* placeholder → grey hint text shown when input is empty */}
            {/*
                value={form.name} makes this a "controlled input".
                The input always shows exactly what's in our state.
                React is the single source of truth — the DOM just reflects it.
              */}
            {/*
                onChange fires every time the user types a character.
                e → the event object (browser gives us this automatically)
                e.target → the input element itself
                e.target.value → the current text in the input
                ...form → spread: copy all current form values
                name: e.target.value → override just the name
                Result: { name: "newValue", age: "oldAge", location: "oldLoc" }
              */}
            <input
              className="fieldInput"
              placeholder="Store / Merchant"
              value={form.store}

              onChange={(e) => setForm({ ...form, store: e.target.value })}

            />
          </div>

          {/* AGE FIELD */}
          <div className="field" style={{ maxWidth: 100 }}>
            {/* maxWidth: 100 → this field won't grow beyond 100px (age is short) */}
            <label className="fieldLabel">Amount (₹)</label>
            <input
              className="fieldInput"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>

          {/* LOCATION FIELD */}
          <div className="field">
            <label className="fieldLabel">Category</label>
            <input
              className="fieldInput"
              placeholder="Food, Travel, etc."
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </div>

          {/* IMAGE UPLOAD FIELD */}
          <div className="field" style={{ maxWidth: 120 }}>
            <label className="fieldLabel">Receipt Image</label>
            {/*
              We use a hidden <input type="file"> and a styled <label> on top of it.
              Clicking the label triggers the hidden file picker — this lets us
              style the "button" however we want, since file inputs are hard to style.
            */}
            <label className="imgUploadLabel">
              <ImagePlus size={11} />
              {form.image ? "Change" : "Upload"}
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImage}
              />
              {/*
                type="file" → opens the OS file picker when clicked.
                accept="image/*" → filters the picker to show only image files.
                display: none → hides the ugly default file input completely.
                onChange → calls handleImage which converts the file to base64.
              */}
            </label>
            {form.image && (
              <img
                className="imgPreview"
                src={form.image}
                alt="preview"
                style={{ width: 60, height: 60, cursor: "zoom-in" }}
                onClick={() => setViewImg(form.image)}
                title="Click to view full image"
              />
            )}
            {/* Shows current image in both Add and Edit mode — click to enlarge */}
          </div>

          {/* SUBMIT + CANCEL BUTTONS */}
          <div className="formActions">
            <motion.button
              className="btnPrimary"
              onClick={submit}
              whileTap={{ scale: 0.97 }}
            >
              {editId
                ? <><Check size={11} /> Update</>
                : <><Plus size={11} /> Add</>
              }
              {/*
                Ternary decides button label:
                  editing → show ✓ check icon + "Update"
                  adding  → show + plus icon + "Add"
                <> </> is a Fragment wrapping icon + text into one element.
              */}
            </motion.button>

            {editId && (
              <button className="btnSecondary" onClick={cancel}>
                Cancel
              </button>
            )}
            {/*
              Cancel button only appears when we're in edit mode.
              editId && (...) → render only if editId is not null.
              Clicking Cancel calls cancel() which clears form and resets editId.
            */}
          </div>

        </div>{/* end .formWrap */}


        {/* ── SEARCH BAR ── */}
        <div className="searchWrap">

          <div className="searchField">
            <Search size={13} style={{ color: "var(--text3)" }} />
            {/* Lucide Search icon. style uses CSS variable via inline style. */}
            {/*
                As the user types, setSearch updates the search state.
                The rows variable (filter above) re-runs automatically
                because it reads search. React re-renders → table updates.
                This is REAL-TIME search with no extra code needed.
              */}
            <input
              className="searchInput"
              placeholder="Search by store"
              value={search}
              onChange={(e) => setSearch(e.target.value)}

            />
          </div>

          <div className="searchField">
            <Tag size={13} style={{ color: "var(--text3)" }} />
            <input
              className="searchInput"
              placeholder="Filter by category"
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
            />
          </div>

        </div>{/* end .searchWrap */}


        {/* ── DATA TABLE ── */}
        <div className="tableWrap">

          {/* Column header row */}
          <div className="tableHead">
            <span></span>
            <span>Store</span>
            <span>Amount</span>
            <span>Category</span>
            <span style={{ textAlign: "right" }}>Actions</span>
            {/* Actions header aligns right to match the right-aligned buttons */}
          </div>

          <AnimatePresence>
            {/*
              AnimatePresence watches ALL direct children.
              When a child is removed (deleted record), it plays
              the exit animation before removing it from the DOM.
            */}

            {rows.length === 0 && (
              <motion.div
                className="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                No receipts
              </motion.div>
            )}
            {/*
              Show "No records" message ONLY when rows array is empty.
              rows.length === 0 → true when no records match or none exist.
              Wrapped in motion.div for a fade-in/fade-out animation.
            */}
            {/*
                .map() loops through the filtered rows array.
                For each item, we return JSX for one table row.
                (item, i) → item = current person, i = index (0, 1, 2...)
                i is used for the staggered animation delay below.
              */}
            {/*
                  key → unique identifier React uses to track this element.
                  When an item is deleted, React uses key to know WHICH
                  row to animate out. Always use the database ID as key.
                  NEVER use the array index (i) as key — causes bugs when
                  items are added or removed.
                */}
            {/*
                  exit: opacity fades to 0 AND height collapses to 0.
                  This makes the row shrink away when deleted instead of
                  just vanishing and causing the rows below to jump up.
                */}
            {/*
                  delay: i * 0.03 → staggered entrance.
                  Row 0 appears immediately, row 1 after 0.03s,
                  row 2 after 0.06s, etc. Creates a cascade effect.
                */}
            {/*
                  layout → Framer Motion automatically animates the
                  position change when other rows are added/removed.
                  Without this, remaining rows would snap to new positions.
                */}
            {rows.map((item, i) => (

              < motion.div
                key={item._id}

                className="tableRow"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}

                transition={{ delay: i * 0.03, duration: 0.2 }}

                layout

              >
                <span className="cellImg">
                  {item.image
                    ? <img
                        className="imgThumb"
                        src={item.image}
                        alt={item.store}
                        onClick={() => setViewImg(item.image)}
                        title="Click to view full image"
                      />
                    : <span className="imgEmpty" />
                  }
                </span>

                <span className="cellName">{item.store}</span>
                {/* Display the store / merchant name */}

                <span className="cellAge">₹{item.amount}</span>
                {/* Display the receipt amount */}

                <span className="cellLoc">
                  <span className="locDot" />
                  {/* Small decorative dot before category */}
                  {item.category}
                </span>

                <span className="cellActions">
                  {/*
                      () => edit(item) → arrow function that calls edit()
                      with this specific item when clicked.
                      We use an arrow function here because we need to
                      PASS item as an argument. If we just wrote onClick={edit}
                      it would pass the event object, not the item.
                    */}
                  {/* title → shows a tooltip when mouse hovers over the button */}

                  <button
                    className="iconBtn"
                    onClick={() => edit(item)}

                    title="Edit"
                  >
                    <Pencil size={13} />
                  </button>
                  {/* Two classes: "iconBtn" (base styles) + "danger" (red hover) */}
                  {/*
                      We only pass item._id to remove(), not the whole item.
                      remove() only needs the ID to build the delete URL.
                    */}
                  <button
                    className="iconBtn danger"

                    onClick={() => remove(item._id)}

                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>

                </span>
              </motion.div>
            ))}
            {/* End of .map() — one </motion.div> closes each row */}

          </AnimatePresence>
        </div>{/* end .tableWrap */}

      </div> {/* end .shell */}

      {/* ── LIGHTBOX MODAL ── */}
      <AnimatePresence>
        {viewImg && (
          <motion.div
            className="lightbox"
            onClick={() => setViewImg(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/*
              Clicking anywhere on the dark overlay closes the modal.
              AnimatePresence fades it in/out smoothly.
              The image sits centred inside the overlay.
            */}
            <img className="lightboxImg" src={viewImg} alt="receipt" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
  // End of the return statement — this JSX is what appears on screen.
}
// End of App component function.

// ════════════════════════════════════════════════════════════════
//  QUICK REFERENCE — CONCEPTS USED IN THIS FILE
//
//  useState(x)         → store data that can change. x = initial value.
//  useEffect(fn, [])   → run fn() once when component mounts.
//  async/await         → wait for server responses without freezing UI.
//  axios.get(url)      → read data from server.
//  axios.post(url, d)  → send new data to server (create).
//  axios.put(url, d)   → send updated data to server (update).
//  axios.delete(url)   → remove data from server (delete).
//  ...spread           → copy all properties of an object.
//  arr.filter(fn)      → return new array with only items where fn = true.
//  arr.map(fn)         → return new array with fn applied to every item.
//  new Set(arr)        → array without duplicates.
//  a ? b : c           → ternary: if a then b else c.
//  a && <X/>           → render <X/> only if a is truthy.
//  className           → JSX version of HTML's class attribute.
//  var(--name)         → use a CSS custom property / variable.
//  transition: x 0.3s  → animate property x over 0.3 seconds.
//  flex: 1             → grow to fill available space equally.
//  grid-template-columns → define how many columns and their widths.
// ════════════════════════════════════════════════════════════════