import unittest

from app import ARCHIVE_CODE, FINAL_CODE, FINAL_KEY, app


class AdroitGameTests(unittest.TestCase):
    def setUp(self):
        app.config.update(TESTING=True, SECRET_KEY="test-key")
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

    def test_final_terminal_awards_the_flag_after_full_investigation(self):
        self.unlock_relay()
        self.inspect_all_codebook_shelves()
        response = self.client.post("/term-inal/final", data={"key": FINAL_KEY}, follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"ADROIT{old_web_never_forgets}", response.data)

    def test_unknown_old_file_is_still_not_found(self):
        response = self.client.get("/old-files/answer.txt")
        self.assertEqual(response.status_code, 404)

    def test_success_requires_a_solved_session(self):
        response = self.client.get("/term-inal/success")
        self.assertEqual(response.status_code, 302)
        self.assertIn(b"/term-inal/", response.data)


if __name__ == "__main__":
    unittest.main()
