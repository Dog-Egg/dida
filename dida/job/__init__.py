import uuid

from dida.triggers2 import Trigger
from dida.utils import enums


class Job:
    def __init__(self, *, func, trigger: Trigger, executor: enums.ExecutorEnum, id=None, args, kwargs):
        self._id = id or uuid.uuid4()
        self._trigger = trigger
        self._next_run_time = None
        self._executor = executor
        self._func = func
        self._args = args
        self._kwargs = kwargs

    @property
    def id(self):
        return self._id

    @property
    def executor(self):
        return self._executor

    def update_run_time(self, now):
        self._next_run_time = self._trigger.get_next_time(now)

    @property
    def next_run_time(self):
        return self._next_run_time

    def __call__(self, *args, **kwargs):
        return self._func(*args, **kwargs)
