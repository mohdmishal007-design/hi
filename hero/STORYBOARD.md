# Hero storyboard — "Houston to the Rig"

A scroll-driven film in 6 chapters. Every image and clip is 16:9 with no audio.

**Pipeline**
1. **Anchor stills (S1–S7)** are generated on Higgsfield (no watermark). Use the same stills everywhere, so drafts and final clips match.
2. **Draft clips** are made in Google Flow (Frames to Video, Veo 3.1 Fast, 1 output per prompt). They carry a visible watermark, so they are for preview only.
3. **Final clips** are rendered once on Higgsfield (Veo 3.1 Lite, start + end frame), reusing the prompts that worked in Flow.

**Look for every shot**
- Grade: cinematic, photoreal, 35mm, shallow haze, deep navy shadows (#050b16), cool blue highlights (#2f80e0). Warm sun only at dawn and sunrise.
- Never in frame: text, logos, airline liveries, flags, watermarks, close-up faces.

---

## Anchor stills (Higgsfield)

| ID | Prompt |
|---|---|
| **S1** | Night at a Gulf-coast industrial port. A heavy-lift ship crane lowers a large steel oil-drilling top drive unit onto the deck of a heavy-lift cargo vessel. Floodlights, wet quay reflecting light, deep navy sky, light rain catching the light. Wide shot, cinematic, photoreal. No text or logos. |
| **S2** | A heavy-lift cargo ship at night on the open ocean, drilling equipment strapped on deck. Aerial three-quarter view from behind, glowing wake, faint stars, deep navy and blue tones. Cinematic, photoreal. No text. |
| **S3** | Blue hour before dawn. The same heavy-lift cargo ship approaches a large modern container port on calm Gulf water. Rows of gantry cranes, low city lights on the horizon, cool blue palette. Aerial wide shot, photoreal. No text or signage. |
| **S4** | Dawn over the desert. A plain white wide-body cargo freighter jet on final approach, landing lights on, runway approach lights below, golden sunrise haze. Cinematic telephoto, photoreal. No livery, no text. |
| **S5** | Sunrise at a port inspection gate. A flatbed truck carrying a crated industrial machine waits at a barrier arm; steel canopy, long shadows, calm and orderly. Cinematic, photoreal. No text or signage. |
| **S6** | Sunrise over the Saudi Eastern Province desert. A heavy-haul convoy: a multi-axle lowboy trailer carrying a large drilling top drive, escort vehicles with amber beacons, on a straight desert highway. Golden dunes, long shadows. Aerial drone shot, photoreal. No text. |
| **S7** | First light in the desert. An onshore oil drilling rig with its tall mast lit by work lights. The heavy-haul convoy arrives in the foreground. Vast flat desert, soft dust in the air, navy sky turning gold at the horizon. Wide cinematic shot, photoreal. No text. |

---

## Clips

In Flow, choose **Frames to Video → Veo 3.1 Fast → 16:9 → 1 output**, upload the frames listed, then paste the prompt.

| Clip | Chapter | Frames | Prompt |
|---|---|---|---|
| **C1** | Sea: loading | start **S1** | Slow dolly push-in as the crane gently lowers the top drive onto the ship's deck. Workers in hi-vis guide the load with tag lines, light rain glints in the floodlights. Steady, cinematic camera. No text. |
| **C2** | Sea: crossing → Dammam | start **S2**, end **S3** | Aerial tracking shot following the heavy-lift ship across the dark sea. The sky shifts from night to blue hour, a port's gantry cranes appear on the horizon, and the ship glides toward them. Smooth, continuous motion. No text. |
| **C3** | Air: urgent spare | start **S4** | The cargo freighter descends and touches down, a puff of tire smoke, then rolls out as the sun breaks the horizon behind it. Static camera beside the runway. No text. |
| **C4** | Customs: cleared | start **S5** | *(Optional clip; a still works.)* The barrier arm lifts and the truck rolls forward through the gate into the sunrise. Locked-off camera. No text. |
| **C5** | Road: the last mile | start **S6**, end **S7** | A drone follows the heavy-haul convoy along the desert highway at sunrise, amber beacons flashing. A drilling rig rises on the horizon and the convoy approaches it. Smooth forward motion. No text. |
| **C6** | Finale: rig online | start **S7** | The rig's work lights switch on in sequence up the mast, dust drifts through the light, and the camera slowly cranes up and back to reveal the vast desert at dawn. No text. |

**Draft budget on Google AI Pro:** 6 clips × 20 Flow credits = 120 per full pass, out of about 1,000 a month.

**Where drafts go:** download each clip as MP4 and drop it into `hero/drafts/` named `C1.mp4` … `C6.mp4`, or send them to me in chat.

---

## On-screen copy (added in code, EN + AR)

| Chapter | Line |
|---|---|
| Sea | Heavy, oversized, on schedule. |
| Crossing | Houston → Dammam. |
| Air | When it can't wait, it flies. |
| Customs | Cleared through FASAH. *(animated "Cleared" stamp)* |
| Road | The last mile is the hardest. We drive it. |
| Finale | Rig online. **Experience the difference.** → *Request a quote* |
