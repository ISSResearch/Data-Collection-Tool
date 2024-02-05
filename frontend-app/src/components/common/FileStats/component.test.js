import { act, render, screen } from '@testing-library/react';
import { raw_stats } from '../../../config/mock_data';
import FilesStats from '.';
import { AlertContext } from '../../../context/Alert';
import { MemoryRouter } from "react-router-dom";
import { api } from '../../../config/api';

jest.mock('../../../config/api');
afterEach(() => {
  jest.restoreAllMocks();
});

test("files stats component test", async () => {
  api.get.mockResolvedValue({ data: raw_stats });

  await act(async () => await render(
    <MemoryRouter>
      <AlertContext.Provider value={{addAlert: () => {}}}>
        <FilesStats pathID={1} />
      </AlertContext.Provider>
    </MemoryRouter>
  ));
  expect(screen.queryByRole('table')).toBeNull();
  screen.getByTestId('load-c');

  expect(screen.getAllByRole("radio")[0].checked).toBeTruthy();
  expect(screen.getAllByRole("radio")[1].checked).toBeTruthy();
  expect(screen.getAllByRole("radio")[0].value).toBe("attribute");
  expect(screen.getAllByRole("radio")[1].value).toBe("user");
});
