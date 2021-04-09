import abc


class Trigger(abc.ABC):
    @abc.abstractmethod
    def get_next_time(self, now):
        pass



