from unittest import TestCase, main
from set_up import Options, PagesTests, By, WebDriverWait


class FoxBrowserTest(TestCase, Options, PagesTests):
    __slots__ = {'driver', 'test_project'}

    def setUp(self):
        self.start_driver('firefox')
        self.test_project = None

    def tearDown(self): self.driver.quit()

    def test_entry_load(self):
        self.driver.get(self.base_url)
        WebDriverWait(self.driver, timeout=3).until(
            lambda d: d.title == 'ISS Data Collection Tool'
        )
        self.assertEqual(
            self.driver.find_element(By.TAG_NAME, value='h1').text,
            'Login Page'
        )
        self.assertFalse(self.driver.find_elements(By.CLASS_NAME, value='iss__header__username'))
        self.assertEqual(
            len(self.driver.find_elements(By.CLASS_NAME, value='iss__navLinks__link')),
            2
        )

    # def test_login_page(self): self.login_page_test()

    # def test_registration_page(self): self.registration_page_test()

    # def test_projects_page(self): self.projects_page_test()

    # def test_project_page(self): self.project_page_test()

    # def test_blank_page(self): self.blank_page_test()


if __name__ == '__main__': main()
