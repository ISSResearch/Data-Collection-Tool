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
    GET_EMBEDDING_SQL = "select sql from sqlite_master where type='table' and name='file_embedding'"
    MIGRATE_EMBEDDING = """
        create virtual table
        if not exists file_embedding
        using vec0(embedding float[{}]);
    """
    MIGRATE_META = """
        create table if not exists file_meta  (
            id integer primary key,
            file_id text,
            file_size integer,
            shadowed integer default 0 check (shadowed in (0, 1)),
            foreign key (id) references file_embedding(rowid)
        );
    """
    INSERT_EMBEDDING = """
        insert into file_embedding (rowid, embedding)
        values ((select count(*) + 1 from file_embedding), ?)
        returning rowid;
    """
    INSERT_META = """
        insert into file_meta (id, file_id, file_size)
        values (?, ?, ?)
        returning id;
    """
    SHADOW = """
        update file_meta
        set shadowed = 1
        where file_id = ?;
    """
    SELECT = """
        select M.file_id, M.file_size, E.distance
        from file_embedding as E
        left join file_meta as M
        on E.rowid = M.id
        where
        M.shadowed = 0
        and E.embedding match ?
        and E.distance <= ?
        and E.k = ?
        order by E.distance;
    """


class EmbeddingStorage:
    __slots__ = ("conn", "corrupted", "reason", "context")
    K = 5

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

                self.reason = callback.__name__ + str(e)
                self.corrupted = True

            finally: cursor.close()

        return inner

    @with_transaction
    def migrate(self, cur: Cursor):
        cur.execute(Query.MIGRATE_EMBEDDING.value.format(HASH_SIZE**2))
        cur.execute(Query.MIGRATE_META.value)

    def check_embedding(self):
        sql, *_ = self.conn.execute(Query.GET_EMBEDDING_SQL.value).fetchone()
        find_by = "float["

        start = sql.index(find_by)
        end = sql.index("]", start)

        embedding_size = int(sql[start + len(find_by):end])
        assert (HASH_SIZE ** 2) == embedding_size, "Embeddings size dont match with settings"

    @with_transaction
    def insert_embedding(self, cur: Cursor, embedding: ndarray) -> int:
        return cur.execute(Query.INSERT_EMBEDDING.value, [embedding]).fetchone()[0]

    @with_transaction
    def insert_meta(
        self,
        cur: Cursor,
        emb_id: int,
        file_id: str,
        file_size: int
    ) -> int:
        return cur.execute(Query.INSERT_META.value, [emb_id, file_id, file_size]).fetchone()[0]

    @with_transaction
    def shadow(self, cur, file_id: str): cur.execute(Query.SHADOW.value, [file_id])

    @with_transaction
    def search(self, cur: Cursor, embedding: ndarray) -> list[tuple[str, int, float]]:
        return cur.execute(
            Query.SELECT.value,
            [embedding, SIMILAR_THRESHOLD, self.K]
        ).fetchall()
