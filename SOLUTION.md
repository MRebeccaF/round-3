# Instructor-Only Solution

Do not link this file from the application.

## Intended route

1. Inspect the home page source. The comment points to `/archives/`.
2. On `/archives/`, follow the counter snapshot. The visitor count is `314`.
3. Try the unlinked school-club route `/club/`. The visible guestbook post number is `792`.
4. Inspect the club page source. The comment points to `/downloads/mirror-2`.
5. The mirror build number is `845`.
6. Inspect the archive page source for `/term-inal/` and its instruction to append `0`.
7. Concatenate in discovery order: `314` + `792` + `845` + `0` = `3147928450`.
8. Enter the code at `/term-inal/` to receive `ADROIT{old_web_never_forgets}`.

## Decoys

- The in-page ads link to `/rickroll/`, which redirects to the Rick Astley video.
- `/human-check/` is a fake icon-click verification and sends players to the same rickroll.
- Broken menu items have no target or lead to `/dead-end/`.