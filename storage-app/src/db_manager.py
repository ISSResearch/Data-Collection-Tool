from pymongo import MongoClient
from gridfs import GridFSBucket
from settings import DB_STORAGE, CHUNK_SIZE
from utils import get_db_uri
from services import Bucket


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
    def get_bucket(cls, project_name: str) -> GridFSBucket:
        if cls.current_db is None: cls.get_db(DB_STORAGE)

        fs_bucket = GridFSBucket(
            db=cls.current_db,
            bucket_name=project_name,
            chunk_size_bytes=CHUNK_SIZE
        )

        return Bucket(fs_bucket)
