from sqlite3 import Connection, Cursor
from sqlite_vec import load as load_vec_module
from typing_extensions import Any, Callable
from numpy import ndarray
from enum import Enum
from .settings import HASH_SIZE, EMBEDDING_STORAGE_PATH


class Query(Enum):
    MIGRATE = "create table if not exists storage using vec0(embedding float[{}]);"
    INSERT = "insert into storage (rowid, embedding) values (?, ?);"
    SELECT = """
        select rowid, distance
        from storage
        where embedding match ?
        order by distance
        limit ?;
    """


class EmdeddingStorage:
    __slots__ = ("conn", "corrupted", "reason")
    _k_nearest = 3

    def __init__(self):
        self.corrupted = False
        self.conn = Connection(EMBEDDING_STORAGE_PATH)
        self.load_module()

    def load_module(self):
        self.conn.enable_load_extension(True)
        load_vec_module(self.conn)
        self.conn.enable_load_extension(False)

    def  __enter__(self) -> "EmdeddingStorage": return self

    def __exit__(self, *args, **kwargs):
        try:
            assert not self.corrupted, "Transaction corrupted: "
            self.conn.commit()

        except Exception as e:
            self.conn.rollback()
            raise ValueError(str(e) + self.reason)

        finally: self.conn.close()

    @staticmethod
    def with_transaction(callback: Callable) -> Callable:
        def inner(self, *args, **kwargs) -> Any:
            if self.corrupted: return self.reason

            cursor = self.connection.cursor()

            try:
                assert not self.corrupted, "Transaction corrupted"
                return callback(self, cursor, *args, **kwargs)

            except Exception as e:
                self.reason = str(e)
                self.corrupted = True

            finally: cursor.close()

        return inner

    @with_transaction
    def migrate(self, cur: Cursor): cur.execute(Query.MIGRATE.value.format(HASH_SIZE**2))

    @with_transaction
    def insert(self, cur: Cursor, file_id: str, embedding: ndarray):
        cur.execute(Query.SELECT.value, [file_id, embedding])

    @with_transaction
    def select(self, cur: Cursor, embedding: ndarray):
        result = cur.execute(Query.SELECT.value, [embedding, self._k_nearest]).fetchall()
        return result
