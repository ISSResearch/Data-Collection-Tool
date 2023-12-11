from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from psycopg2 import connect
from datetime import datetime
from typing import Any
from os import path
from sys import argv

CLIENT_ONLY_FLAGS: set[str] = {"-c", "--clients", "--clients-only", "clients", "c"}
GOOGLE_TOKEN_FILE: str = "./assets/token.json"
DB_HOST: str = "iss-amin-db"
DB_NAME: str = "iss_app_db"
TABLE_ID: str = "1LBSPz-ORIR6LwtGu9mevLBgGXThZY__OstgQpJwY1vo"
STATS_SHEET: str = "test"

STATS_QUERY: str = """
with tf as (
    select
        u.id as u_id,
        u.username as u_name,
        p.name as p_name,
        f.id as f_id,
        f.file_type as f_type,
        f.status as f_status,
        date(f.upload_date) as f_date
    from file as f
    join "user" as u on u.id = f.author_id
    join project as p on p.id = f.project_id
    where f.upload_date >= '{}'
),
ta as (
    select
        ag.file_id as f_id,
        a.name as a_name
    from attribute_group as ag
    join lateral (
        select tf.f_id from tf where ag.file_id = tf.f_id
    ) tf on true
    join attribute_group_attribute as aga on aga.attributegroup_id = ag.uid
    join attribute as a on a.id = aga.attribute_id
)
select
    tf.u_id as user_id,
    tf.u_name as user_name,
    tf.p_name as project_name,
    tf.f_type as file_type,
    case
        when tf.f_status = 'a' then 'accepted'
        WHEN tf.f_status = 'd' then 'declined'
        ELSE 'validation'
    END AS status,
    ta.a_name as attribute,
    cast(tf.f_date as varchar) as date,
    count(*) as count
from tf
left join ta on ta.f_id = tf.f_id
group by
    tf.u_id,
    tf.u_name,
    tf.p_name,
    tf.f_type,
    tf.f_status,
    ta.a_name,
    tf.f_date;
"""


class PgConnector:
    default_port: int = 5432
    default_host: str = 'localhost'
    default_user: str = 'root'
    default_db: str = 'postgres'

    def __init__(
        self,
        host: str | None = None,
        credentials: tuple[str, str] | None = None,
        dbname: str | None = None,
        user: str | None = None,
        port: int | None = None
    ):
        self.host = host
        self.credentials = credentials
        self.dbname = dbname
        self.user = user
        self.port = port
        self.connection = connect(
            dbname=self.dbname or self.default_db,
            user=self.user or self.default_user,
            host=self.host or self.default_host,
            port=self.port or self.default_port
        )


    def query(self, query: str):
        with self.connection.cursor() as cursor:
            cursor.execute(query)
            return cursor.fetchall()


class GoogleConnector:
    SCOPES: list[str] = ['https://www.googleapis.com/auth/spreadsheets']

    def __init__(self, token_path: str) -> None:
        self.token_path: str = token_path
        self.creds = None
        self.auth()

    @classmethod
    def get_token(cls, credentials_path: str) -> None:
        creds = InstalledAppFlow \
            .from_client_secrets_file(credentials_path, cls.SCOPES) \
            .run_local_server(port=0, open_browser=False)

        with open('token.json', 'w') as token: token.write(creds.to_json())

    def auth(self):
        creds = None

        if path.exists(self.token_path):
            creds = Credentials.from_authorized_user_file(self.token_path, self.SCOPES)

        if creds and creds.refresh_token: creds.refresh(Request())
        elif creds.expired: raise FileExistsError

        self.creds = creds

    @staticmethod
    def get_range(sheet: str, columns: int, rows: int) -> str:
        end: str = chr(ord("A") + columns)
        return f"{sheet}!A1:{end}{rows}"

    def get_sheet_dimension(self, sheet_id: str, table_name: str) -> tuple[int, int]:
        if not self.creds: self.auth()

        service = build('sheets', 'v4', credentials=self.creds)
        sheet = service.spreadsheets()

        columns: int = (
            sheet
                .values()
                .get(spreadsheetId=sheet_id, range=table_name + "!1:1")
                .execute()
                .get("values", [[]])[0]
                .__len__()
            or 25
        )

        rows: int = sheet \
            .values() \
            .get(spreadsheetId=sheet_id, range=f"{table_name}!A:{chr(ord('A') + columns)}") \
            .execute() \
            .get("values", []) \
            .__len__()

        return columns, rows

    def clear_sheet_values(self, sheet_id: str, table_name: str):
        if not self.creds: self.auth()

        service = build('sheets', 'v4', credentials=self.creds)
        sheet = service.spreadsheets()

        columns, rows = self.get_sheet_dimension(sheet_id, table_name)

        range: str = self.get_range(table_name, columns, rows)

        sheet.values() \
            .clear(spreadsheetId=sheet_id, range=range) \
            .execute()

    def set_sheet_values(self, sheet_id: str, range: str, values: list):
        if not self.creds: self.auth()

        service = build('sheets', 'v4', credentials=self.creds)
        sheet = service.spreadsheets()

        sheet.values() \
            .update(
                spreadsheetId=sheet_id,
                range=range,
                body={
                    "range": range,
                    "values": values
                },
                valueInputOption="RAW"
            ) \
            .execute()


def run(only_clients: bool = False) -> None:
    global google, cvat

    print("SCRIPT STARTS")

    print("connecting to services...")
    google = GoogleConnector(GOOGLE_TOKEN_FILE)
    pg = PgConnector(user="postgres", dbname=DB_NAME, host=DB_HOST)

    if only_clients: return

    print("getting data...")
    query_date: str = datetime.now().strftime('%Y-%m-%d')
    result: list[tuple[Any, ...]] = pg.query(STATS_QUERY.format(query_date))

    if not result:
        print("No result with given query")
        return

    print("writing project table...")
    project_range: str = google.get_range(STATS_SHEET, len(result[0]), len(result))
    google.clear_sheet_values(TABLE_ID, STATS_SHEET)
    google.set_sheet_values(TABLE_ID, project_range, result)

    print("SCRIPT ENDS")


if __name__ == "__main__":
    _, *args = argv

    clients_only: bool = bool(set(args).intersection(CLIENT_ONLY_FLAGS))

    run(clients_only)
