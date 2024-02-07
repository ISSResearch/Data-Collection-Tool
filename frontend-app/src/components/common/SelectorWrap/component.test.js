import { render, fireEvent, screen } from '@testing-library/react';
import SelectorWrap from '.';
import { prepared_attributes } from '../../../config/mock_data';

function test_solo_selector(attribute, choicePos = 1) {
  var selector = screen.queryByRole('combobox', { name: attribute.name });

  expect(screen.queryByText(attribute.name).innerHTML).not.toBeNull();
  expect(selector).not.toBeNull();
  expect(selector.value).toBe('clear');
  expect(selector.options[selector.selectedIndex].text).toBe('-not set-');

  var option = selector.options[choicePos] || selector.options[1];
  fireEvent.change(selector, { target: { value: option.value } });

  expect(selector.value).toBe(option.value);
  expect(selector.options[selector.selectedIndex].text).toBe(option.text);

  if (attribute.children) {
    var [childAttribute] = attribute.children;
    if (childAttribute) test_solo_selector(childAttribute);
  }
}

test("selector component test, solo initial", () => {
  var attribute = prepared_attributes.find(({ multiple }) => !multiple);
  var attributesStack = [attribute];
  var depthCount = 0;

  while (attributesStack.length) {
    depthCount++;
    const { children } = attributesStack.pop();
    if (children) attributesStack.push(children[0]);
  }

  render(<SelectorWrap item={attribute} onChange={() => { }} />);

  test_solo_selector(attribute);
  expect(screen.queryAllByRole('combobox')).toHaveLength(depthCount);

  fireEvent.change(screen.queryAllByRole('combobox')[0], { target: { value: 'clear' } });

  expect(screen.queryAllByRole('combobox')).toHaveLength(1);

  test_solo_selector(attribute, 2);
  expect(screen.queryAllByRole('combobox')).toHaveLength(depthCount);
});

test("selector component test, solo applied", () => {
  var attribute = prepared_attributes.find(({ multiple }) => !multiple);
  var attributesStack = [attribute];

  while (attributesStack.length) {
    var { children } = attributesStack[attributesStack.length - 1];
    if (children) attributesStack.push({
      ...children[0],
      attributes: children[0].attributes.filter(({ parent }) => {
        var { attributes } = attributesStack[attributesStack.length - 1]
        return parent === attributes[0].id;
      })
    });
    else break;
  }

  render(
    <SelectorWrap
      item={attribute}
      onChange={() => { }}
      applyGroups={attributesStack.map(({ attributes }) => attributes[0].id)}
    />
  );

  expect(screen.queryAllByRole('combobox')).toHaveLength(attributesStack.length);

  for (var i = 0; i < attributesStack.length; i++) {
    var selector = screen.queryAllByRole('combobox')[i];
    var option = attributesStack[i].attributes[0];
    expect(selector.value).toBe(String(option.id));
    expect(selector.options[selector.selectedIndex].text).toBe(option.name);
  }

  fireEvent.change(screen.queryAllByRole('combobox')[0], { target: { value: 'clear' } });
  expect(screen.queryAllByRole('combobox')).toHaveLength(1);

  test_solo_selector(attribute, 2);
  expect(screen.queryAllByRole('combobox')).toHaveLength(attributesStack.length);
});

test("selector component test, multiple initial", () => {
  var attribute = prepared_attributes.find(({ multiple }) => multiple);
  render(<SelectorWrap item={attribute} onChange={() => { }}  />);
  var selector = screen.queryByRole('listbox');
  expect(selector).not.toBeNull();
});
