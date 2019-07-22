from __future__ import absolute_import

import arrow
import dramatiq

from django.conf import settings
from twilio.rest import Client

from .models import Reminder

client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

@dramatiq.actor
def send_sms_reminder(reminder_id):
	try:
		reminder = Reminder.objects.get(pk=reminder_id)
	except Reminder.DoesNotExist:
		return

	reminder_time = arrow.get(reminder.time)
	body = 'Hi {0}. Remember to take go on your trip {1}. Click here for the optimized route on Google Maps: {2}.'.format(
		reminder.name,
		reminder.trip,
		reminder.link
		)

	client.messages.create(
		body=body,
		to=reminder.phone_number,
		from_=settings.TWILIO_NUMBER
		)