from django.shortcuts import render, redirect

def save_reminder(request):
	reminder_date = request.GET.get('reminder_date')
	reminder_time = request.GET.get('reminder_time')
	reminder_url = request.GET.get('reminder_url')
	print(reminder_date, reminder_time, reminder_url)
	return redirect('/main') 

def main_view(request):
	context = {} 
	return render(request, 'smart_routes/main.html', context)