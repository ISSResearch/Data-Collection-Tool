import { act, render, screen, fireEvent } from '@testing-library/react';
import { attribute_stats } from '../../../config/mock_data';
import FilesStats from '.';
import { Provider } from 'react-redux';
import createStore from "../../../store";
import { MemoryRouter } from "react-router-dom";
import { api } from '../../../config/api';

jest.mock('../../../config/api');
afterEach(() => {
  jest.restoreAllMocks();
});

test("files stats component test", async () => {
  api.get.mockResolvedValue({ data: attribute_stats });

  await act(async () => render(
    <Provider store={createStore()}>
      <MemoryRouter>
        <FilesStats pathID={1} />
      </MemoryRouter>
    </Provider>
  ));

  expect(screen.getAllByRole('table')).toHaveLength(2);
  expect(screen.queryByTestId('load-c')).toBeNull();
  expect(screen.getAllByRole("radio")[0].checked).toBeTruthy();
  expect(screen.getAllByRole("radio")[1].checked).toBeFalsy();
  expect(screen.getAllByRole("radio")[0].value).toBe("attribute");
  expect(screen.getAllByRole("radio")[1].value).toBe("user");
  expect(screen.queryAllByRole("button")).toHaveLength(3);
  screen.getByText("Attribute");

  await act(async () => await fireEvent.click(screen.getAllByRole("radio")[1]));
  expect(screen.getAllByRole("radio")[0].checked).toBeFalsy();
  expect(screen.getAllByRole("radio")[1].checked).toBeTruthy();
  screen.getByText("User");
});
