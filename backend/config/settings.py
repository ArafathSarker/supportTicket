"""
Demo Django settings for the support_ticket component.

Host projects only need from this file:
- INSTALLED_APPS += ['support_ticket']
- a SUPPORT_TICKET dict (hooks + optional storage credentials)
- the storage backend wiring when S3 storage is enabled

Environment-driven:
- PostgreSQL (development and production) and S3-compatible media storage
  when the storage credentials are set.
"""
import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / '.env')

SECRET_KEY = os.getenv(
    'DJANGO_SECRET_KEY',
    'django-insecure-gdv05-e3mg*ghs_ai1&97zoi*o5#s3p!+0yag7*i8^ja2wk%nk',
)
DEBUG = os.getenv('DJANGO_DEBUG', '1') == '1'
ALLOWED_HOSTS = os.getenv('DJANGO_ALLOWED_HOSTS', '*').split(',')

# Frontend origin for CORS / CSRF
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # third-party
    'rest_framework',
    'corsheaders',
    'channels',
    'storages',

    # demo data provider; host projects can omit this app
    'accounts',

    # ★ the reusable component — one app, copy & go
    'support_ticket',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

# ---------------------------------------------------------------------------
# Database — PostgreSQL everywhere (dev + production).
# Override with DATABASE_URL for the host project's PostgreSQL instance.
# ---------------------------------------------------------------------------
import dj_database_url
from django.core.exceptions import ImproperlyConfigured

DATABASES = {
    'default': dj_database_url.parse(
        os.getenv('DATABASE_URL', 'postgres://support:support@localhost:5432/support')
    ),
}
if not str(DATABASES['default'].get('ENGINE', '')).endswith('postgresql'):
    raise ImproperlyConfigured(
        'This project requires PostgreSQL. Set DATABASE_URL to a '
        'postgres://... URL (see backend/.env.example).'
    )

# ---------------------------------------------------------------------------
# Channels — in-memory layer keeps the component dependency-free.
# ---------------------------------------------------------------------------
CHANNEL_LAYERS = {
    'default': {'BACKEND': 'channels.layers.InMemoryChannelLayer'},
}

# ---------------------------------------------------------------------------
# ██████  support_ticket component configuration
# ---------------------------------------------------------------------------
# COMPANY_MODEL    — related company/org model in the host project
# ROLE_RESOLVER    — (user) -> 'super_admin' | 'company_admin' | ''
# COMPANY_RESOLVER — (user) -> company instance the user belongs to (or None)
# COMPANY_SERIALIZER — optional override serializer for GET /api/companies/
# PAGE_SIZE        — page size for the component's list endpoints
# S3_*             — credentials for the S3-compatible attachment storage
SUPPORT_TICKET = {
    'COMPANY_MODEL': 'accounts.Company',
    'ROLE_RESOLVER': 'accounts.support.resolve_role',
    'COMPANY_RESOLVER': 'accounts.support.resolve_company',
    'PAGE_SIZE': 10,
    'S3_ENDPOINT_URL': os.getenv('SUPABASE_S3_ENDPOINT_URL', ''),
    'S3_ACCESS_KEY_ID': os.getenv('SUPABASE_S3_ACCESS_KEY_ID', ''),
    'S3_SECRET_ACCESS_KEY': os.getenv('SUPABASE_S3_SECRET_ACCESS_KEY', ''),
    'S3_REGION': os.getenv('SUPABASE_S3_REGION', 'auto'),
    'S3_BUCKET': os.getenv('SUPABASE_STORAGE_BUCKET', 'tickets'),
}
# Used by the reusable app migration to create the company relation without
# depending on this demo project's `accounts` app.
SUPPORT_TICKET_COMPANY_MODEL = SUPPORT_TICKET['COMPANY_MODEL']

# ---------------------------------------------------------------------------
# Storage — S3-compatible in production, local media in dev
# ---------------------------------------------------------------------------
if os.getenv('SUPABASE_S3_ENDPOINT_URL'):
    STORAGES = {
        'default': {
            'BACKEND': 'support_ticket.storage.SupportS3Storage',
        },
        'staticfiles': {
            'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage',
        },
    }
    STATIC_URL = 'static/'
    STATIC_ROOT = BASE_DIR / 'staticfiles'
    MEDIA_URL = '/'  # unused; URLs come from the storage backend
else:
    STORAGES = {
        'default': {
            'BACKEND': 'django.core.files.storage.FileSystemStorage',
        },
        'staticfiles': {
            'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage',
        },
    }
    MEDIA_URL = 'media/'
    MEDIA_ROOT = BASE_DIR / 'media'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'

# ---------------------------------------------------------------------------
# DRF — the component ships its own pagination classes so list page sizes
# don't depend on this global (kept here for the demo's own endpoints).
# ---------------------------------------------------------------------------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'accounts.authentication.DemoUserAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

# ---------------------------------------------------------------------------
# CORS / CSRF
# ---------------------------------------------------------------------------
CORS_ALLOWED_ORIGINS = [FRONTEND_URL]
CSRF_TRUSTED_ORIGINS = [FRONTEND_URL]

# Ticket / visit attachments
FILE_UPLOAD_MAX_MEMORY_SIZE = 26214400  # 25 MB
