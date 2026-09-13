import unittest

from app import ARCHIVE_CODE, FINAL_CODE, FINAL_KEY, app


class AdroitGameTests(unittest.TestCase):
    def setUp(self):
        app.config.update(
            TESTING=True,
            SECRET_KEY="test-key",
            PORTAL_ATTEMPTS={},
            PORTAL_LOCKOUTS={},
        )
        self.client = app.test_client()

    def collect_all_fragments(self):
        for path in (
            "/archives/counter",
            "/club/",
            "/downloads/mirror-2",
            "/old-files/club-2009-roster.txt",
        ):
            self.client.get(path)

    def unlock_stage_one(self):
        self.collect_all_fragments()
        return self.client.post("/term-inal/", data={"code": ARCHIVE_CODE}, follow_redirects=True)

    def unlock_packet_log(self):
        self.unlock_stage_one()
        return self.client.post("/archives/packet-log", data={"packet_key": "RELAY"}, follow_redirects=True)

    def inspect_all_relay_nodes(self):
        for path in (
            "/archives/relay/north",
            "/archives/relay/east",
            "/archives/relay/south",
            "/archives/relay/west",
            "/archives/relay/central",
            "/archives/relay/library",
            "/archives/relay/lab",
            "/archives/relay/modem",
        ):
            self.client.get(path)

    def unlock_relay(self):
        self.unlock_packet_log()
        self.inspect_all_relay_nodes()
        return self.client.post("/term-inal/relay", data={"code": FINAL_CODE}, follow_redirects=True)

    def inspect_all_codebook_shelves(self):
        for path in (
            "/archives/codebook/north",
            "/archives/codebook/east",
            "/archives/codebook/south",
            "/archives/codebook/west",
            "/archives/codebook/library",
            "/archives/codebook/central",
            "/archives/codebook/lab",
            "/archives/codebook/modem",
        ):
            self.client.get(path)

    def test_real_clue_pages_are_available(self):
        for path in (
            "/",
            "/archives/",
            "/archives/counter",
            "/club/",
            "/downloads/mirror-2",
            "/old-files/club-2009-roster.txt",
        ):
            response = self.client.get(path)
            self.assertEqual(response.status_code, 200)

    def test_terminal_locks_direct_submissions_until_fragments_are_recovered(self):
        response = self.client.post("/term-inal/", data={"code": ARCHIVE_CODE})
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"ACCESS LOCKED", response.data)

    def test_terminal_rejects_an_incorrect_recovered_code(self):
        self.collect_all_fragments()
        response = self.client.post("/term-inal/", data={"code": "0000000000"})
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"ACCESS DENIED", response.data)

    def test_initial_terminal_opens_the_secondary_archive(self):
        response = self.unlock_stage_one()
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"PARTIAL ARCHIVE UNLOCKED", response.data)

    def test_packet_log_requires_stage_one_and_correct_cipher_key(self):
        response = self.client.get("/archives/packet-log")
        self.assertEqual(response.status_code, 302)
        self.assertIn(b"/term-inal/", response.data)

        self.unlock_stage_one()
        response = self.client.post("/archives/packet-log", data={"packet_key": "WRONG"})
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"PACKET REJECTED", response.data)

    def test_relay_terminal_locks_until_nodes_are_inspected(self):
        self.unlock_packet_log()
        response = self.client.post("/term-inal/relay", data={"code": FINAL_CODE})
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"RELAY LOCKED", response.data)

    def test_relay_terminal_opens_the_codebook_after_full_investigation(self):
        response = self.unlock_relay()
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"MICROFILM CODEBOOK", response.data)

    def test_final_terminal_locks_until_shelves_are_inspected(self):
        self.unlock_relay()
        response = self.client.post("/term-inal/final", data={"key": FINAL_KEY})
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"CODEBOOK LOCKED", response.data)

    def test_archive_completion_serves_the_adroit_decoy_flag(self):
        self.unlock_relay()
        self.inspect_all_codebook_shelves()
        response = self.client.post("/term-inal/final", data={"key": FINAL_KEY}, follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"ADROIT{old\\_web\\_never\\_forgets}", response.data)
        self.assertNotIn(b"CYBERLEEK{Surf\\@ce\\_9#W}", response.data)

    def test_unknown_old_file_is_still_not_found(self):
        response = self.client.get("/old-files/answer.txt")
        self.assertEqual(response.status_code, 404)

    def test_success_requires_a_solved_session(self):
        response = self.client.get("/term-inal/success")
        self.assertEqual(response.status_code, 302)
        self.assertIn(b"/term-inal/", response.data)

    def test_enumeration_portals_and_bait_are_available(self):
        real_portal = self.client.get("/internal-portal-x92")
        decoy_portal = self.client.get("/staging-portal-y44")
        bait = self.client.get("/flag")

        self.assertEqual(real_portal.status_code, 200)
        self.assertIn(b"/static/app.js", real_portal.data)
        self.assertEqual(decoy_portal.status_code, 200)
        self.assertNotIn(b"/static/app.js", decoy_portal.data)
        self.assertEqual(bait.status_code, 200)
        self.assertIn(b"CTF{", bait.data)

    def test_mirror_cache_endpoint_is_unlinked_but_discoverable_without_a_session(self):
        robots = self.client.get("/robots.txt")
        evidence = self.client.get("/mirror-cache-9w")

        self.assertEqual(robots.status_code, 200)
        self.assertIn(b"Disallow: /admin", robots.data)
        self.assertNotIn(b"mirror-cache-9w", robots.data)
        self.assertEqual(evidence.status_code, 200)
        self.assertIn(b"CYBERLEEK{Surf\\@ce\\_9#W}", evidence.data)
        self.assertIn(b"You found the surface.", evidence.data)

    def test_each_portal_has_its_own_login_and_decoy_flag(self):
        response = self.client.post(
            "/staging-portal-y44",
            data={"username": "dev_admin", "password": "Staging123!"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn(b"CTF{av0dkfjwplqz", response.data)

    def test_real_portal_throttles_wrong_attempts_before_accepting_a_login(self):
        for _ in range(3):
            response = self.client.post(
                "/internal-portal-x92",
                data={"username": "dev_admin", "password": "wrong"},
            )
            self.assertIn(b"Invalid credentials", response.data)

        locked = self.client.post(
            "/internal-portal-x92",
            data={"username": "dev_admin", "password": "yT7g#BCK!BQ4"},
        )

        self.assertEqual(locked.status_code, 429)
        self.assertIn(b"LOCKED", locked.data)

    def test_hidden_mirror_evidence_requires_real_portal_access(self):
        denied = self.client.get("/evidence/surface-9w")
        self.assertEqual(denied.status_code, 404)

        response = self.client.post(
            "/internal-portal-x92",
            data={"username": "dev_admin", "password": "yT7g#BCK!BQ4"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn(b"MIRROR INDEX RECOVERED", response.data)
        self.assertNotIn(b"CYBERLEEK{Surf\\@ce\\_9#W}", response.data)

        evidence = self.client.get("/evidence/surface-9w")
        self.assertEqual(evidence.status_code, 200)
        self.assertIn(b"CYBERLEEK{Surf\\@ce\\_9#W}", evidence.data)
        self.assertIn(b"You found the surface.", evidence.data)


if __name__ == "__main__":
    unittest.main()
