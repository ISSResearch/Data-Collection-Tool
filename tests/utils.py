from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait


def ensure_login(function):
    def wrapper(Case):
        if not Case.driver.find_elements(By.CLASS_NAME, value='iss__header__username'):
            Case.driver.get(Case.base_url + Case.login_url)

            [name, password] = Case.driver.find_elements(By.TAG_NAME, value='input')
            name.send_keys('admin')
            password.send_keys('admin')

            Case.driver.find_element(By.TAG_NAME, value='button').click()

            WebDriverWait(Case.driver, timeout=3).until(
                lambda d: d.find_element(By.CLASS_NAME, value='iss__header__username')
            )
        function(Case)
    return wrapper


@ensure_login
def get_project(Case):
    Case.driver.get(Case.base_url)

    WebDriverWait(Case.driver, timeout=3).until(
        lambda d: d.find_element(By.CLASS_NAME, value='iss__titleSwitch__radioItem')
    )

    if Case.driver.find_element(By.CLASS_NAME, value='iss__titleSwitch__radioItem').text == 'all projects':
        Case.driver.find_element(By.CLASS_NAME, value='iss__titleSwitch__radioItem').click()

    WebDriverWait(Case.driver, timeout=3).until(
        lambda d: len(d.find_elements(By.CLASS_NAME, value='iss__projectCard')) > 0
    )

    projects = Case.driver.find_elements(By.CLASS_NAME, value='iss__projectCard')
    if projects:
        project, *_ = projects
        Case.test_project = {
            'name': project.find_element(By.TAG_NAME, value='h3').text,
            'description': project.find_element(By.TAG_NAME, value='p').text,
            'date': project.find_element(By.TAG_NAME, value='time').text,
            'link': project.get_property('href')
        }


def switch_to_view(driver, switch_text):
    if driver.find_element(By.CLASS_NAME, value='iss__titleSwitch__radioItem--active').text != switch_text:
        for switch in driver.find_elements(By.CLASS_NAME, value='iss__titleSwitch__radioItem'):
            if switch.text == switch_text: switch.click()
