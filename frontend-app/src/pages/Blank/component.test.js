import { screen, render, } from '@testing-library/react';
import { Provider } from "react-redux";
import createStore from "../../store";
import Blank from '.';

test("blank page test", () => {
  render(
    <Provider store={createStore()}><Blank /></Provider>
  );
  screen.getByText("Not Found");
});
