import unittest
import datetime

from dida import schemas, triggers
from marshmallow import ValidationError


class TestTriggerSchema(unittest.TestCase):
    def test_dump_trigger(self):
        result = schemas.TriggerSchema().dump(triggers.IntervalTrigger())
        print('IntervalTrigger dump:', result)

        result = schemas.TriggerSchema().dump(triggers.DateTrigger())
        print('DateTrigger dump:', result)

    def test_load_trigger(self):
        self.assertRaises(ValidationError, schemas.TriggerSchema().load, {"type": "unknown"})

        obj = schemas.TriggerSchema().load({'type': "interval"})
        self.assertIsInstance(obj, triggers.IntervalTrigger)

        obj = schemas.TriggerSchema().load({'type': 'date', "params": {'run_date': "2020-01-01 00:00:00"}})
        self.assertEqual(obj.run_date, datetime.datetime(2020, 1, 1).astimezone())
