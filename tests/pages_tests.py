from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait


def ensure_login(Case):
        def decorator(function):
              def wrapper():
                  if not Case.driver.find_elements(By.CLASS_NAME, value='iss__header__username'):
                      Case.driver.get(Case.base_url + Case.login_url)

                      [name, password] = Case.driver.find_elements(By.TAG_NAME, value='input')
                      name.send_keys('admin')
                      password.send_keys('admin')

                      Case.driver.find_element(By.TAG_NAME, value='button').click()

                      WebDriverWait(Case.driver, timeout=3).until(lambda d: d.current_url == Case.base_url)
                  function()
              return wrapper
        return decorator


class LoginPageTests:
    login_url = 'login'
    registrations_url ='registration'

    def run_tests(self):
        self.assertTrue(self.driver)
        self.driver.get(self.base_url + self.login_url)

        self._ui_test()
        self._login_test()

    def _ui_test(self):
        self.assertEqual(
            self.driver.find_element(By.TAG_NAME, value='h1').text,
            'Login Page'
        )

        [name, password] = self.driver.find_elements(By.TAG_NAME, value='input')
        self.assertEqual(name.get_dom_attribute('placeholder'), 'username')
        self.assertEqual(password.get_dom_attribute('placeholder'), 'password')

        self.driver.find_element(By.CLASS_NAME, value='iss__formButton')

        reg_link = self.driver.find_element(By.LINK_TEXT, value='Or Registry')
        reg_link.click()

        self.assertEqual(self.driver.current_url, self.base_url + self.registrations_url)
        self.assertEqual(
            self.driver.find_element(By.TAG_NAME, value='h1').text,
            'Registration Page'
        )

        [name, pass1, pass2] = self.driver.find_elements(By.TAG_NAME, value='input')
        self.assertEqual(name.get_dom_attribute('placeholder'), 'username')
        self.assertEqual(pass1.get_dom_attribute('placeholder'), 'password')
        self.assertEqual(pass2.get_dom_attribute('placeholder'), 'confirm password')

        self.driver.find_element(By.CLASS_NAME, value='iss__formButton')

        log_link = self.driver.find_element(By.LINK_TEXT, value='Or Login')
        log_link.click()

        self.assertEqual(self.driver.current_url, self.base_url + 'login')

    def _login_test(self):
        self.driver.get(self.base_url)
        user_logged = len(self.driver.find_elements(By.CLASS_NAME, value='iss__header__username'))
        if not user_logged:
            self.driver.find_element(By.CLASS_NAME, value='iss__header__logoutButton').click()
        [name, password] = self.driver.find_elements(By.TAG_NAME, value='input')

        name.send_keys('admin')
        password.send_keys('admin')

        self.driver.find_element(By.TAG_NAME, value='button').click()

        WebDriverWait(self.driver, timeout=3).until(lambda d: d.current_url == self.base_url)

        self.assertEqual(
            self.driver.find_element(By.CLASS_NAME, value='iss__header__username').text,
            'admin'
        )


class ProjectsPageTests:
    projects_url = ''

    def run_tests(self):
        self.assertTrue(self.driver)
        self.driver.get(self.base_url + self.projects_url)

        self._ui_test()
        self._main_create_test()
        self._main_projects_test()

    @ensure_login
    def _ui_test(self):
        self.assertEqual(self.driver.find_element(By.TAG_NAME, 'h1').text, 'Projects Page')
        self.driver.find_element(By.CLASS_NAME, value='iss__allProjects')

        self.assertEqual(
            len(self.driver.find_elements(By.TAG_NAME, value='input')), 2
        )

    @ensure_login
    def _main_create_test(self):
        self.ensure_login()
        if self.driver.find_element(By.CLASS_NAME, value='iss__titleSwitch__radioItem').text == 'create project':
            self.driver.find_element(By.CLASS_NAME, value='iss__titleSwitch__radioItem').click()
        self.driver.find_element(By.CLASS_NAME, value='iss__projectCreate')

        self.assertFalse(self.driver.find_elements('iss__attributesForm'))

        for _ in range(2):
            self.driver.find_element(By.CLASS_NAME, value='iss__attributecreator__addButton').click()

        forms = self.driver.find_elements(By.CLASS_NAME, value='iss__attributesForm')
        self.assertEqual(len(forms), 2)

        form, *_ = forms

        self.assertEqual(len(form.find_elements(By.TAG_NAME, value='input')), 3)
        self.assertEqual(form.find_element(By.TAG_NAME, value='h2').text, 'Levels:')
        self.assertEqual(form.find_element(By.TAG_NAME, value='h3').text, 'Values:')

        self.assertEqual(
            len(form.find_elements(By.CLASS_NAME, value='iss__attributesForm__levelWrap')),
            1
        )
        self.assertFalse(form.find_elements(By.CLASS_NAME, value='iss__attributeForm'))
        self.assertFalse(form.find_elements(By.CLASS_NAME, value='attribute--child'))

        form.find_element(By.CLASS_NAME, value='iss__attributesForm__levels') \
            .find_element(By.CLASS_NAME, value='iss__attributeForm__titleWrap') \
            .find_element(By.TAG_NAME, value='button') \
            .click()

        for _ in range(2):
            form.find_element(By.CLASS_NAME, value='iss__attributesWrapper') \
                .find_element(By.CLASS_NAME, value='iss__attributeForm__titleWrap') \
                .find_element(By.TAG_NAME, value='button') \
                .click()

        self.assertEqual(
            len(form.find_elements(By.CLASS_NAME, value='iss__attributesForm__levelWrap')),
            2
        )
        self.assertEqual(
            len(form.find_elements(By.CLASS_NAME, value='iss__attributeForm')),
            2
        )

        form.find_elements(By.CLASS_NAME, value='iss__attributeForm')[1] \
            .find_element(By.CLASS_NAME, value='inputButton--add') \
            .click()
        self.assertEqual(len(form.find_elements(By.CLASS_NAME, value='attribute--child')), 1)

        form.find_elements(By.CLASS_NAME, value='iss__attributeForm')[1] \
            .find_element(By.CLASS_NAME, value='attribute--child') \
            .find_element(By.CLASS_NAME, value='inputButton--del') \
            .click()
        self.assertFalse(form.find_elements(By.CLASS_NAME, value='attribute--child'))

        form.find_elements(By.CLASS_NAME, value='iss__attributeForm')[1] \
            .find_element(By.CLASS_NAME, value='inputButton--del') \
            .click()
        self.assertEqual(
            len(form.find_elements(By.CLASS_NAME, value='iss__attributeForm')),
            1
        )

        form.find_elements(By.CLASS_NAME, value='iss__attributesForm__levelInput')[1] \
            .find_element(By.TAG_NAME, value='button') \
            .click()
        self.assertEqual(
            len(form.find_elements(By.CLASS_NAME, value='iss__attributesForm__levelWrap')),
            1
        )

        form.find_elements(By.CLASS_NAME, value='iss__attributesForm__levelInput')[0] \
            .find_element(By.TAG_NAME, value='button') \
            .click()
        self.assertEqual(
            len(self.driver.find_elements(By.CLASS_NAME, value='iss__attributesForm')),
            1
        )

    @ensure_login
    def _main_projects_test(self):
        self.ensure_login()
        if self.driver.find_element(By.CLASS_NAME, value='iss__titleSwitch__radioItem').text == 'all projects':
            self.driver.find_element(By.CLASS_NAME, value='iss__titleSwitch__radioItem').click()
        self.driver.find_element(By.CLASS_NAME, value='iss__allProjects')

        projects = self.driver.find_elements(By.CLASS_NAME, value='iss__projectCard')
        if projects:
            project, *_ = projects
            self.test_project = {
                'name': project.find_element(By.TAG_NAME, value='h3').text,
                'description': project.find_element(By.TAG_NAME, value='p').text,
                'date': project.find_element(By.TAG_NAME, value='time').text,
                'link': project.get_property('href')
            }

            project.click()
            self.assertEqual(self.driver.current_url, self.test_project['link'])

class ProjectPageTests:
    project_base_url = 'project/'

    def run_tests(self): ...

class BlankPageTests:
    def run_tests(self): ...
