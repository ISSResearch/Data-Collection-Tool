import { renderHook, act } from '@testing-library/react';
import { api } from '../../config/api';
import useAuthModal from '../authModal';

jest.mock('../../config/api');

afterEach(() => {
  jest.restoreAllMocks();
});

var modalID = "modalName";
var err = new Error("some");
err.response = {status: 401};
var authEvent = {
  preventDefault: () => {},
  target: [{value: "name"}, {value: "pass"}]
}

test("auth modal hook test", async () => {
  window.state = false;
  window.authRes = false;
  global.window[modalID] = {
    showModal: () => (window.state = true),
    close: () => window.state = false
  }
  const { result: hook } = renderHook(() => useAuthModal(modalID, () => window.authRes = true));


  api.get.mockResolvedValue("ok");
  await act(async () => {
    await hook.current.checkAuth();
  })
  expect(window.state).toBeFalsy();

  api.get.mockRejectedValue(err)

  await act(async () => {
    try { await hook.current.checkAuth(); }
    catch({message}) { expect(message).toBe("some");}
  });
  expect(window.state).toBeTruthy();

  api.request.mockResolvedValue({data: {message: "some", isAuth: false}});
  await act(async () => {
    await hook.current.handleAuth(authEvent);
  });
  expect(hook.current.modalErrors).toBe("some");
  expect(window.state).toBeTruthy();
  expect(window.authRes).toBeFalsy();

  api.request.mockResolvedValue({status: 200, data: {isAuth: true}});
  await act(async () => {
    await hook.current.handleAuth(authEvent);
  });
  expect(window.state).toBeFalsy();
  expect(window.authRes).toBeTruthy();
});
