import datetime

from . import Trigger
from dida.utils import undefined


class IntervalTrigger(Trigger):
    def __init__(self, *, days=undefined, hours=undefined, minutes=undefined, seconds=undefined):
        self._days = days or 0
        self._hours = hours or 0
        self._minutes = minutes or 0
        self._seconds = seconds or 0

        self._interval = datetime.timedelta(days=self._days, hours=self._hours, minutes=self._minutes,
                                            seconds=self._seconds)

    def get_next_time(self, now):
        return now + self._interval
