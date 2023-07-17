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
    hub_url = 'http://localhost:4444/wd/hub'
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


class PagesTests(
    LoginPageTests,
    RegistrationTest,
    ProjectsPageTests,
    ProjectPageTests,
    BlankPageTests,
):
    def login_page_test(self): LoginPageTests.run_tests(self)

    def registration_page_test(self): RegistrationTest.run_tests(self)

    def projects_page_test(self): ProjectsPageTests.run_tests(self)

    def project_page_test(self): ProjectPageTests.run_tests(self)

    def blank_page_test(self): BlankPageTests.run_tests(self)
