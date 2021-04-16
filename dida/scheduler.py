import datetime
import logging
from concurrent.futures.thread import ThreadPoolExecutor

from tornado.ioloop import IOLoop

from dida.job import Job
from dida.stores import Store
from dida.stores.memory import MemoryStore
from dida.utils.enums import ExecutorEnum

logger = logging.getLogger(__name__)


class Scheduler:
    def __init__(self, *, store: Store = None):
        self._running = False
        self._store = store or MemoryStore()
        self._executors = {
            ExecutorEnum.THREAD.value: ThreadPoolExecutor()
        }

        # tornado
        self._ioLoop = IOLoop.current()
        self._timeout = None

    @property
    def running(self):
        return self._running

    def get_jobs(self):
        return self._store.get_jobs()

    def get_job(self, id):
        return self._store.get_job(id)

    def add_job(self, job: Job):
        self._store.add_job(job)
        if self.running:
            self.wakeup()

    def start(self):
        logger.info('Start')
        self._running = True
        self.wakeup()

    def stop(self):
        self._running = False
        self._stop_timer()

    def _stop_timer(self):
        if self._timeout is not None:
            self._ioLoop.remove_timeout(self._timeout)
            self._timeout = None

    @staticmethod
    def now():
        return datetime.datetime.now()

    def _schedule_jobs(self) -> datetime.timedelta:
        time_list = []
        now = self.now()

        for job in self._store.get_jobs():
            if job.next_run_time is None:
                job.update_run_time(now)

            if job.next_run_time <= now:
                executor = self._executors[job.executor]
                executor.submit(job)

                job.update_run_time(now)

            time_list.append(job.next_run_time)

        return min([i - now for i in time_list], default=0)

    def wakeup(self):
        logger.info('Wakeup')
        self._stop_timer()
        timeout = self._schedule_jobs()
        if timeout:
            self._timeout = self._ioLoop.add_timeout(timeout, self.wakeup)


scheduler = Scheduler()
