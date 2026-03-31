from django.db import models

class Plan(models.Model):
    name = models.CharField(max_length=255)
    modules = models.ManyToManyField('Module', through='PlanModule')

class Module(models.Model):
    name = models.CharField(max_length=255)
    is_blocked = models.BooleanField(default=False)

class PlanModule(models.Model):
    plan = models.ForeignKey(Plan, on_delete=models.CASCADE)
    module = models.ForeignKey(Module, on_delete=models.CASCADE)
    sequence = models.IntegerField()