from selenium.webdriver import Keys, ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.common.actions.action_builder import ActionBuilder
from selenium.webdriver.common.actions.wheel_input import ScrollOrigin
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

        self.driver.get(self.test_project['link'])

        WebDriverWait(self.driver, timeout=3).until(
            lambda d: d.find_element(By.TAG_NAME, value='h1').text == self.test_project['name']
        )

        self._project_ui_test()
        self._project_upload_test()
        self._project_validate_test()
        self._project_download_test()
        self._project_statistics_test()
        self._project_editing_test()

    @ensure_login
    def _project_ui_test(self):
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

        cards = self.driver.find_elements(By.CLASS_NAME, value='iss__fileCard')[:2]
        cards.extend([
            type(
                'fakeCard',
                (object, ),
                {'get_dom_attribute': lambda x: x,'click': lambda _: ..., 'fake': True}
            )
            for _ in range(2 - len(cards))
        ])

        self.assertNotEqual(cards[0].__class__, 'fakeCard')

        self.__project_validate_filecards_test(cards)
        self.__project_validate_media_test(cards)
        self.__project_validate_fileinfo_test(cards)

    @ensure_login
    def _project_download_test(self):
        self.driver.refresh()
        WebDriverWait(self.driver, timeout=3).until(
            lambda d: d.find_element(By.TAG_NAME, value='h1').text == self.test_project['name']
        )

        switch_to_view(self.driver, 'download data')
        WebDriverWait(self.driver, timeout=3).until(
            lambda d: d.find_element(By.CLASS_NAME, value='iss__filesDownload')
        )
        optionCases = (
            ('option--all', 'all files'),
            ('option--validation', 'on validation'),
            ('option--accepted', 'accepted files'),
            ('option--declined', 'declined files')
        )
        selector = self.driver.find_element(By.CLASS_NAME, value='iss__filesDownload__selector')
        selected = self.driver.find_element(By.CLASS_NAME, value='iss__filesDownload__selected')
        options = self.driver.find_element(By.CLASS_NAME, value='iss__filesDownload__options__wrap')

        for _class, text in optionCases:
            selector.click()
            self.assertEqual(
                options.get_dom_attribute('class'),
                'iss__filesDownload__options__wrap options--open'
            )
            self.driver.find_element(By.CLASS_NAME, value=_class).click()
            self.assertEqual(selected.text, text)
            self.assertNotEqual(
                options.get_dom_attribute('class'),
                'iss__filesDownload__options__wrap options--open'
            )

    @ensure_login
    def _project_statistics_test(self):
        switch_to_view(self.driver, 'statistics')
        WebDriverWait(self.driver, timeout=3).until(
            lambda d: d.find_element(By.CLASS_NAME, value='iss__stats__table')
        )

        rows = self.driver.find_elements(By.CLASS_NAME, value='iss__stats__table-row')

    @ensure_login
    def _project_editing_test(self):
        self.driver.refresh()
        WebDriverWait(self.driver, timeout=3).until(
            lambda d: d.find_element(By.TAG_NAME, value='h1').text == self.test_project['name']
        )
        switch_to_view(self.driver, 'editing')

        self.driver.find_element(By.CLASS_NAME, value='iss__projectEdit__form')
        self.assertFalse(self.driver.find_elements(By.TAG_NAME, value='p'))

        self.assertFalse(self.driver.find_elements(By.CLASS_NAME, value='iss__projectEdit__deleteProceed'))
        self.driver.find_element(By.CLASS_NAME, value='iss__projectEdit__deleteButton').click()
        self.driver \
            .find_element(By.CLASS_NAME, value='iss__projectEdit__deleteProceed') \
            .find_element(By.TAG_NAME, value='input').send_keys(self.test_project['name'] + 'zxc123')
        self.driver.find_element(By.CLASS_NAME, value='iss__projectEdit__delete--yes').click()
        self.assertEqual(self.driver.switch_to.alert.text, 'Entered name differs from the actual Project name.')
        self.driver.switch_to.alert.dismiss()
        self.assertFalse(self.driver.find_elements(By.CLASS_NAME, value='iss__projectEdit__deleteProceed'))
        self.driver.find_element(By.CLASS_NAME, value='iss__projectEdit__deleteButton')

        new_attribute_forms, _  = self.driver.find_elements(By.CLASS_NAME, value='iss__attributecreator')
        self.assertFalse(
            new_attribute_forms.find_elements(By.CLASS_NAME, value='iss__attributesForm')
        )
        new_attribute_forms \
            .find_element(By.CLASS_NAME, value='iss__attributecreator__addButton') \
            .click()
        self.assertEqual(
            new_attribute_forms \
                .find_elements(By.CLASS_NAME, value='iss__attributesForm') \
                .__len__(),
            1
        )

    def __project_validate_filecards_test(self, cards):
        cardOne, cardTwo = cards

        self.assertIn('card--active', cardOne.get_dom_attribute('class').split(' '))

        ActionChains(self.driver).key_down(Keys.ARROW_RIGHT).perform()
        (
            self.assertIn if cardTwo.__class__ == 'fakeCard'
            else self.assertNotIn
        )('card--active', cardOne.get_dom_attribute('class').split(' '))
        (
            self.assertNotIn if cardTwo.__class__ == 'fakeCard'
            else self.assertIn
        )('card--active', cardTwo.get_dom_attribute('class').split(' '), 'a')

        ActionChains(self.driver).key_down(Keys.ARROW_LEFT).perform()
        (
            self.assertIn if not cardTwo.__class__ == 'fakeCard'
            else self.assertNotIn
        )('card--active', cardOne.get_dom_attribute('class').split(' '))
        (
            self.assertNotIn if not cardTwo.__class__ == 'fakeCard'
            else self.assertIn
        )('card--active', cardTwo.get_dom_attribute('class').split(' '))

        # if cardTwo.__class__ != 'fakeCard':
        #     cardTwo.click()
        #     self.assertNotIn('card--active', cardOne.get_dom_attribute('class').split(' '))
        #     self.assertIn('card--active', cardTwo.get_dom_attribute('class').split(' '))

    def __project_validate_media_test(self, cards):
        cardOne, cardTwo = cards

        self.assertEqual(
            self.driver \
                .find_element(By.CLASS_NAME, value='iss__fileswiper__controls') \
                .value_of_css_property('transform'),
            'matrix(1, 0, 0, 1, -95.5, 57)'
        )

        media = self.driver \
            .find_element(By.CLASS_NAME, value='zoomWrap') \
            .find_element(By.TAG_NAME, value='div')
        self.assertEqual(
            media.get_dom_attribute('style'),
            'transform: translate(0px, 0px) scale(1);'
        )

        ActionChains(self.driver).move_to_element(media).pause(1).perform()
        self.assertEqual(
            self.driver \
                .find_element(By.CLASS_NAME, value='iss__fileswiper__controls') \
                .value_of_css_property('transform'),
            'matrix(1, 0, 0, 1, -95.5, -11.4)'
        )
        ActionChains(self.driver) \
            .click_and_hold(media) \
            .move_by_offset(10, 10) \
            .perform()
        self.assertEqual(
            media.get_dom_attribute('style'),
            'transform: translate(10px, 10px) scale(1);'
        )
        # TODO: doesnt work as expected following
        ActionChains(self.driver) \
            .scroll_from_origin(ScrollOrigin.from_element(media), 0, 0) \
            .perform()
        self.assertEqual(
            media.get_dom_attribute('style'),
            'transform: translate(28.0952px, 31.4762px) scale(0.952381);'
        )
        ActionChains(self.driver).key_down('x').perform()
        self.assertEqual(
            media.get_dom_attribute('style'),
            'transform: translate(0px, 0px) scale(1);'
        )
        ActionChains(self.driver) \
            .click_and_hold(media) \
            .move_by_offset(20, 40) \
            .perform()
        self.assertEqual(
            media.get_dom_attribute('style'),
            'transform: translate(20px, 40px) scale(1);'
        )
        self.driver.find_element(By.CLASS_NAME, value='slide-res').click()
        self.assertEqual(
            media.get_dom_attribute('style'),
            'transform: translate(0px, 0px) scale(1);'
        )

        self.assertIn('card--active', cardOne.get_dom_attribute('class').split(' '))
        self.assertNotIn('card--active', cardTwo.get_dom_attribute('class').split(' '))

        ActionChains(self.driver) \
            .click_and_hold(media) \
            .move_by_offset(20, 40) \
            .perform()
        self.assertEqual(
            media.get_dom_attribute('style'),
            'transform: translate(20px, 40px) scale(1);'
        )
        self.driver.find_element(By.CLASS_NAME, value='slide-inc').click()
        self.assertNotIn('card--active', cardOne.get_dom_attribute('class').split(' '))
        self.assertIn('card--active', cardTwo.get_dom_attribute('class').split(' '))
        self.assertEqual(
            media.get_dom_attribute('style'),
            'transform: translate(0px, 0px) scale(1);'
        )
        self.driver.find_element(By.CLASS_NAME, value='slide-dec').click()
        self.assertIn('card--active', cardOne.get_dom_attribute('class').split(' '))
        self.assertNotIn('card--active', cardTwo.get_dom_attribute('class').split(' '))

        ActionBuilder(self.driver).clear_actions()

    def __project_validate_fileinfo_test(self, cards):
        cardOne, cardTwo = cards

        self.driver.find_element(By.CLASS_NAME, value='style--min')
        self.assertEqual(
            self.driver \
                .find_element(By.CLASS_NAME, value='iss__fileInfo__buttonsWrap') \
                .find_elements(By.TAG_NAME, value='button') \
                .__len__(),
            2
        )
        self.assertEqual(
            len(self.driver.find_elements(By.CLASS_NAME, value='iss__selectGroup__selectWrapper')),
            1
        )
        self.driver.find_element(By.CLASS_NAME, value='add--group').click()
        self.assertEqual(
            len(self.driver.find_elements(By.CLASS_NAME, value='iss__selectGroup__selectWrapper')),
            2
        )
        self.driver \
            .find_elements(By.CLASS_NAME, value='iss__selectGroup__selectWrapper')[-1] \
            .find_element(By.CLASS_NAME, value='del--group') \
            .click()
        self.assertEqual(
            len(self.driver.find_elements(By.CLASS_NAME, value='iss__selectGroup__selectWrapper')),
            1
        )

        # self.driver.find_element(By.CLASS_NAME, value=(
        #     'button--accept'
        #     if len(set(cardOne.get_dom_attribute('class').split(' ')) - {'card--accepted'}) > 1
        #     else 'button--reject'
        # )).click()

        # cardOne.click()

        # WebDriverWait(self.driver, timeout=3).until(
        #     lambda d: 3 == d \
        #         .find_elements(By.CLASS_NAME, value='iss__fileCard')[1] \
        #         .get_dom_attribute('class').split(' ') \
        #         .__len__()
        # )


class BlankPageTests:
    def run_tests(self): ...
