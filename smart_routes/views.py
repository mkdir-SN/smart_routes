from django.shortcuts import render

def main_view(request):
	context = {} 
	return render(request, 'smart_routes/main.html', context)