import { renderHook, act } from "@testing-library/react";
import useFileUploader from "../fileUploader";
import { upload_files } from "../../config/mock_data";

jest.mock("../../config/api", () => ({
  api: {
    request: (_, requestData) => {
      var data = JSON.parse(requestData.data.get("meta[]"));
      var id = Number(data.name[data.name.length - 1]);
      return { data: { created_files: [{ id }] } };
    },
    delete: () => {}
  },
  fileApi: {
    request: (_, requestData) => {
      var { Chunk: chunk, "Total-Chunks": total } = requestData.headers;
      var fileID = requestData.data.file[0];
      if (fileID >= 3 && chunk == 2) {
        var err = new Error("some file error");
        err.response = { data: { ok: "file error" }, status: fileID === 4 ? 401 : 200 };
        throw err;
      }
      return { data: { transfer_complete: chunk === total } };
    },
  },
}));

afterEach(() => {
  jest.restoreAllMocks();
});

test("file uploader hook test", async () => {
  const { result: hook } = renderHook(() => useFileUploader(1));

  expect(hook.current.files).toHaveLength(0);

  act(() => hook.current.setFiles(upload_files.slice(0,3)));
  expect(hook.current.files).toHaveLength(upload_files.length - 1);

  await act(async () => await hook.current.proceedUpload());

  hook.current.files.forEach((file, index) => {
    var broken = index >= 2;
    var { progress, status } = file;
    expect({ progress, status }).toEqual({
      progress: broken ? 25 : 100,
      status: broken ? 'f' : 'a'
    });
  });

  act(() => hook.current.setFiles(upload_files.slice(3)));
  expect(hook.current.files).toHaveLength(1);

  try {
    await act(async () => await hook.current.proceedUpload());
  }
  catch ({ message, authFailed }) {
   expect(message).toBe("some file error");
   expect(authFailed).toBeTruthy();
  }
});
