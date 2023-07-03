from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from utils import ensure_login, get_project, switch_to_view


class LoginPageTests:
    login_url = 'login'

    def run_tests(self):
        self.assertTrue(self.driver)
        self.driver.get(self.base_url + self.login_url)

        user_logged = len(self.driver.find_elements(By.CLASS_NAME, value='iss__header__username'))
        if user_logged:
            self.driver.find_element(By.CLASS_NAME, value='iss__header__logoutButton').click()

        self._login_ui_test()
        self._login_invalid_login()
        self._login_login_test()

    def _login_ui_test(self):
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

    def _login_invalid_login(self):
        user_logged = len(self.driver.find_elements(By.CLASS_NAME, value='iss__header__username'))
        if user_logged:
            self.driver.find_element(By.CLASS_NAME, value='iss__header__logoutButton').click()
        self.driver.get(self.base_url + self.login_url)

        [name, password] = self.driver.find_elements(By.TAG_NAME, value='input')

        name.send_keys('admin_invalid1231231230978')
        password.send_keys('admin_invalid12398789668')

        self.driver.find_element(By.TAG_NAME, value='button').click()

        WebDriverWait(self.driver, timeout=3).until(
            lambda d: d.find_element(By.CLASS_NAME, value='iss__formContainer__errors')
        )

    def _login_login_test(self):
        user_logged = len(self.driver.find_elements(By.CLASS_NAME, value='iss__header__username'))
        if user_logged:
            self.driver.find_element(By.CLASS_NAME, value='iss__header__logoutButton').click()
        self.driver.get(self.base_url)

        [name, password] = self.driver.find_elements(By.TAG_NAME, value='input')

        name.send_keys('admin')
        password.send_keys('admin')

        self.driver.find_element(By.TAG_NAME, value='button').click()

        WebDriverWait(self.driver, timeout=3).until(
            lambda d: d.find_element(By.CLASS_NAME, value='iss__header__username')
        )

        self.assertEqual(
            self.driver.find_element(By.CLASS_NAME, value='iss__header__username').text,
            'admin'
        )


class RegistrationTest:
    registrations_url ='registration'

    def run_tests(self):
        self.assertTrue(self.driver)
        self.driver.get(self.base_url + self.registrations_url)

        self._registration_ui_test()
        self._registration_invalid_test()
        # self._registration_valid_test()

    def _registration_ui_test(self):
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

    def _registration_invalid_test(self):
          user_logged = len(self.driver.find_elements(By.CLASS_NAME, value='iss__header__username'))
          if user_logged:
              self.driver.find_element(By.CLASS_NAME, value='iss__header__logoutButton').click()

          self.driver.get(self.base_url + self.registrations_url)

          [name, pass1, pass2] = self.driver.find_elements(By.TAG_NAME, value='input')

          name.send_keys('FailInutTestName')
          pass1.send_keys('FailInutTestName1290')
          pass2.send_keys('FailInutTestName1190')

          self.driver.find_element(By.TAG_NAME, value='button').click()

          WebDriverWait(self.driver, timeout=3).until(
              lambda d: d.find_element(By.CLASS_NAME, value='iss__formContainer__errors')
          )

    def _registration_valid_test(self):
        user_logged = len(self.driver.find_elements(By.CLASS_NAME, value='iss__header__username'))
        if user_logged:
            self.driver.find_element(By.CLASS_NAME, value='iss__header__logoutButton').click()

        self.driver.get(self.base_url + self.registrations_url)

        [name, pass1, pass2] = self.driver.find_elements(By.TAG_NAME, value='input')

        name.send_keys('NewTestUser')
        pass1.send_keys('NewPassword1290')
        pass2.send_keys('NewPassword1290')

        self.driver.find_element(By.TAG_NAME, value='button').click()

        WebDriverWait(self.driver, timeout=3).until(
            lambda d: d.find_element(By.CLASS_NAME, value='iss__header__username')
        )

        self.assertEqual(
            self.driver.find_element(By.CLASS_NAME, value='iss__header__username').text,
            'NewTestUser'
        )

class ProjectsPageTests:
    projects_url = ''

    def run_tests(self):
        self.assertTrue(self.driver)
        self.driver.get(self.base_url + self.projects_url)

        self._projects_ui_test()
        self._projects_main_create_test()
        self._projects_main_projects_test()

    @ensure_login
    def _projects_ui_test(self):
        self.assertEqual(self.driver.find_element(By.TAG_NAME, 'h1').text, 'Projects Page')
        self.driver.find_element(By.CLASS_NAME, value='iss__allProjects')

        self.assertEqual(
            len(self.driver.find_elements(By.TAG_NAME, value='input')), 2
        )

    @ensure_login
    def _projects_main_create_test(self):
        switch_to_view(self.driver, 'create project')

        self.driver.find_element(By.CLASS_NAME, value='iss__projectCreate')

        self.assertFalse(self.driver.find_elements(By.CLASS_NAME, value='iss__attributesForm'))

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
    def _projects_main_projects_test(self):
        switch_to_view(self.driver, 'all projects')

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

    def run_tests(self):
        self.assertTrue(self.driver)

        if not self.test_project: get_project(self)

        self._project_ui_test()
        self._project_upload_test()
        self._project_validate_test()

    @ensure_login
    def _project_ui_test(self):
        self.driver.get(self.test_project['link'])

        WebDriverWait(self.driver, timeout=3).until(
            lambda d: d.find_element(By.TAG_NAME, value='h1').text == self.test_project['name']
        )

        self.driver.find_element(By.CLASS_NAME, value='iss__projectPage__button')

        self.assertEqual(
            self.driver.find_element(By.TAG_NAME, value='p').text,
            'Description: ' + self.test_project['description']
        )

        self.assertEqual(
            len(
                self.driver \
                    .find_element(By.CLASS_NAME, value='iss__titleSwitch__radio') \
                    .find_elements(By.TAG_NAME, value='input')
            ),
            5
        )

    @ensure_login
    def _project_upload_test(self):
        switch_to_view(self.driver, 'upload data')

        WebDriverWait(self.driver, timeout=3).until(
            lambda d: d.find_element(By.CLASS_NAME, value='iss__filesUpload')
        )

        self.assertEqual(
            len(self.driver.find_elements(By.CLASS_NAME, value='iss__selectGroup__selectWrapper')),
            1
        )
        self.driver.find_element(By.CLASS_NAME, value='send--disabled')
        self.assertEqual(
            self.driver.find_element(By.CLASS_NAME, value='button--disabled').text,
            'apply to all'
        )

        self.driver.find_element(By.CLASS_NAME, value='add--group').click()
        self.assertEqual(
            len(self.driver.find_elements(By.CLASS_NAME, value='iss__selectGroup__selectWrapper')),
            2
        )

        self.driver \
            .find_elements(By.CLASS_NAME, value='iss__selectGroup__selectWrapper')[1] \
            .find_element(By.TAG_NAME, value='button').click()
        self.assertEqual(
            len(self.driver.find_elements(By.CLASS_NAME, value='iss__selectGroup__selectWrapper')),
            1
        )
        # TODO: is there a way to proceed?

    @ensure_login
    def _project_validate_test(self):
        switch_to_view(self.driver, 'validate data')

        WebDriverWait(self.driver, timeout=3).until(
            lambda d: d.find_element(By.CLASS_NAME, value='iss__validation')
        )

        self.driver.find_element(By.CLASS_NAME, value='iss__fileSelector')
        self.driver.find_element(By.CLASS_NAME, value='iss__fileswiper')
        self.driver.find_element(By.CLASS_NAME, value='iss__fileInfo')

        cards = self.driver.find_elements(By.CLASS_NAME, value='iss__fileCard')
        if cards:
            try:
              cardOne, cardTwo, *_ = cards
            except ValueError:
                cardOne, *_ = cards
                cardTwo = None

            self.assertIn('card--active', cardOne.get_dom_attribute('class').split(' '))

            if cardTwo:
                cardTwo.click()
                self.assertNotIn('card--active', cardOne.get_dom_attribute('class').split(' '))
                self.assertIn('card--active', cardTwo.get_dom_attribute('class').split(' '))

            cardOne.click()

            # self.driver.find_element(By.CLASS_NAME, value=(
            #     'button--accept'
            #     if len(set(cardOne.get_dom_attribute('class').split(' ')) - {'card--accepted'}) > 1
            #     else 'button--reject'
            # )).click()

            # cardOne.click()

            # WebDriverWait(self.driver, timeout=3).until(
            #     lambda d: 3 == self.driver \
            #         .find_elements(By.CLASS_NAME, value='iss__fileCard')[1] \
            #         .get_dom_attribute('class').split(' ') \
            #         .__len__()
            # )


class BlankPageTests:
    def run_tests(self): ...
