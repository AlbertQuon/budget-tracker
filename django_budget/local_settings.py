#local_settings.py:
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2', 
        'NAME': 'budget_db',                      
        'USER': 'db_user',                     
        'PASSWORD': '^2root3$',                  
        'HOST': 'localhost',                      
        'PORT': '5432', 
    }
}