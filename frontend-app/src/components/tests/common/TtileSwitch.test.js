import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'
import TitleSwitch from '../../../components/common/TitleSwitch';

function test_selected_option(options, current, parentLink, titleLink) {

  const title = screen.getByRole('heading');
  const [titleChild] = title.children;
  expect(titleChild.innerHTML).toBe('Test Title');
  expect(titleChild.tagName).toBe(titleLink ? 'A' : 'SPAN');
  if (titleLink) expect(titleChild.href).toBe('http://localhost/' + parentLink);

  const linkSet = Array.from(screen.getByRole('navigation').children[0].children);

  expect(linkSet.map(({firstChild}) => firstChild.href ))
    .toEqual(options.map(({ link }) => `http://localhost/${parentLink}/${link}`));
  expect(linkSet.map(({firstChild}) => firstChild.innerHTML ))
    .toEqual(options.map(({ name }) => name));

  options.forEach(({ link, name }) => {
    expect(screen.getByText(name).className)
      .toBe(
        current == link
          ? 'iss__titleSwitch__navItem--active'
          : 'iss__titleSwitch__navItem'
      );
  });
}

test("title switch component test", () => {
  const options = [
    { name: 'upload data', link: 'upload' },
    { name: 'validate data', link: 'validate' },
    { name: 'download data', link: 'download' },
  ];

  const { rerender } = render(
    <MemoryRouter>
      <TitleSwitch
        title='Test Title'
        titleLink
        links={options}
        currentRoute='upload'
        parent='projects/1'
      />
    </MemoryRouter>
  );
  test_selected_option(options, 'upload', 'projects/1', true);

  rerender(
    <MemoryRouter>
      <TitleSwitch
        title='Test Title'
        links={options}
        currentRoute='upload'
        parent='projects/1'
      />
    </MemoryRouter>
  );
  test_selected_option(options, 'upload', 'projects/1', false);

  rerender(
    <MemoryRouter>
      <TitleSwitch
        title='Test Title'
        links={options}
        currentRoute='edit'
        parent='projects/1'
      />
    </MemoryRouter>
  );
});
