import json
import logging
import threading
import multiprocessing

from marshmallow import ValidationError
from apscheduler.job import Job
from tornado.escape import json_decode
from tornado.ioloop import IOLoop
from tornado.web import Application, RequestHandler as BaseRequestHandler, HTTPError, RedirectHandler, StaticFileHandler

from dida.schemas import JobSchema, FunctionSchema, SchedulerSchema
from dida.core import Function
from dida.scheduler import scheduler


class RequestHandler(BaseRequestHandler):
    def data_received(self, chunk: bytes):
        pass

    def json(self):
        try:
            return json_decode(self.request.body)
        except json.JSONDecodeError:
            raise HTTPError(400, "Expect to accept a JSON.")


class DaemonApi(RequestHandler):
    def get(self):
        daemon = dict(thread_count=threading.active_count(), subprocess_count=len(multiprocessing.active_children()))
        self.finish(daemon)


class SchedulerApi(RequestHandler):
    def get(self):
        self.write(SchedulerSchema().dump(scheduler))


class JobsApi(RequestHandler):

    def get(self):
        jobs = scheduler.get_jobs()
        self.write(dict(jobs=JobSchema().dump(jobs, many=True)))

    def post(self):
        data = self.json()
        try:
            data = JobSchema().load(data)
        except ValidationError as exc:
            raise HTTPError(400) from exc

        job = scheduler.add_job(**data)
        self.write(JobSchema().dump(job))


def get_job(job_id) -> Job:
    job = scheduler.get_job(job_id)
    if job:
        return job
    raise HTTPError(404)


class JobApi(RequestHandler):
    def get(self, job_id):
        self.write(JobSchema().dump(get_job(job_id)))

    def put(self, job_id):
        data = self.json()
        try:
            data = JobSchema().load(data)
        except ValidationError as exc:
            raise HTTPError(400) from exc

        job = scheduler.modify_job(job_id, **data)
        self.write(JobSchema().dump(job))

    def delete(self, job_id):
        job = get_job(job_id)
        job.remove()
        self.finish()


class JobActionsApi(RequestHandler):
    def post(self, job_id, action):
        job = get_job(job_id)
        if action == 'pause':
            job.pause()
        elif action == 'resume':
            job.resume()
        else:
            raise HTTPError(404)
        self.write(JobSchema().dump(job))


class FunctionsApi(RequestHandler):
    def get(self):
        chunk = dict(functions=FunctionSchema().dump(Function.manager.get_all(), many=True))
        self.write(chunk)


def make_app(debug=False):
    import os

    from tornado.log import enable_pretty_logging

    enable_pretty_logging()
    scheduler.start()

    static_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'web'))

    return Application([
        (r'/', RedirectHandler, dict(url='/web/', permanent=False)),
        (r'/web/(.*)', StaticFileHandler, dict(path=static_path, default_filename='index.html')),
        (r'/api/daemon', DaemonApi),
        (r'/api/scheduler', SchedulerApi),
        (r'/api/jobs', JobsApi),
        (r'/api/jobs/(?P<job_id>[^/]*)', JobApi),
        (r'/api/jobs/(?P<job_id>.*)/actions/(?P<action>.*)', JobActionsApi),
        (r'/api/functions', FunctionsApi),
    ], debug=debug)


if __name__ == '__main__':
    app = make_app(debug=True)
    app.listen(8888)
    IOLoop.current().start()
