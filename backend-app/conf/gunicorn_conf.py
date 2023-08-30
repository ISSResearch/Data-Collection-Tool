from multiprocessing import cpu_count
from os import mkdir
from os.path import exists

workers = cpu_count() * 2 + 1
timeout = 60
limit_request_fields = 32000
limit_request_field_size = 0
user = 'root'
raw_env = 'DJANGO_SETTINGS_MODULE=proj_back.settings'
bind = "0.0.0.0:8000"
worker_tmp_dir = './worker_tmp'

if not exists(worker_tmp_dir): mkdir(worker_tmp_dir)
