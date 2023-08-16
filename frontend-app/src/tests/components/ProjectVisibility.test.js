import { fireEvent, act, render, screen } from "@testing-library/react";
import ProjectVisibility from "../../components/ProjectVisibility";
import api from '../../config/api';

jest.mock('../../config/api');

afterEach(() => {
  jest.restoreAllMocks();
});

test("project visibility test", async () => {
  const permissions = {
    view: true,
    upload: false,
    validate: false,
    stats: false,
    download: true,
    edit: false,
  }
  api.get.mockResolvedValue({data: [ { id: 1, username: 'name_test', permissions } ]});

  await act(async () => render(<ProjectVisibility pathID={1}/>));

  screen.getByRole('table');
  screen.getByText('SUBMIT VISIBILITY');

  const cells = screen.getAllByRole('cell');
  expect(cells).toHaveLength(7);

  expect(cells.map((cell, index) => index === 0 ? cell.innerHTML : cell.firstChild.checked))
    .toEqual(['name_test'].concat(Object.values(permissions).map(val => val)));

  fireEvent.click(cells[1].firstChild);
  fireEvent.click(cells[2].firstChild);

  const updatedPermissions = { ...permissions, view: false, upload: true };
  expect(cells.map((cell, index) => index === 0 ? cell.innerHTML : cell.firstChild.checked))
    .toEqual(['name_test'].concat(Object.values(updatedPermissions).map(val => val)));

  api.request.mockResolvedValue({data: [ { id: 1, username: 'name_test', permissions: updatedPermissions } ]});

  await act(async () => fireEvent.click(screen.getByRole('button')));

  const newCells = screen.getAllByRole('cell');
  expect(newCells).toHaveLength(7);
  expect(newCells.map((cell, index) => index === 0 ? cell.innerHTML : cell.firstChild.checked))
    .toEqual(['name_test'].concat(Object.values(updatedPermissions).map(val => val)));
});

