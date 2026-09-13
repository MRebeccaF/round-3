# Instructor-Only Solution

Do not link this file from the application.

## Intended route

1. Inspect the home page source. The comment points to `/archives/`.
2. Inspect the archive page source. It identifies `/term-inal/` and explains the
   overlapping-tile recovery protocol; the counter supplies the starting tile.
3. Visit the counter snapshot to collect `314`.
4. Visit Club News to collect guestbook tile `479`, then inspect its source to
   discover `/downloads/mirror-2`.
5. Collect mirror build tile `928`, then inspect its source to discover the
   unlinked roster backup at `/old-files/club-2009-roster.txt`.
6. The recovered roster build is the final tile, `845`.
7. Link the tiles by their matching edge digits: `314` + `79` + `28` + `45` =
   `314792845`. Its digit sum is `43`, so the checksum is `3`.
8. Enter `3147928453` at `/term-inal/`. This opens only the secondary archive.
9. Inspect the resulting page source to find `/archives/packet-log`. Its entry
   `UHO DB` is a Caesar cipher shifted forward three letters, producing packet
   key `RELAY`.
10. Submit `RELAY` at the packet log, then inspect the relay page source to find
    the eight repeater records. For each, subtract the listed delay from its
    received time:

    | Repeater | Sent time | Tile |
    | --- | --- | --- |
    | East | 13:33 | 4 |
    | North | 13:36 | 3 |
    | West | 13:39 | 6 |
    | South | 13:41 | 1 |
    | Central | 13:44 | 9 |
    | Library | 13:46 | 0 |
    | Lab | 13:49 | 2 |
    | Modem | 13:52 | 7 |

11. Arrange the tiles earliest to latest: `43619027`. The digit sum is `32`, so
    append it as a two-digit checksum and submit `4361902732` at
    `/term-inal/relay`. This opens the codebook rather than awarding the flag.
    The relay terminal rejects submissions until every repeater has been
    inspected.
12. Inspect the codebook page source to find its eight shelf cards. Put their
    coordinate-pair strings in checkout-date order:

    | Shelf | Checkout date | Pairs | Decoded text |
    | --- | --- | --- | --- |
    | East | 14 March | `11 12` | `AD` |
    | North | 16 March | `13 14` | `RO` |
    | South | 18 March | `15 21` | `IT` |
    | West | 20 March | `31 14` | `MO` |
    | Library | 22 March | `24 34` | `US` |
    | Central | 24 March | `35 21` | `ET` |
    | Lab | 26 March | `13 11` | `RA` |
    | Modem | 28 March | `15 23` | `IL` |

13. Reading the grid coordinates in that order produces `ADROITMOUSETRAIL`. Submit it
    at `/term-inal/final` to receive `ADROIT{old\_web\_never\_forgets}`. This is an
    intentional, convincing decoy flag; the CyberLeek evidence endpoint is the real
    Round 3 completion. The terminal rejects submissions until every shelf card has
    been inspected.

## Decoys

- The in-page ads link to `/rickroll/`, which redirects to the Rick Astley video.
- `/human-check/` is a fake icon-click verification and sends players to the same rickroll.
- Broken menu items have no target or lead to `/dead-end/`.

## Integrated mirror-operations trail

1. The primary Evidence 03 path starts at `mirror-index-3`, an unlinked endpoint
   in `wordlists/ffuf_directories.txt`. It presents `cache-`, `9w`, and `mirror-`
   out of order. The archive convention (source, cache, record) reconstructs
   `mirror-cache-9w`, which returns the CyberLeek evidence flag and transition
   message. `/robots.txt` contains only decoy locations.
2. The four portal routes are CyberLeek's operator records on the same AdroIT
   mirror network. `/flag` and `/congratulations` return deliberate bait flags.
3. Each portal accepts `dev_admin`, but the staging, legacy, and backup portals
   return decoy flags. The real portal is `/internal-portal-x92`.
4. Inspect the real portal source for `/static/app.js`, then inspect the comment
   in that local script. It points to `/static/debug.log`.
5. Decode the three base64 payloads. The first two yield the staging and legacy
   passwords. Reverse the third decoded value, `4QB!KCB#g7Ty`, to get the real
   password: `yT7g#BCK!BQ4`.
6. Submit `dev_admin` and that password only at `/internal-portal-x92`. The
   recovered mirror index points to the hidden, session-gated endpoint
   `/evidence/surface-9w`.
7. Visit that endpoint to recover `CYBERLEEK{Surf\@ce\_9#W}` and the Round 3
   transition: "You found the surface. The timeline is where the story begins to
   make sense."

The portal throttle allows three failed attempts per portal and client IP, then
locks that portal for 480 seconds. This is intentionally simulated in Flask and
is for the local training server only.
