from django.shortcuts import render, redirect
from reminders.models import Reminder

def save_reminder(request):
	name = request.GET.get('reminder_name')
	phone_number = request.GET.get('reminder_phone_number')
	date = request.GET.get('reminder_date')
	time = request.GET.get('reminder_time')
	url = request.GET.get('reminder_url')
	date_combined = date + ' ' + time
	print(name, phone_number, date_combined, url)
	reminder = Reminder(name=name, phone_number=phone_number, time=date_combined, link=url)
	reminder.save()
	print(reminder.phone_number)
	return redirect('/main')

def main_view(request):
	context = {} 
	return render(request, 'smart_routes/main.html', context)