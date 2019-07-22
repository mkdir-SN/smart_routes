from __future__ import unicode_literals

import redis

from django.core.exceptions import ValidationError
from django.db import models
from django import forms
from django.urls import reverse
from django.utils.encoding import python_2_unicode_compatible
from timezone_field import TimeZoneField

import arrow

class Reminder(models.Model):
	name = models.CharField(max_length=150, blank=False, null=False)
	phone_number = models.CharField(max_length=15, blank=False, null=False)
	time = models.CharField(max_length=100, blank=False, null=False)

	# Not visible to users
	task_id = models.CharField(max_length=50, blank=True, editable=False)
	time_zone = TimeZoneField(default='UTC')
	trip = models.CharField(max_length=150)
	link = models.CharField(max_length=200)
	created = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return 'Reminder #{0} - {1}'.format(self.pk, self.name)

	def schedule_reminder(self):
		print(self.time)
		print(self.time_zone.zone)
		reminder_time = arrow.get(self.time)
		now = arrow.now(self.time_zone.zone)
		milli_to_wait = int(
            (reminder_time - now).total_seconds()) * 1000

		from .sms import send_sms_reminder
		result = send_sms_reminder.send_with_options(
			args=(self.pk,),
			delay=milli_to_wait)
		return result.options['redis_message_id']

	def save(self):
		if self.task_id:
			self.cancel_task()
		super(Reminder, self).save()
		self.task_id = self.schedule_reminder()
		super(Reminder, self).save()

