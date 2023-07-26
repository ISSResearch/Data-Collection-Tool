from unittest import TestCase, main
from set_up import BrowserTestMixin


class FoxBrowserTest(BrowserTestMixin, TestCase):
    browser = 'firefox'

    def setUp(self): super().setUp()
    def tearDown(self): super().tearDown()


class ChromeBrowserTest(BrowserTestMixin, TestCase):
    browser = 'chrome'

    def setUp(self): super().setUp()
    def tearDown(self): super().tearDown()


if __name__ == '__main__': main()
