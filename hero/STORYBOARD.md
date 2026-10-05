# Hero storyboard — "Houston to the Rig"

A scroll-driven film in 6 chapters. Everything is 16:9 with no audio.

The story runs from **night to dusk**:
1. a top drive is loaded in Houston at night
2. it crosses the sea and reaches Dammam at blue hour
3. an urgent spare lands by air at dawn
4. customs clears it at sunrise
5. a convoy crosses the desert by day
6. the rig comes online at dusk

**Pipeline**
1. ✅ **Anchor stills (S1–S7)** generated on Higgsfield, with no watermark. They are in `stills/`, and the Higgsfield job IDs are in `stills/manifest.json`.
2. ⏳ **Draft clips** are made in Google Flow (Frames to Video, Veo 3.1 Fast). They carry a visible watermark, so they are for building and preview only.
3. ⏳ **Final clips** are rendered once on Higgsfield (Veo 3.1 Lite, start + end frame), reusing the prompts that worked in Flow. The job IDs let Higgsfield use the stills directly, with no re-upload.

---

## Anchor stills (final picks)

| ID | File | Scene | Picked from |
|---|---|---|---|
| S1 | `stills/S1.jpg` | Top drive craned onto a cargo ship, Houston port, night, rain | S1-2 |
| S2 | `stills/S2.jpg` | Same ship and cargo crossing the ocean, night, crescent moon | S2-4 |
| S3 | `stills/S3.jpg` | Same ship arriving at a container port, blue hour | S3-4 |
| S4 | `stills/S4.jpg` | 4-engine cargo jet landing on a desert runway, dawn | S4-1 |
| S5 | `stills/S5.jpg` | Crated cargo truck at a port gate barrier, sunrise | S5-2 |
| S6 | `stills/S6.jpg` | Heavy-haul convoy with escorts on a desert highway, sunrise | S6-2 |
| S7 | `stills/S7.jpg` | Lit drilling rig, trucks arriving through dust, dusk | S7-1 |

- `stills/candidates/all-candidates.jpg` shows every option that was generated.
- The first S2 and S3 options (-1 to -3) were rejected: they showed a drillship instead of a cargo ship. The -4 to -6 options were regenerated using S1 as a reference, so the ship and top drive match.
- Stills cost **13.5 credits** in total (27 images × 0.5).

---

## Flow: how to run the drafts

1. Open **Flow** (labs.google/flow) and create a new project called "Lonestar KSA hero".
2. Choose **Frames to Video**, model **Veo 3.1 – Fast**, **Landscape 16:9**, **1 output per prompt**.
3. Upload the start frame, plus the end frame where one is listed, then paste the prompt.
4. If a clip isn't right, regenerate it. Each try costs 20 Flow credits; a full pass of C1–C3, C5 and C6 costs 100.
5. Download each clip you like as MP4 and save it as `hero/drafts/C1.mp4` … `C6.mp4`, or send it to me in chat.

Audio doesn't matter; I strip it.

## Flow prompts

### C1 — Sea: loading · start frame **S1**
> Night at the port in steady rain. The crane slowly lowers the suspended top drive toward the ship's deck, the load swaying gently on its cables, while workers in hi-vis vests guide it with tag lines. Rain streaks through the floodlights and ripples across puddles on the quay. Slow, steady dolly push-in toward the ship. Cinematic, photoreal, deep navy and steel-blue grade. No text, no captions.

### C2 — Sea: crossing to Dammam · start frame **S2** · end frame **S3**
> Aerial drone tracking shot following the cargo ship as it sails across the open sea with the top drive lashed on its deck. Time passes smoothly: the night sky brightens into blue hour, the moon fades, and a port with tall gantry cranes and city lights rises ahead as the ship glides toward it. One continuous, smooth camera move. Cinematic, photoreal. No text, no captions.

### C3 — Air: urgent spare · start frame **S4**
> The white cargo jet descends the last few meters and touches down on the desert runway, tires puffing white smoke, then rolls toward and past the camera as the sun breaks over the horizon behind it. Heat shimmer and dust drift across the runway lights. Low camera at the runway edge, panning slightly to follow the aircraft. Cinematic, photoreal. No text, no captions.

### C4 — Customs (optional) · start frame **S5**
> Calm sunrise at the port gate. Warm light slowly spreads across the concrete and the long shadows shift; the red-and-white barrier arm swings smoothly upward and the truck carrying the crated cargo pulls away into the morning light. Locked-off camera. Cinematic, photoreal. No text, no captions.

*This one is optional. In S5 the barrier runs alongside the truck rather than across its path, so the motion may look odd. The plan is for this chapter to stay a still with an animated "Cleared through FASAH" stamp built in code.*

### C5 — Road: the last mile · start frame **S6** only
> High aerial drone shot slowly flying forward above the heavy-haul convoy as it drives along the straight desert highway at sunrise. White escort pickups with flashing amber beacons lead and follow the long lowboy trailer; fine sand blows across the asphalt and the sun glows through haze on the horizon. Smooth, steady forward motion. Cinematic, photoreal. No text, no captions.

*Don't add S7 as an end frame: S6 is bright sunrise and S7 is dusk, so the clip would morph from day into night. The two clips will be joined with a crossfade on the site.*

### C6 — Finale: rig online · start frame **S7**
> Dusk in the desert. The trucks roll in toward the drilling rig, headlights cutting through drifting dust. The rig's work lights brighten level by level up the mast, and the camera slowly cranes up and pulls back to reveal the vast desert under a deep navy sky with a last band of orange on the horizon. Cinematic, photoreal. No text, no captions.

---

## On-screen copy (added in code, EN + AR)

| Chapter | Line |
|---|---|
| Sea (C1) | Heavy, oversized, on schedule. |
| Crossing (C2) | Houston → Dammam. |
| Air (C3) | When it can't wait, it flies. |
| Customs (S5) | Cleared through FASAH. *(animated "Cleared" stamp)* |
| Road (C5) | The last mile is the hardest. We drive it. |
| Finale (C6) | Rig online. **Experience the difference.** → *Request a quote* |
