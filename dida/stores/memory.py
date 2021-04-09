from . import Store
from ..job import Job


class MemoryStore(Store):
    def __init__(self):
        self._jobs = dict()

    def add_job(self, job: Job):
        self._jobs.update({job.id: job})

    def get_jobs(self):
        return self._jobs.values()

    def get_job(self, id):
        self._jobs.get(id)
