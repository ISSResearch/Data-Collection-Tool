import { fireEvent, act, render, screen } from "@testing-library/react";
import ProjectVisibility from ".";
import { MemoryRouter } from 'react-router-dom';
import { AlertContext } from '../../context/Alert';
import { api } from "../../config/api"

jest.mock('../../config/api');
afterEach(() => {
  jest.restoreAllMocks();
});

test("project visibility test", async () => {
  const permissions = {
    visibility: false,
    upload: false,
    view: false,
    validate: false,
    stats: false,
    download: true,
    edit: false,
  }
  const component = () => (
    <MemoryRouter>
      <AlertContext.Provider value={ { addAlert: e => e} }>
        <ProjectVisibility pathID={1} />
      </AlertContext.Provider>
    </MemoryRouter>
  )
  const init = async () => {
    var rerender, container;
    await act(async () => {
      var { rerender: r, contaner: c} = await render(component())
      rerender = r;
      container = c;
    });
    return {
      container,
      rerender: async () => await act(async () => await rerender(component()))
    }
  }
  api.get.mockResolvedValue({ data: [{ id: 1, username: 'name_test', permissions }] });

  await init();

  screen.getByRole('table');

  const cells = screen.getAllByRole('cell');
  expect(cells).toHaveLength(8);

  expect(cells.map((cell, index) => {
    return index === 0 ? cell.innerHTML : cell.firstChild.checked}
  ))
    .toEqual(['name_test'].concat(Object.values(permissions).map(val => val)));

  fireEvent.click(cells[1].firstChild);
  fireEvent.click(cells[2].firstChild);

  const updatedPermissions = { ...permissions, visibility: true, upload: true };

  expect(cells.map((cell, index) => index === 0 ? cell.innerHTML : cell.firstChild.checked))
    .toEqual(['name_test'].concat(Object.values(updatedPermissions).map(val => val)));

  api.request.mockResolvedValue({ data: [{ id: 1, username: 'name_test', permissions: updatedPermissions }] });

  await act(async () => fireEvent.click(screen.getByRole('button')));

  const newCells = screen.getAllByRole('cell');
  expect(newCells).toHaveLength(8);
  expect(newCells.map((cell, index) => {
    return index === 0 ? cell.innerHTML : cell.firstChild.checked
  }))
    .toEqual(['name_test'].concat(Object.values(updatedPermissions).map(val => val)));
});
