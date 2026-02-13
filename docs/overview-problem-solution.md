# Overview / Problem Statement / Solution

---

## Overview

A web app for the bachata community where dancers, teachers, and DJs can link their Spotify account (later YouTube and Apple Music), add songs by pasting a link, listen in-app, and manually annotate the full song structure: sync counts (1–2–3–tap), breaks, accents, rhythm changes, and sections. Annotated breakdowns are stored in a database and shared in a community catalog so anyone can browse and listen to songs with their structure visible. The product speaks the language of bachata — counts, taps, breaks — not generic music analysis.

---

## Problem Statement

### Problem

There is no existing resource that breaks down bachata songs by structure and timing. Dancers learn timing by ear or from a teacher in class, but have nothing to reference afterward. Teachers prepare breakdowns ad-hoc, often only in their heads, and repeat the same work for every class. DJs preview songs manually to find breaks and transitions, with no structured view of where things happen. People sometimes scribble notes on paper or in spreadsheets, but nothing is standardized, shareable, or tied to playback.

### Target Audience

- **Social bachata dancers** — Hobbyists who go to socials and classes, want to practice at home but struggle to remember song structure.
- **Performance/competition dancers** — Need precise timing for choreography and performances.
- **Bachata teachers/instructors** — Need to show students song structure before teaching; currently count aloud and prepare mentally each time.
- **Bachata DJs** — Need to know where breaks, accents, and sections are to plan transitions and setlists.

### Pain Points

- No single resource exists for bachata song structure — dancers rely on memory from class or re-learn by ear.
- Teachers spend time re-creating the same breakdowns verbally in every class; nothing is reusable or shareable.
- DJs preview songs one by one with no structured data; building a setlist is manual guesswork.
- Personal notes (paper, spreadsheets) are unstructured, not linked to playback, and not in a format other dancers can use.
- Without a shared catalog, every dancer or teacher has to figure out timing independently.

---

## Solution

### Proposed Solution

A web app that connects to Spotify (v1; YouTube and Apple Music later), lets users add songs by pasting a link, and plays the track in-app. While listening, users manually annotate the timeline: marking sync counts (1–2–3–4, 1–2–3–tap), breaks, accents, rhythm changes, and section boundaries (intro, verse, chorus, bridge, outro). Annotated songs are saved to a database and appear in a community catalog. Other users can browse the catalog, find a song, and listen with the breakdown overlaid on the timeline.

### Unique Selling Proposition (USP)

**Manual, human-curated breakdowns by dancers for dancers.** The breakdown uses bachata terminology (counts, taps, breaks, sections) rather than generic music analysis. The community catalog — built by users — is the core value: a shared, structured view of bachata songs that no other product provides.

### Key Features

- **Account linking:** Connect Spotify (v1); YouTube and Apple Music added later.
- **Add by link:** Paste a song URL; app resolves metadata and enables playback.
- **In-app playback:** Listen to the song in the app, controlled by the annotation flow.
- **Manual annotation:** Mark sync counts, breaks, accents, rhythm changes, and sections on a timeline.
- **Database storage:** Every breakdown is stored with timestamps and labels.
- **Community catalog:** Browse all songs with breakdowns; filter, search, and listen with the breakdown visible.
- **Bachata-native schema:** Counts, taps, breaks, and sections use dancer terminology.
