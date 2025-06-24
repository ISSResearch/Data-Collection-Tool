from zlib import decompress
from io import BytesIO
from typing import Optional, Any, Literal
from os.path import join, exists
from os import mkdir

type File = dict[
    Literal[
        "filename",
        "compression_method",
        "compressed_size",
        "uncompressed_size",
        "crc32",
        "bytes_read",
    ],
    Any
]

FILE_HEADER: bytes = b"PK\x03\x04"
ENDIAN: Literal["little", "big"] = "little"
CHUNK_SIZE: int = 1 << 20


def extract_zip(zip_path: str, output_dir: str):
    extracted: int = 0
    current: Optional[BytesIO] = None
    file: Optional[File] = None
    on_header: bool = True
    buffer: bytes = b""

    if not exists(output_dir): mkdir(output_dir)

    with open(zip_path, "rb") as zip:
        while chunk := zip.read(CHUNK_SIZE):
            buffer += chunk

            while len(buffer) > 30:
                if on_header:
                    header_pos = buffer.find(FILE_HEADER)
                    if header_pos == -1:
                        buffer = buffer[-3:] if len(buffer) > 3 else buffer
                        break

                    buffer = buffer[header_pos:]

                    if len(buffer) < 30: break

                    try:
                        filename_length = int.from_bytes(buffer[26:28], ENDIAN)
                        extra_field_length = int.from_bytes(buffer[28:30], ENDIAN)

                        header_size = 30 + filename_length + extra_field_length
                        if len(buffer) < header_size: break

                        file = {
                            "filename": buffer[30:30+filename_length].decode("utf-8", errors="replace"),
                            "compression_method": int.from_bytes(buffer[8:10], ENDIAN),
                            "compressed_size": int.from_bytes(buffer[18:22], ENDIAN),
                            "uncompressed_size": int.from_bytes(buffer[22:26], ENDIAN),
                            "crc32": int.from_bytes(buffer[14:18], ENDIAN),
                            "bytes_read": 0
                        }

                        current = BytesIO()

                        buffer = buffer[header_size:]
                        on_header = False

                    except Exception as e: print(f"Error parsing header: {e}"); buffer = buffer[4:]

                else:
                    assert file and current

                    read_n = min(len(buffer), file["compressed_size"] - file["bytes_read"])

                    current.write(buffer[:read_n])
                    file["bytes_read"] += read_n

                    buffer = buffer[read_n:]

                    if file["bytes_read"] >= file["compressed_size"]:
                        try:
                            data = current.getvalue()

                            match file["compression_method"]:
                                case 0: decompressed = data
                                case 8: decompressed = decompress(data, -15)
                                case _: raise ValueError(f"Unsupported compression {file['compression_method']} / {file['filename']}")

                            with open(join(output_dir, file["filename"]), "wb") as f:
                                f.write(decompressed)
                                print(f"Extracted: {file['filename']} ({len(decompressed)} bytes)")
                                extracted += 1

                        except Exception as e: print(f"Error extracting {file['filename']}: {e}")

                        on_header = True
                        current = None
                        file = None

    print(f"Total files extracted: {extracted}")
