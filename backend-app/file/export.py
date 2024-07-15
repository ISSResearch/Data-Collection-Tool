from abc import ABC, abstractmethod, abstractproperty
from typing import Any, List, Dict
from io import BytesIO
from json import dumps

ROW = Dict[str, Any]
DATA = List[ROW]
ENCODING = "utf-8"
IMPLEMENTED = {"json", "csv"}


class Export(ABC):
    @abstractmethod
    def __init__(self, data: DATA, *args): ...

    @abstractmethod
    def into_response(self) -> BytesIO: ...

    @property
    def _data(self) -> DATA: return self.__data

    @_data.setter
    def _data(self, data: DATA): self.__data = data


class JSON(Export):
    def __init__(self, data: DATA, *args): self._data = data

    def into_response(self) -> BytesIO:
        file = BytesIO()

        prepared_data = bytes(dumps(self._data), encoding=ENCODING)

        file.write(prepared_data)
        file.seek(0)

        return file


class CSV(Export):
    ATTRIBUTE_HEADERS = "Attribute,Level,On Validation,Accepted,Declined,Total\n"
    USER_HEADERS = "User,On Validation,Accepted,Declined,Total\n"

    t_val = lambda _, x: (x.get('image', 0), x.get('video', 0))
    t_str = lambda _, x: f"images: {x[0]} videos: {x[1]}"
    sm = lambda _, x, y, z: sum(x + y + z)

    def __init__(self, data: DATA, *args):
        self._data = data
        self._type = args[0]

    def _write_attribute(self, dest: BytesIO, data: ROW):
        name = data.get("name")
        level_name = data.get("levelName")

        val = self.t_val(data.get("v", {}))
        acc = self.t_val(data.get("a", {}))
        dec = self.t_val(data.get("d", {}))
        total = self.sm(val, acc, dec)

        dest.write(bytes(
            f"{name},{level_name},{self.t_str(val)},{self.t_str(acc)},{self.t_str(dec)},{total}\n",
            encoding=ENCODING
        ))

        for child in (children := data.get("children", [])): self._write_attribute(dest, child)

    def _write_user(self, dest: BytesIO, data: ROW):
        name = data.get("name")

        val = self.t_val(data.get("v", {}))
        acc = self.t_val(data.get("a", {}))
        dec = self.t_val(data.get("d", {}))
        total = self.sm(val, acc, dec)

        dest.write(bytes(
            f"{name},{self.t_str(val)},{self.t_str(acc)},{self.t_str(dec)},{total}\n",
            encoding=ENCODING
        ))

    def into_response(self) -> BytesIO:
        file = BytesIO()

        match self._type:
            case "attribute":
                headers = self.ATTRIBUTE_HEADERS
                write = self._write_attribute
            case "user":
                headers = self.USER_HEADERS
                write = self._write_user
            case _: raise AttributeError

        file.write(bytes(headers, encoding=ENCODING))
        for row in self._data: write(file, row)

        file.seek(0)

        return file
