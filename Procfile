release: python manage.py migrate
web: gunicorn django_budget.wsgi -b 0.0.0.0:8000 --access-logfile -