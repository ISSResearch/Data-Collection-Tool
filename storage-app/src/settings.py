from multiprocessing import cpu_count
from os import getenv
from dotenv import load_dotenv

load_dotenv()

uvicorn_conf = {
    "app": "main:APP",
    "workers": cpu_count() * 2 + 1,
    "host": '0.0.0.0',
    "port": getenv("APP_PORT", 9000),
    "reload": getenv("DEBUG") == "true",
}


# default_config(
#     app: Union[ForwardRef('ASGIApplication'), Callable, str],
#     *,
#     host: str = '127.0.0.1',
#     port: int = 8000, uds: Optional[str] = None,
#     fd: Optional[int] = None,
#     loop: Literal['none', 'auto', 'asyncio', 'uvloop'] = 'auto',
#     http: Union[Type[asyncio.protocols.Protocol], Literal['auto', 'h11', 'httptools']] = 'auto',
#     ws: Union[Type[asyncio.protocols.Protocol], Literal['auto', 'none', 'websockets', 'wsproto']] = 'auto',
#     ws_max_size: int = 16777216,
#     ws_max_queue: int = 32,
#     ws_ping_interval: Optional[float] = 20.0,
#     ws_ping_timeout: Optional[float] = 20.0,
#     ws_per_message_deflate: bool = True,
#     lifespan: Literal['auto', 'on', 'off'] = 'auto',
#     interface: Literal['auto', 'asgi3', 'asgi2', 'wsgi'] = 'auto',
#     reload: bool = False,
#     reload_dirs: Union[List[str], str, NoneType] = None,
#     reload_includes: Union[List[str], str, NoneType] = None,
#     reload_excludes: Union[List[str], str, NoneType] = None,
#     reload_delay: float = 0.25,
#     workers: Optional[int] = None,
#     env_file: Union[str, os.PathLike, NoneType] = None,
#     log_config: Union[Dict[str, Any], str, NoneType] = {
#         'version': 1,
#         'disable_existing_loggers': False,
#         'formatters': {
#             'default': {
#                 '()': 'uvicorn.logging.DefaultFormatter',
#                 'fmt': '%(levelprefix)s %(message)s', 'use_colors': None
#             },
#             'access': {
#                 '()': 'uvicorn.logging.AccessFormatter',
#                 'fmt': '%(levelprefix)s %(client_addr)s - "%(request_line)s" %(status_code)s'
#             }
#         },
#         'handlers': {
#             'default': {
#                 'formatter': 'default',
#                 'class': 'logging.StreamHandler',
#                 'stream': 'ext://sys.stderr'
#             },
#             'access': {
#                 'formatter': 'access',
#                 'class': 'logging.StreamHandler',
#                 'stream': 'ext://sys.stdout'
#             }
#         },
#         'loggers': {
#             'uvicorn': {
#                 'handlers': ['default'],
#                 'level': 'INFO',
#                 'propagate': False
#             },
#             'uvicorn.error': {'level': 'INFO'},
#             'uvicorn.access': {
#                 'handlers': ['access'],
#                 'level': 'INFO',
#                 'propagate': False
#             }
#         }
#     },
#     log_level: Union[str, int, NoneType] = None,
#     access_log: bool = True,
#     proxy_headers: bool = True,
#     server_header: bool = True,
#     date_header: bool = True,
#     forwarded_allow_ips: Union[List[str], str, NoneType] = None,
#     root_path: str = '',
#     limit_concurrency: Optional[int] = None,
#     backlog: int = 2048,
#     limit_max_requests: Optional[int] = None,
#     timeout_keep_alive: int = 5,
#     timeout_graceful_shutdown: Optional[int] = None,
#     ssl_keyfile: Optional[str] = None,
#     ssl_certfile: Union[str, os.PathLike, NoneType] = None,
#     sl_keyfile_password: Optional[str] = None,
#     ssl_version: int = <_SSLMethod.PROTOCOL_TLS_SERVER: 17>,
#     ssl_cert_reqs: int = <VerifyMode.CERT_NONE: 0>,
#     ssl_ca_certs: Optional[str] = None,
#     ssl_ciphers: str = 'TLSv1',
#     headers: Optional[List[Tuple[str, str]]] = None,
#     use_colors: Optional[bool] = None,
#     app_dir: Optional[str] = None,
#     factory: bool = False,
#     h11_max_incomplete_event_size: Optional[int] = None
# ) -> None
