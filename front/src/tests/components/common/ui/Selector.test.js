import { render, act, fireEvent, renderHook, screen } from '@testing-library/react';
import Selector from '../../../../components/common/ui/Selector';
import { mock_prepared_attributes } from '../../../_mock';

function test_solo_selector(attribute, choicePos=1) {
  const selector = screen.queryByRole('combobox', {name: attribute.name});

  expect(screen.queryByText(attribute.name).innerHTML).not.toBeNull();
  expect(selector).not.toBeNull();
  expect(selector.value).toBe('clear');
  expect(selector.options[selector.selectedIndex].text).toBe('-not set-');

  const option = selector.options[choicePos] || selector.options[1];
  fireEvent.change(selector, {target: {value: option.value}});

  expect(selector.value).toBe(option.value);
  expect(selector.options[selector.selectedIndex].text).toBe(option.text);

  if (attribute.children) {
    const [childAttribute] = attribute.children;
    if (childAttribute) test_solo_selector(childAttribute);
  }
}

test("selector component test, solo initial", () => {
  const attribute = mock_prepared_attributes.find(({multiple}) => !multiple);
  const attributesStack = [attribute];
  let depthCount = 0;
  while (attributesStack.length) {
    depthCount++;
    const { children } = attributesStack.pop();
    if (children) attributesStack.push(children[0]);
  }

  render(<Selector item={attribute} setOption={() => {}} selectorKey={1} />);

  test_solo_selector(attribute);
  expect(screen.queryAllByRole('combobox')).toHaveLength(depthCount);

  fireEvent.change(screen.queryAllByRole('combobox')[0], {target: {value: 'clear'}});

  expect(screen.queryAllByRole('combobox')).toHaveLength(1);

  test_solo_selector(attribute, 2);
  expect(screen.queryAllByRole('combobox')).toHaveLength(depthCount);
});

test("selector component test, solo applied", () => {
  const attribute = mock_prepared_attributes.find(({multiple}) => !multiple);
  const attributesStack = [attribute];
  while (true) {
    const { children } = attributesStack[attributesStack.length-1];
    if (children) attributesStack.push({
      ...children[0],
      attributes: children[0].attributes.filter(({parent}) => {
        const { attributes } = attributesStack[attributesStack.length-1]
        return parent === attributes[0].id;
      })
    });
    else break;
  }

  render(
    <Selector
      item={attribute}
      setOption={() => {}}
      applyGroups={attributesStack.map(({attributes}) => attributes[0].id)}
      selectorKey={1}
    />
  );

  expect(screen.queryAllByRole('combobox')).toHaveLength(attributesStack.length);

  for (let i=0; i < attributesStack.length; i++) {
    const selector = screen.queryAllByRole('combobox')[i];
    const option = attributesStack[i].attributes[0];
    expect(selector.value).toBe(String(option.id));
    expect(selector.options[selector.selectedIndex].text).toBe(option.name);
  }

  fireEvent.change(screen.queryAllByRole('combobox')[0], {target: {value: 'clear'}});
  expect(screen.queryAllByRole('combobox')).toHaveLength(1);

  test_solo_selector(attribute, 2);
  expect(screen.queryAllByRole('combobox')).toHaveLength(attributesStack.length);
});

test("selector component test, multiple initial", () => {
  const attribute = mock_prepared_attributes.find(({multiple}) => multiple);
  render(<Selector item={attribute} setOption={() => {}} selectorKey={1}/>);
  const selector = screen.queryByRole('listbox');
  expect(selector).not.toBeNull();
});