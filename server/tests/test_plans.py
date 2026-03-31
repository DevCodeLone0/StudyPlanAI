from django.test import TestCase
from server.models import Plan

class TestPlan(TestCase):
    def test_create_plan(self):
        plan = Plan(name="Test Plan")
        plan.save()
        self.assertIsNotNone(plan.id)
        self.assertEqual(plan.name, "Test Plan")