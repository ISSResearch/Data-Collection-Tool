from multiprocessing import cpu_count
workers = cpu_count() * 2 + 1
timeout = 60
limit_request_fields = 32000
limit_request_field_size = 0
user = 'root'
raw_env = 'DJANGO_SETTINGS_MODULE=proj_back.settings'

