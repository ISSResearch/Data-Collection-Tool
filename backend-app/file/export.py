from abc import ABC, abstractmethod
from typing import Any, List, Dict
from io import BytesIO
from json import dumps
from xlsxwriter import Workbook
from xlsxwriter.worksheet import Worksheet

ROW = Dict[str, Any]
DATA = List[ROW]
ENCODING = "utf-8"
IMPLEMENTED = {"json", "csv", "xlsx"}


class Export(ABC):
    ATTRIBUTE_HEADERS = "Attribute,Level,Validation Images,Validation Videos,Accepted Images, Accepted Videos,Declined Images, Declined Videos,Total\n"
    USER_HEADERS = "User,Validation Images,Validation Videos,Accepted Images, Accepted Videos,Declined Images, Declined Videos,Total\n"

    t_val = lambda _, x: (x.get('image', 0), x.get('video', 0))
    sm = lambda _, x, y, z: sum(x + y + z)

    def __init__(self, data: DATA, *args):
        self._data = data
        self._type = args[0]

    @abstractmethod
    def into_response(self) -> BytesIO: ...

    @property
    def _data(self) -> DATA: return self.__data

    @_data.setter
    def _data(self, data: DATA): self.__data = data


class JSON(Export):
    def into_response(self) -> BytesIO:
        file = BytesIO()

        prepared_data = bytes(dumps(self._data), encoding=ENCODING)

        file.write(prepared_data)
        file.seek(0)

        return file


class CSV(Export):
    def _write_attribute(self, dest: BytesIO, data: ROW):
        name = data.get("name")
        level_name = data.get("levelName")

        val = self.t_val(data.get("v", {}))
        acc = self.t_val(data.get("a", {}))
        dec = self.t_val(data.get("d", {}))
        total = self.sm(val, acc, dec)

        dest.write(bytes(
            f"{name},{level_name},{val[0]},{val[1]},{acc[0]},{acc[1]},{dec[0]},{dec[1]},{total}\n",
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
            f"{name},{val[0]},{val[1]},{acc[0]},{acc[1]},{dec[0]},{dec[1]},{total}\n",
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


class XLS(Export):
    __row_n = 0

    @property
    def _row_n(self) -> int: return self.__row_n

    @_row_n.setter
    def _row_n(self, new: int): self.__row_n = new

    def _write_attribute(self, dest: Worksheet, data: ROW):
        name = data.get("name")
        level_name = data.get("levelName")

        val = self.t_val(data.get("v", {}))
        acc = self.t_val(data.get("a", {}))
        dec = self.t_val(data.get("d", {}))
        total = self.sm(val, acc, dec)

        row = (name, level_name, val[0], val[1], acc[0], acc[1], dec[0], dec[1], total)

        for i, item in enumerate(row): dest.write(self._row_n, i, item)
        self._row_n += 1

        for child in (children := data.get("children", [])): self._write_attribute(dest, child)

    def _write_user(self, dest: Worksheet, data: ROW):
        name = data.get("name")

        val = self.t_val(data.get("v", {}))
        acc = self.t_val(data.get("a", {}))
        dec = self.t_val(data.get("d", {}))
        total = self.sm(val, acc, dec)

        row = (name, val[0], val[1], acc[0], acc[1], dec[0], dec[1], total)

        for i, item in enumerate(row): dest.write(self._row_n, i, item)
        self._row_n += 1

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

        xl = Workbook(file)
        sheet = xl.add_worksheet()

        headers = headers.split(",")

        for i, header in enumerate(headers): sheet.write(self._row_n, i, header)
        self._row_n += 1
        for row in self._data: write(sheet, row)

        xl.close()
        file.seek(0)

        return file
