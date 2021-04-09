from enum import Enum, unique


@unique
class ExecutorEnum(Enum):
    THREAD = 'thread'
    PROCESS = 'process'
