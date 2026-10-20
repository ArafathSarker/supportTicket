"""
Demo Django settings for the support_ticket component.

Host projects only need from this file:
- INSTALLED_APPS += ['support_ticket']
- a SUPPORT_TICKET dict (hooks + optional storage credentials)
- the storage backend wiring when S3 storage is enabled

Environment-driven:
- Dev:   SQLite + in-memory channel layer + local file storage
- Prod:  Postgres + Redis channel layer + S3-compatible storage
"""
import os
from datetime import timedelta
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

    # host apps (this project only provides auth for the demo)
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
# Database — Postgres in production, SQLite for local dev
# ---------------------------------------------------------------------------
if os.getenv('DATABASE_URL'):
    import dj_database_url

    DATABASES = {'default': dj_database_url.parse(os.getenv('DATABASE_URL'))}
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# ---------------------------------------------------------------------------
# Channels — Redis in production, in-memory for dev
# ---------------------------------------------------------------------------
if os.getenv('REDIS_URL'):
    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels_redis.core.RedisChannelLayer',
            'CONFIG': {'hosts': [os.getenv('REDIS_URL')]},
        },
    }
else:
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
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=12),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# ---------------------------------------------------------------------------
# CORS / CSRF
# ---------------------------------------------------------------------------
CORS_ALLOWED_ORIGINS = [FRONTEND_URL]
CSRF_TRUSTED_ORIGINS = [FRONTEND_URL]

# Ticket / visit attachments
FILE_UPLOAD_MAX_MEMORY_SIZE = 26214400  # 25 MB
