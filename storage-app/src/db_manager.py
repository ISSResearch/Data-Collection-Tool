from pymongo import MongoClient
from gridfs import GridFSBucket
from settings import DB_STORAGE
from models import FileManager


class Bucket(FileManager):
    CHUNK_SIZE = 1024 * int(1024 / 2)

    def __init__(self, db, project_name):
        self._fs = GridFSBucket(
            database=db,
            bucket_name=project_name,
            chunk_size_bytes=self.CHUNK_SIZE
        )


class DataBase:
    def __init__(self, uri):
        self.client = MongoClient(uri)
        self.db = self.client[DB_STORAGE]

    def get_bucket(self, project_name):
        return Bucket(self.db, project_name)
