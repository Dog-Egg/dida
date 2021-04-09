import abc
from typing import Iterable

from dida.job import Job


class Store(abc.ABC):
    @abc.abstractmethod
    def add_job(self, job):
        pass

    @abc.abstractmethod
    def get_jobs(self) -> Iterable[Job]:
        pass

    @abc.abstractmethod
    def get_job(self, id) -> Job:
        pass
