import { act, render, screen, fireEvent } from '@testing-library/react';
import { raw_attribute_stats } from '../../../config/mock_data';
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
  api.get.mockResolvedValue({ data: raw_attribute_stats });

  await act(async () => await render(
    <Provider store={createStore()}>
      <MemoryRouter>
        <FilesStats pathID={1} />
      </MemoryRouter>
    </Provider>
  ));

  screen.getByRole('table');
  expect(screen.queryByTestId('load-c')).toBeNull();
  expect(screen.getAllByRole("radio")[0].checked).toBeTruthy();
  expect(screen.getAllByRole("radio")[1].checked).toBeFalsy();
  expect(screen.getAllByRole("radio")[0].value).toBe("attribute");
  expect(screen.getAllByRole("radio")[1].value).toBe("user");
  screen.getByText("Attribute");
  screen.getByText(raw_attribute_stats.reduce((a,{count, attribute__parent: parent}) => a + (parent ? 0 : count), 0));

  await act(async () => await fireEvent.click(screen.getAllByRole("radio")[1]));
  expect(screen.getAllByRole("radio")[0].checked).toBeFalsy();
  expect(screen.getAllByRole("radio")[1].checked).toBeTruthy();
  screen.getByText("User");
});
