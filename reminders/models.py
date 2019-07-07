from django.db import models
from django.forms import ModelForm 
from django.contrib.auth.models import User

class Reminder(models.Model):
	user = models.ForeignKey(User, null=False, on_delete=models.CASCADE)
	name = models.CharField(null=True, blank=True, max_length=50)
	phone_number = models.CharField(null=False, blank=False, max_length=15)
	time = models.DateTimeField()

	# Fields not visible to users
	created = models.DateTimeField(auto_now_add=True)
	trip = models.CharField(null=False, max_length=50)

	def __str__(self):
		return 'Appointment ' + self.pk + ': ' + self.name


