import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import createStore from "../../store";
import { MemoryRouter } from "react-router-dom";
import { api, fileApi } from '../../config/api';
import FilesDownload from '.';
import { prepared_attributes } from "../../config/mock_data";

jest.mock("../../config/api");
jest.mock("../forms/FileDownloadSelector", () => () => "mock manual selector");
jest.mock("../common/DownloadView", () => () => "mock download view");
afterEach(() => {
  jest.restoreAllMocks();
});

test("files download component base test", async () => {
  const { container } = render(
    <Provider store={createStore()}>
      <MemoryRouter>
        <FilesDownload attributes={prepared_attributes} pathID={1} />
      </MemoryRouter>
    </Provider>
  );

  expect(screen.queryByTestId('load-c')).toBeNull();
  screen.getByText('request');

  expect(screen.queryByText("mock manual selector")).toBeNull();
  fireEvent.click(screen.getByRole("checkbox", {name: "select manually from option"}));
  screen.getByText("mock manual selector");
  fireEvent.click(screen.getByRole("checkbox", {name: "select manually from option"}));
  expect(screen.queryByText("mock manual selector")).toBeNull();

  fileApi.post.mockResolvedValue({data: {task_id: 1}});
  api.get.mockResolvedValue({data: {data: [{id: 3}]}});
  await act(async () => await fireEvent.submit(container.querySelector(".iss__filesDownload__form")));

  screen.getByText("mock download view");
});
