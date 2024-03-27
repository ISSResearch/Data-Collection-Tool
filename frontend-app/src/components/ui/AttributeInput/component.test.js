import { fireEvent, act, render, renderHook, screen } from '@testing-library/react';
import AttributeInput from '.';
import { Provider } from 'react-redux';
import createStore from "../../../store";
import { useAttributeManager, } from '../../../hooks';
import { MemoryRouter } from 'react-router-dom';
import { prepared_attributes } from '../../../config/mock_data';
import { api } from '../../../config/api';

jest.mock('../../../config/api');

afterEach(() => {
  jest.restoreAllMocks();
});

test("attribute inout basic test", () => {
  const { result: attributes } = renderHook(() => useAttributeManager());

  act(() => attributes.current.formHook.addForm());
  const [form] = Object.keys(attributes.current.formHook.forms);

  const component = () => (
    <Provider store={createStore()}>
      <MemoryRouter>
        <AttributeInput
          formId={form}
          attributes={attributes.current.attributeHook.attributes[form]}
          depth={attributes.current.levelHook.levels[form].length}
          delAttribute={attributes.current.attributeHook.delAttribute}
          addAttribute={attributes.current.attributeHook.addAttribute}
          handleChange={attributes.current.attributeHook.handleChange}
          setDeletedOriginAttributes={attributes.current.attributeHook.setDeletedOriginAttributes}
          moveUp={attributes.current.attributeHook.moveUp}
          moveDown={attributes.current.attributeHook.moveDown}
        />
    </MemoryRouter>
  </Provider>
  );

  const { rerender } = render(component());

  expect(screen.queryAllByText('confirm')).toHaveLength(0);
  expect(screen.queryAllByText('------|')).toHaveLength(0);
  expect(screen.queryAllByPlaceholderText("Attribute name")).toHaveLength(0);

  act(() => {
    attributes.current.levelHook.addLevel(form);
    attributes.current.attributeHook.addAttribute(form);
  });

  rerender(component());
  expect(screen.queryAllByText('confirm')).toHaveLength(0);
  expect(screen.queryAllByText('------|')).toHaveLength(0);
  expect(screen.queryAllByPlaceholderText("Attribute name")).toHaveLength(1);
  expect(screen.getAllByRole("button")).toHaveLength(1);

  act(() => {
    attributes.current.levelHook.addLevel(form);
    attributes.current.attributeHook.addAttribute(form, "0");
  });

  rerender(component());
  expect(screen.queryAllByText('------|')).toHaveLength(1);
  expect(screen.queryAllByPlaceholderText("Attribute name")).toHaveLength(2);
  var buttons = screen.getAllByRole("button");
  expect(buttons).toHaveLength(3);
  buttons.forEach((b, i) => expect(b.className).toBe("inputButton--" + (i % 2 ? "add" : "del")));

  fireEvent.click(screen.getAllByRole("button")[1]);
  rerender(component());
  expect(screen.queryAllByPlaceholderText("Attribute name")).toHaveLength(3);
  expect(screen.getAllByRole("button")).toHaveLength(4);

  fireEvent.click(screen.getAllByRole("button")[3]);
  fireEvent.click(screen.getAllByRole("button")[2]);
  rerender(component());
  expect(screen.queryAllByPlaceholderText("Attribute name")).toHaveLength(1);
  expect(screen.getAllByRole("button")).toHaveLength(2);
  expect(screen.queryByText("confirm")).toBeNull();
});

test("attribute input component preset test", async () => {
  const { result: hook } = renderHook(() => useAttributeManager());

  act(() => hook.current.formHook.boundAttributes(prepared_attributes.slice(0, 1)));
  const [firstForm] = Object.keys(hook.current.formHook.forms);

  var attributes = [];
  var attributesStack = [...hook.current.attributeHook.attributes[firstForm]];
  while (attributesStack.length) {
    var item = attributesStack.pop();
    attributes.push(item);
    if (item.children) attributesStack.push(...item.children);
  }

  const getParentInputs = () => {
    return screen.queryAllByPlaceholderText("Attribute name")
      .filter((input) => input.parentNode.parentNode.className === "iss__attributeForm");
  };
  const component = () => (
    <Provider store={createStore()}>
      <MemoryRouter>
        <AttributeInput
          formId={firstForm}
          attributes={hook.current.attributeHook.attributes[firstForm]}
          depth={hook.current.levelHook.levels[firstForm].length}
          delAttribute={hook.current.attributeHook.delAttribute}
          addAttribute={hook.current.attributeHook.addAttribute}
          handleChange={hook.current.attributeHook.handleChange}
          setDeletedOriginAttributes={hook.current.attributeHook.setDeletedOriginAttributes}
          moveUp={hook.current.attributeHook.moveUp}
          moveDown={hook.current.attributeHook.moveDown}
        />
      </MemoryRouter>
  </Provider>
  );

  const { rerender } = render(component());
  expect(screen.queryAllByText('confirm')).toHaveLength(0);
  expect(screen.getAllByText('------|'))
    .toHaveLength(attributes.length - hook.current.attributeHook.attributes[firstForm].length);
  expect(screen.getAllByPlaceholderText('Attribute name')).toHaveLength(attributes.length);

  attributes.forEach(({ name, parent }) => {
    var parentElement = screen.getByDisplayValue(name).parentNode.parentNode;
    expect(parentElement.className).toBe(
      parent
        ? 'iss__attributeForm attribute--child'
        : 'iss__attributeForm'
    );
  });

  fireEvent.click(screen.getAllByRole('button')[1]);
  rerender(component());
  expect(screen.getAllByPlaceholderText('Attribute name'))
    .toHaveLength(attributes.length + 1);

  fireEvent.change(screen.getByDisplayValue(''), { target: { value: 'new_test' } });
  rerender(component());
  screen.getByDisplayValue('new_test');
  var parents = getParentInputs().map((e) => e.value);
  expect(getParentInputs()).toHaveLength(2);

  fireEvent.click(getParentInputs()[0].parentNode.querySelectorAll("svg")[1]);
  rerender(component());
  expect(getParentInputs()[0].value).toBe(parents[1]);

  fireEvent.click(getParentInputs()[1].parentNode.querySelectorAll("svg")[0]);
  rerender(component());
  expect(getParentInputs()[0].value).toBe(parents[0]);

  fireEvent.click(screen.getByDisplayValue('new_test').parentNode.querySelector("button"));
  rerender(component());
  expect(screen.queryByDisplayValue('new_test')).toBeNull();

  fireEvent.click(screen.getAllByRole('button')[0]);
  rerender(component());
  expect(screen.queryAllByText('confirm')).toHaveLength(1);

  api.request.mockResolvedValue({});
  fireEvent.click(screen.getByText("no"));
  rerender(component());
  expect(screen.queryAllByText('confirm')).toHaveLength(0);
  expect(hook.current.attributeHook.deletedOriginAttributes).toHaveLength(0);

  fireEvent.click(screen.getAllByRole('button')[0]);
  rerender(component());
  await act(async () => await fireEvent.click(screen.getByText("yes")));
  rerender(component());
  expect(screen.queryAllByText('confirm')).toHaveLength(0);
  expect(hook.current.attributeHook.deletedOriginAttributes).toHaveLength(1);
  expect(screen.queryAllByPlaceholderText).toHaveLength(0);
});
