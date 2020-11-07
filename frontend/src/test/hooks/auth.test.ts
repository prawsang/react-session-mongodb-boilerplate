import * as authType from "hooks/auth";
import { renderHook, act } from "@testing-library/react-hooks";
import Axios from "axios";

jest.mock("axios");
const mockedAxios = Axios as jest.Mocked<typeof Axios>;
describe("", () => {
  const dispatchSpy = jest.fn().mockImplementation((args) => args);

  jest.doMock("react-redux", () => ({
    useDispatch: () => dispatchSpy,
  }));
  const loginSpy = jest.fn();
  const logoutSpy = jest.fn();
  jest.doMock("common/actions/auth", () => ({
    login: loginSpy,
    logout: logoutSpy,
  }));
  const { useAuth } = require("hooks/auth") as typeof authType;

  describe("useAuth", () => {
    describe("login", () => {
      it("should login", async () => {
        mockedAxios.post.mockResolvedValueOnce({});
        const { result } = renderHook(() => useAuth());
        await act(async () => {
          result.current.login("username", "password");
        });
        expect(loginSpy).toBeCalled();
      });

      it("should logout if there is an error", async () => {
        mockedAxios.post.mockRejectedValueOnce({});
        const { result } = renderHook(() => useAuth());
        await act(async () => {
          result.current.login("username", "password");
        });
        expect(logoutSpy).toBeCalled();
      });
    });

    describe("logout", () => {
      it("should logout", async () => {
        mockedAxios.post.mockResolvedValueOnce({});
        const { result } = renderHook(() => useAuth());
        await act(async () => {
          result.current.logout();
        });
        expect(logoutSpy).toBeCalled();
      });
    });
  });
});
