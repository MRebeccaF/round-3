import unittest

from app import FINAL_CODE, app


class AdroitGameTests(unittest.TestCase):
    def setUp(self):
        app.config.update(TESTING=True, SECRET_KEY="test-key")
        self.client = app.test_client()

    def test_real_clue_pages_are_available(self):
        for path in ("/", "/archives/", "/archives/counter", "/club/", "/downloads/mirror-2"):
            response = self.client.get(path)
            self.assertEqual(response.status_code, 200)

    def test_terminal_rejects_an_incorrect_code(self):
        response = self.client.post("/term-inal/", data={"code": "0000000000"})
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"ACCESS DENIED", response.data)

    def test_terminal_accepts_the_discovered_code(self):
        response = self.client.post("/term-inal/", data={"code": FINAL_CODE}, follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"ADROIT{old_web_never_forgets}", response.data)

    def test_success_requires_a_solved_session(self):
        response = self.client.get("/term-inal/success")
        self.assertEqual(response.status_code, 302)
        self.assertIn(b"/term-inal/", response.data)


if __name__ == "__main__":
    unittest.main()