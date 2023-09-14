from os import getenv

BROKER_URL = getenv("CELERY_BROKER_URL")
RESULT_URL = getenv("CELERY_RESULT_BACKEND")

CELERY_CONFIG = ['worker', '--loglevel=INFO']
