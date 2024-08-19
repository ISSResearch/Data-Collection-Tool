from sqlite3 import Connection, Cursor
from typing_extensions import Any, Callable
from numpy import ndarray
from enum import Enum
from .settings import (
    HASH_SIZE,
    EMBEDDING_STORAGE_PATH,
    SIMILAR_THRESHOLD,
    SQLITE_VECTOR_PATH
)


class Query(Enum):
    MIGRATE_EMBEDDING = """
        create virtual table
        if not exists file_embedding
        using vec0(embedding float[{}]);
    """
    MIGRATE_IDS = """
        create table if not exists rowid_file  (
            id integer primary key
            file_id text,
            foreign key (id) references file_embedding(rowid)
        );
    """
    INSERT = """
        with res as (
            insert into file_embedding (rowid, embedding)
            values ((select count(*) + 1 from storage), ?)
            returning rowid
        )
        insert into rowid_file (id, file_id)
        values ((select rowid from res), ?)
        returning id;
    """
    SELECT = """
        select fe.rowid, rf.file_id, fe.distance
        from file_embedding as fe
        left join rowid_file as rf
        on fe.rowid = rf.id
        where embedding match ?
        and distance <= ?
        and k = ?
        order by distance;
    """


class EmbeddingStorage:
    __slots__ = ("conn", "corrupted", "reason", "context")
    _k_nearest = 3

    def __init__(self):
        self.corrupted = False
        self.conn = Connection(EMBEDDING_STORAGE_PATH)
        self.context = False
        self.load_module()

    def load_module(self):
        self.conn.enable_load_extension(True)
        self.conn.load_extension(SQLITE_VECTOR_PATH)
        self.conn.enable_load_extension(False)

    def  __enter__(self) -> "EmbeddingStorage":
        self.context = True
        return self

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

            cursor = self.conn.cursor()

            try:
                assert not self.corrupted, "Transaction corrupted"
                result = callback(self, cursor, *args, **kwargs)

                if not self.context: self.conn.commit()

                return result

            except Exception as e:
                if not self.context:
                    self.conn.rollback()
                    raise e

                self.reason = str(e)
                self.corrupted = True

            finally: cursor.close()

        return inner

    @with_transaction
    def migrate(self, cur: Cursor):
        cur.execute(Query.MIGRATE_EMBEDDING.value.format(HASH_SIZE**2))
        cur.execute(Query.MIGRATE_IDS.value)

    @with_transaction
    def insert(self, cur: Cursor, file_id: str, embedding: ndarray) -> str:
        row_id, *_ = cur.execute(Query.INSERT.value, [embedding]).fetchone()
        return row_id

    @with_transaction
    def search(
        self,
        cur: Cursor,
        embedding: ndarray
    ) -> list[tuple[int, str, float]]:
        return cur.execute(
            Query.SELECT.value,
            [embedding, SIMILAR_THRESHOLD, self._k_nearest]
        ).fetchall()
