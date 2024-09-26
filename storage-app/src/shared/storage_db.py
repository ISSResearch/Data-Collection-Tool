from motor.motor_asyncio import (
    AsyncIOMotorClient,
    AsyncIOMotorDatabase,
    AsyncIOMotorGridFSBucket
)
from shared.settings import DB_STORAGE
from shared.utils import get_db_uri
from typing import Optional


class DataBase:
    __client: Optional[AsyncIOMotorClient] = None
    __current_db: Optional[AsyncIOMotorDatabase] = None

    def __init__(self, uri: str) -> None: DataBase.set_client(uri)

    @classmethod
    def set_client(cls, uri: str) -> None:
        if not cls.__client:
            cls.__client = AsyncIOMotorClient(uri)

    @classmethod
    def set_db(cls, db_name: str = "") -> None:
        if not cls.__client: cls.set_client(get_db_uri())

        assert cls.__client is not None

        cls.__current_db = cls.__client[db_name or DB_STORAGE]

    @classmethod
    def get_fs_bucket(cls, bucket_name: str) -> AsyncIOMotorGridFSBucket:
        if cls.__current_db is None: cls.set_db(DB_STORAGE)

        assert cls.__current_db is not None

        return AsyncIOMotorGridFSBucket(
            cls.__current_db,
            bucket_name=bucket_name
        )

    @classmethod
    def close_connection(cls) -> None:
        if not cls.__client: return

        cls.__client.close()
        cls.__client = None
        cls.__current_db = None
