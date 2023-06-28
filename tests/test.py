from selenium import webdriver
from selenium.webdriver.common.by import By
from unittest import TestCase, main

chrome_options = webdriver.ChromeOptions()
# chrome_options.add_argument("--disable-extensions")
chrome_options.add_argument("--headless")
# chrome_options.add_argument('--disable-dev-shm-usage')
# driver = webdriver.Remote(
# 	command_executor='http://localhost:4444/wd/hub',
# 	options=chrome_options
# )

# driver.quit()
d = webdriver.Chrome(options=chrome_options)
d.get('http://localhost:3000')

class Options():
    hub_url = 'http://localhost:4444/wd/hub'
    base_url = 'http://localhost:3000'

    firefox_options = webdriver.FirefoxOptions()
    chrome_options = webdriver.ChromeOptions()
    edge_options = webdriver.EdgeOptions()


class FoxBrowserTest(TestCase, Options):
    def setUp(self):
        option = self.chrome_options
        option.add_argument("--headless")

        self.driver = webdriver.Chrome(options=option)
        # self.driver = webdriver.Remote(
        #   command_executor=self.hub_url,
        #   options=self.firefox_options
        # )
        self.driver.get(self.base_url)

    def tearDown(self): self.driver.quit()

    def test_entry_load(self):
        self.assertEqual(self.driver.title, 'ISS Data Collection Tool')
        self.assertEqual(
            self.driver.find_element(By.TAG_NAME, value='h1').text,
            'Login Page'
        )
        self.assertFalse(self.driver.find_elements(By.CLASS_NAME, value='iss__header__username'))
        self.assertEqual(
            len(self.driver.find_elements(By.CLASS_NAME, value='iss__navLinks__link')),
            2
        )

        [name, password] = self.driver.find_elements(By.TAG_NAME, value='input')
        self.assertEqual(name.get_dom_attribute('placeholder'), 'username')
        self.assertEqual(password.get_dom_attribute('placeholder'), 'password')

        self.assertEqual(
            self.driver.find_element(By.TAG_NAME, value='button').text,
            'submit'
        )

        self.driver.find_element(By.LINK_TEXT, value='Or Registry')





# if __name__ == '__main__': main()