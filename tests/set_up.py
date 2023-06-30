from selenium import webdriver
from pages_tests import (
    LoginPageTests,
    ProjectsPageTests,
    ProjectPageTests,
    BlankPageTests,
    By,
    WebDriverWait
)


class Options:
    hub_url = 'http://localhost:4444/wd/hub'
    base_url = 'http://localhost:3000/'

    def start_driver(self, browser):
        options_map = {
            'chrome': webdriver.ChromeOptions,
            'firefox': webdriver.FirefoxOptions,
            'edge': webdriver.EdgeOptions,
        }

        option = options_map[browser]()
        option.add_argument("--headless")

        return webdriver.Chrome(options=option)
        # self.driver = webdriver.Remote(
        #   command_executor=self.hub_url,
        #   options=self.firefox_options
        # )


class PagesTests(
    LoginPageTests,
    ProjectsPageTests,
    ProjectPageTests,
    BlankPageTests,
):
    def login_page_test(self): super(LoginPageTests, self).run_tests()

    def projects_page_test(self): super(ProjectsPageTests, self).run_tests()

    def project_page_test(self): super(ProjectPageTests, self).run_tests()

    def blank_page_test(self): super(BlankPageTests, self).run_tests()
