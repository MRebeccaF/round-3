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
    at `/term-inal/final` to receive `ADROIT{old_web_never_forgets}`. The final
    terminal rejects submissions until every shelf card has been inspected.

## Decoys

- The in-page ads link to `/rickroll/`, which redirects to the Rick Astley video.
- `/human-check/` is a fake icon-click verification and sends players to the same rickroll.
- Broken menu items have no target or lead to `/dead-end/`.
