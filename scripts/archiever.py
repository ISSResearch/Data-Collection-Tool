import asyncio
from math import ceil
from typing import Iterator, Coroutine
from aiohttp import ClientSession
from aiofiles import open as aopen
from asyncio import run, gather, sleep
from typing import Any


class DCTClient:
    __slots__: tuple[str, ...] = (
        "BASE",
        "MAIN_PORT",
        "STORAGE_PORT",
        "_token",
        "__session"
    )

    def __init__(
        self,
        domain: str,
        main_port: int,
        storage_port: int
    ) -> None:
        self.__session: ClientSession = ClientSession()
        self.BASE: str = domain
        self.MAIN_PORT: int = main_port
        self.STORAGE_PORT: int = storage_port

    async def close(self) -> None: await self.__session.close()

    async def run_archiver_for_project(
        self,
        project_id: int,
        status: str = "a",
        not_downloaded: bool = True,
        batch_size: int = 500
    ):
        res_files: list[dict] = await self.get_project_files(
            project_id,
            status=status,
            not_downloaded=not_downloaded
        )
        file_ids: list[int] = list(map(lambda file: file["id"], res_files))

        chunks = ceil(len(file_ids) / batch_size)
        tasks_for_task_id: list[Coroutine] = [
            self.request_archive(
                file_ids[c * batch_size:batch_size * (c + 1)],
                project_id
            )
            for c in range(chunks)
        ]

        print(f"found {len(file_ids)} files. batch is {batch_size} so there are {len(tasks_for_task_id)} requests")

        created_tasks: list[dict] = await gather(*tasks_for_task_id)

        await gather(*[
            self.wait_to_download(task["task_id"], project_id)
            for task in created_tasks
        ])

    async def wait_to_download(self, task_id: str, project_id: int):
        archive_id: str | None = None
        while True:
            print("task({task_id}): check")
            _res: dict[str, Any] = await self.check_archive_status(task_id)
            status: str = _res.get("status", "")

            if status == "SUCCESS":
                archive_id = _res.get("archive_id")
                break
            if status == "FAILURE":
                print(f"task({task_id}): failed")
                return

        if archive_id:
            base_url: str = f"api/storage/temp_storage/{archive_id}/"
            access: str = f"?access={self._token}&archive=1"
            url: str = self._url(base_url + access, "storage")
            await self._download_file(url, archive_id)
            print(f"task({task_id}): downloaded")

    async def request_archive(self, file_ids: list[int], project_id: int):
        url: str = self._url("api/task/archive/", "storage")
        data: dict[str, Any] = {
            "bucket_name": f"project_{project_id}",
            "file_ids": file_ids
        }
        headers: dict[str, Any] = {"Content-Type": "application/json"}
        return await self._post(url, headers=headers, secure=True, data=data)

    async def check_archive_status(self, task_id: str):
        url: str = self._url(f"api/task/{task_id}/", "storage")
        return await self._get(url, secure=True)

    async def get_project_files(
        self,
        project_id: int,
        status: str = "",
        not_downloaded: bool = True,
    ) -> Any:
        url: str = self._url(f"api/files/project/{project_id}/", "main")
        filter: list[str] = []

        if not_downloaded: filter.append(f"downloaded={False}")
        if status: filter.append(f"status={status}")

        if filter: url += f"?{'&'.join(filter)}"

        return await self._get(url, secure=True)

    async def get_projects(self) -> Any:
        url = self._url("api/projects/", "main")
        return await self._get(url, secure=True)

    async def login(self, username: str = "", password: str = "") -> None:
        while not username: username = self._ask("username")
        while not password: password = self._ask("password")

        response = await self._login({"username": username, "password": password})

        if not response.get("isAuth"): raise RuntimeError

        self._token: str = response["accessToken"]

    async def _download_file(
        self,
        url: str,
        archive_id: str,
        headers: dict = {}
    ) -> None:
        async with self.__session.get(url, headers=headers) as response_file:
            async with aopen(f"{archive_id}.zip", 'wb') as file:
                while True:
                    chunk = await response_file.content.read(1024)
                    if not chunk: break
                    await file.write(chunk)

    async def _get(self, url: str, headers: dict = {}, secure: bool = False) -> Any:
        _headers: dict[str, Any] = {}
        if secure:
            self._token
            _headers["Authorization"] = "Bearer " + self._token

        async with self.__session.get(url, headers=_headers) as response:
            return await response.json()

    async def _post(
        self,
        url: str,
        secure: bool = False,
        headers: dict = {},
        data: dict = {}
    ) -> dict[str, Any]:
        _headers: dict[str, Any] = {}
        if secure:
            self._token
            _headers["Authorization"] = "Bearer " + self._token

        _headers.update(headers)

        async with self.__session.post(
            url,
            headers=_headers,
            json=data
        ) as response: return await response.json()

    async def _login(self, credentials: dict[str, str]) -> dict[str, Any]:
        url = self._url("api/users/login/", "main")
        return await self._post(url, data=credentials)

    def _url(self, path: str, backend: str) -> str:
        port_map: dict[str, int] = {
            "main": self.MAIN_PORT,
            "storage": self.STORAGE_PORT
        }
        new_url: str = f"http://{self.BASE}:{port_map[backend]}/{path}"

        if new_url[-1] != '/': new_url += "/"

        return new_url

    def _ask(self, message: str) -> str:
        count: int = 0
        user_input: str = ""
        while not user_input :
            count += 1
            if count > 5: raise RuntimeError
            user_input = input(f"No {message}, provide: ")

        return user_input

    async def __aenter__(self): return self
    async def __aexit__(self, *args) -> None: await self.__session.close()


async def main():
    async with DCTClient("localhost", 8000, 9000) as client:
        await client.login("admin", "admin")
        await client.run_archiver_for_project(26, status="v", not_downloaded=False, batch_size=1)


if __name__ == "__main__": run(main())
