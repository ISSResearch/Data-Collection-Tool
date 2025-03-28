from pathlib import Path
from os import getenv
from datetime import timedelta

DB_HOST = getenv('DB_HOST')
DB_NAME = getenv('DB_NAME')

FRONTEND_PORT = getenv("FRONTEND_PORT")
APP_STORAGE_URL = "http://" + getenv("APP_STORAGE_URL", "127.0.0.1")

TEST_ENV = getenv("CASE") == 'test'

DEBUG = getenv("DEBUG") == 'true'

RAW_ORIGIN = getenv('SERVER_ORIGINS')
SELF_ORIGIN = None

if RAW_ORIGIN:
    RAW_ORIGIN = RAW_ORIGIN.replace(' ', '').split(',')
    SELF_ORIGIN = [f"http://{origin}:{FRONTEND_PORT}" for origin in RAW_ORIGIN]

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = getenv("SECRET_KEY", "")

ALLOWED_HOSTS = RAW_ORIGIN or ()

USE_X_FORWARDED_HOST = True

CORS_ALLOW_CREDENTIALS = TEST_ENV

CORS_ALLOW_ALL_ORIGINS = False

CSRF_TRUSTED_ORIGINS = SELF_ORIGIN

if TEST_ENV: CORS_ALLOWED_ORIGINS = SELF_ORIGIN

CORS_ALLOW_METHODS = (
    "OPTIONS",
    "GET",
    "POST",
    "PATCH",
    "DELETE",
)

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'user',
    'api',
    'project',
    'attribute',
    'file',
    "archive"
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'proj_back.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'proj_back.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': DB_NAME,
        'USER': 'postgres',
        'PASSWORD': '',
        'HOST': DB_HOST,
        'PORT': '5432',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

STATIC_URL = 'static/'

MEDIA_ROOT = 'file_store/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AUTH_USER_MODEL = 'user.CustomUser'

DATA_UPLOAD_MAX_NUMBER_FIELDS = 1000

REST_FRAMEWORK = {
    'DATETIME_FORMAT': '%Y-%m-%d %H:%M',
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'user.authentication.CustomAuthentication'
        # 'rest_framework_simplejwt.authentication.JWTStatelessUserAuthentication'
    ]
}

SIMPLE_JWT = {
    "ALGORITHM": getenv("SECRET_ALGO", "HS256"),
    "SIGNING_KEY": SECRET_KEY,
    "ACCESS_TOKEN_LIFETIME": timedelta(days=7),
}

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.dummy.DummyCache",
    }
}

if DEBUG: LOGGING = {
    'version': 1,
    'filters': {
        'require_debug_true': {
            '()': 'django.utils.log.RequireDebugTrue',
        }
    },
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'filters': ['require_debug_true'],
            'class': 'logging.StreamHandler',
        }
    },
    'loggers': {
        'django.db.backends': {
            'level': 'DEBUG',
            'handlers': ['console'],
        }
    }
}
