from selenium import webdriver
from pages_tests import (
    LoginPageTests,
    RegistrationTest,
    ProjectsPageTests,
    ProjectPageTests,
    BlankPageTests,
    By,
    WebDriverWait
)


class Options:
    hub_url = 'http://iss-selenium-hub:4444/wd/hub'
    base_url = 'http://iss-test-front:3000/'

    def start_driver(self, browser):
        options_map = {
            'chrome': webdriver.ChromeOptions,
            'firefox': webdriver.FirefoxOptions,
            'edge': webdriver.EdgeOptions,
        }

        option = options_map[browser]()
        option.add_argument("--headless")

        self.driver = webdriver.Remote(
            command_executor=self.hub_url,
            options=option
        )


class BrowserTestMixin(
    Options,
    LoginPageTests,
    RegistrationTest,
    ProjectsPageTests,
    ProjectPageTests,
    BlankPageTests,
):
    def setUp(self):
        print(f'Running {self.browser} tests...')
        self.start_driver(self.browser)
        self.test_project = None

    def tearDown(self): self.driver.quit()

    def test_browser(self):
        self._test_entry_load()
        self.run_login_tests()
        self.run_registration_tests()
        self.run_projectspage_tests()
        self.run_projectpage_tests()
        self.run_blankpage_tests()

    def _test_entry_load(self):
        self.driver.get(self.base_url)
        WebDriverWait(self.driver, timeout=3).until(
            lambda d: d.title == 'ISS Data Collection Tool'
        )
        WebDriverWait(self.driver, timeout=3).until(
            lambda d: d.find_element(By.TAG_NAME, value='h1')
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
