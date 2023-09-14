from pymongo import MongoClient
from gridfs import GridFSBucket
from shared.settings import DB_STORAGE, CHUNK_SIZE
from shared.utils import get_db_uri


class DataBase:
    client: MongoClient = None
    current_db = None

    def __init__(self, uri: str) -> None:
        if not self.client: self.get_client(uri)

    @classmethod
    def get_client(cls, uri: str) -> MongoClient:
        if not cls.client: cls.client = MongoClient(uri)

        return cls.client

    @classmethod
    def get_db(cls, db_name: str = "") -> None:
        if not cls.client: cls.get_client(get_db_uri())

        cls.current_db = cls.client[db_name or DB_STORAGE]

        return cls.current_db

    @classmethod
    def get_fs_bucket(cls, bucket_name: str) -> GridFSBucket:
        if cls.current_db is None: cls.get_db(DB_STORAGE)

        return GridFSBucket(
            db=cls.current_db,
            bucket_name=bucket_name,
            chunk_size_bytes=CHUNK_SIZE
        )
