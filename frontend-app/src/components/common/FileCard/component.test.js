import { render, screen, fireEvent } from '@testing-library/react';
import FileCard from '.';

test("file card component test, active status 0", () => {
  const { rerender } = render(
    <FileCard
      key={0}
      cardIndex={0}
      file={{
        id: "file_name",
        upload_date: "11-11-200",
        author_name: "author_name",
        status: "v",
      }}
      active={false}
      handleCLick={() => {}}
    />
  );
  screen.getByText('file_name');
  screen.getByText('author_name');
  screen.getByText('11-11-200');

  const parent = screen.getByRole('heading').parentNode;

  expect(parent.className).toBe("iss__fileCard card--v ");

  rerender(
    <FileCard
      key={0}
      cardIndex={0}
      file={{
        file_name: "file_name",
        upload_date: "11-11-200",
        author_name: "author_name",
        status: "a",
      }}
      active={false}
      handleCLick={() => {}}
    />
  );
  expect(parent.className).toBe('iss__fileCard card--a ');

  rerender(
    <FileCard
      key={0}
      cardIndex={0}
      file={{
        id: "file_name",
        upload_date: "11-11-200",
        author_name: "author_name",
        status: "d",
      }}
      active={false}
      handleCLick={() => {}}
    />
  );
  expect(parent.className).toBe('iss__fileCard card--d ');

  rerender(
    <FileCard
      key={0}
      cardIndex={0}
      file={{
        file_name: "file_name",
        upload_date: "11-11-200",
        author_name: "author_name",
        status: "v",
      }}
      active={true}
      handleCLick={() => {}}
    />
  );
  expect(parent.className).toBe('iss__fileCard card--v card--active');

  var clicked = false;
  rerender(
    <FileCard
      key={0}
      cardIndex={0}
      file={{
        file_name: "file_name",
        upload_date: "11-11-200",
        author_name: "author_name",
        status: "a",
      }}
      active={true}
      handleCLick={() => clicked = true}
    />
  );
  expect(parent.className).toBe('iss__fileCard card--a card--active');
  fireEvent.click(parent);
  expect(clicked).toBeTruthy();
});
