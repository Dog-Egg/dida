from types import FunctionType


class _Manager:
    def __init__(self):
        self._collection = {}

    def add(self, func: 'JobFunction'):
        self._collection[func.ref] = func

    def get(self, ref):
        return self._collection[ref]


class JobFunction:
    manager = _Manager()

    def __init__(self, func: FunctionType):
        self._func = func
        self._ref = func.__module__ + ':' + func.__qualname__

        self.manager.add(self)

    @property
    def ref(self):
        return self._ref

    def __call__(self, *args, **kwargs):
        return self._func(*args, **kwargs)
