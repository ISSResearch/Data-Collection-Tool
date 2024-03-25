import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import createStore from "../../store";
import { MemoryRouter } from "react-router-dom";
import { api, fileApi } from '../../config/api';
import FilesDownload from '.';

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
        <FilesDownload pathID={1} />
      </MemoryRouter>
    </Provider>
  );

  expect(screen.getAllByText('all')).toHaveLength(2);
  expect(screen.getAllByText('on validation')).toHaveLength(1);
  expect(screen.getAllByText('accepted')).toHaveLength(1);
  expect(screen.getAllByText('declined')).toHaveLength(1);

  expect(container.querySelector(".iss__filesDownload__selected").className)
    .toBe('iss__filesDownload__selected option--common');
 expect(container.querySelector(".iss__filesDownload__options__wrap").className)
   .toBe('iss__filesDownload__options__wrap');

  fireEvent.click(screen.getAllByText('all')[0].parentNode);
  expect(container.querySelector(".iss__filesDownload__options__wrap").className)
    .toBe('iss__filesDownload__options__wrap options--open');

  fireEvent.click(screen.getAllByText('all')[0].parentNode);
  expect(container.querySelector(".iss__filesDownload__options__wrap").className)
    .toBe('iss__filesDownload__options__wrap');

  expect(screen.getAllByText('all')[1].className).toBe('option--common');
  expect(screen.getByText('on validation').className).toBe('option--blue');
  expect(screen.getByText('accepted').className).toBe('option--green');
  expect(screen.getByText('declined').className).toBe('option--red');

  fireEvent.click(screen.getByText('accepted'));
  expect(screen.getAllByText('accepted')).toHaveLength(2);
  expect(screen.getAllByText('all')).toHaveLength(1);

  expect(screen.getAllByText('accepted')[0].parentNode.className)
    .toBe('iss__filesDownload__selected option--green');

  expect(screen.queryByTestId('load-c')).toBeNull();
  screen.getByText('request');

  expect(screen.queryByText("mock manual selector")).toBeNull();
  fireEvent.click(screen.getByRole("checkbox", {name: "select manually from option"}));
  screen.getByText("mock manual selector");
  fireEvent.click(screen.getByRole("checkbox", {name: "select manually from option"}));
  expect(screen.queryByText("mock manual selector")).toBeNull();

  fileApi.post.mockResolvedValue({data: {task_id: 1}});
  api.get.mockResolvedValue({data: [{id: 3}]});
  await act(async () => await fireEvent.submit(container.querySelector(".iss__filesDownload__form")));

  screen.getByText("mock download view");
});
