import json

from tornado.testing import AsyncHTTPTestCase
from tornado.ioloop import IOLoop

from dida.app import make_app


class TestApi(AsyncHTTPTestCase):
    def get_app(self):
        return make_app()

    def _test_scheduler(self, expected_state, action=None):
        if action is None:
            response = self.fetch('/api/scheduler')
        else:
            response = self.fetch('/api/scheduler/actions/%s' % action, method='POST', body='')
        response.rethrow()
        data = json.loads(response.body)
        self.assertEqual(expected_state, data['state'])

    def get_new_ioloop(self):
        return IOLoop.current()

    def test_scheduler(self):
        self._test_scheduler(0)
        self._test_scheduler(1, 'start')
        self._test_scheduler(2, 'pause')
        self._test_scheduler(1, 'resume')
        self._test_scheduler(0, 'shutdown')

    def test_jobs(self):
        response = self.fetch('/api/jobs')
        data = json.loads(response.body)
        self.assertListEqual([], data['jobs'])
