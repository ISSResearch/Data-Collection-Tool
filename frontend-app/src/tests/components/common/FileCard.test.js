import { render, screen } from '@testing-library/react';
import FileCard from '../../../components/common/FileCard';

test("file card component test, active status 0", () => {
  const { rerender } = render(
    <FileCard
      key={0}
      cardIndex={0}
      name={'file_name'}
      author_name={'author_name'}
      date={'11-11-200'}
      status={''}
      active={false}
      handleCLick={() => {}}
    />
  );
  screen.getByText('file_name');
  screen.getByText('author_name');
  screen.getByText('11-11-200');

  const parent = screen.getByRole('heading').parentNode;

  expect(parent.className).toBe('iss__fileCard');

  rerender(
    <FileCard
      key={0}
      cardIndex={0}
      name={'file_name'}
      author_name={'author_name'}
      date={'11-11-200'}
      status={'a'}
      active={false}
      handleCLick={() => {}}
    />
  );
  expect(parent.className).toBe('iss__fileCard card--accepted');

  rerender(
    <FileCard
      key={0}
      cardIndex={0}
      name={'file_name'}
      author_name={'author_name'}
      date={'11-11-200'}
      status={'d'}
      active={false}
      handleCLick={() => {}}
    />
  );
  expect(parent.className).toBe('iss__fileCard card--rejected');

  rerender(
    <FileCard
      key={0}
      cardIndex={0}
      name={'file_name'}
      author_name={'author_name'}
      date={'11-11-200'}
      status={''}
      active={true}
      handleCLick={() => {}}
    />
  );
  expect(parent.className).toBe('iss__fileCard card--active');

  rerender(
    <FileCard
      key={0}
      cardIndex={0}
      name={'file_name'}
      author_name={'author_name'}
      date={'11-11-200'}
      status={'a'}
      active={true}
      handleCLick={() => {}}
    />
  );
  expect(parent.className).toBe('iss__fileCard card--active card--accepted');
});
