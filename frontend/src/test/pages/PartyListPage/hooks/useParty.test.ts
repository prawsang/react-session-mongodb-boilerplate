import * as usePartyType from "pages/PartyListPage/hooks/useParty";
import { renderHook, act } from "@testing-library/react-hooks";
import Axios from "axios";

jest.mock("axios");
const mockedAxios = Axios as jest.Mocked<typeof Axios>;

const mockParty = {
  _id: "123",
  name: "namename",
  noPeople: 1,
  users: [],
};

const mockParty2 = {
  _id: "1233",
  name: "namenamename",
  noPeople: 2,
  users: [],
};

beforeEach(async () => {
  await mockedAxios.get.mockResolvedValueOnce({
    data: [mockParty, mockParty2],
  });
});
afterEach(() => {
  mockedAxios.get.mockReset();
  mockedAxios.put.mockReset();
});

describe("", () => {
  const fireSpy = jest.fn();
  jest.doMock("sweetalert2", () => ({
    fire: fireSpy,
  }));

  const {
    default: useParty,
  } = require("pages/PartyListPage/hooks/useParty") as typeof usePartyType;

  describe("useParty", () => {
    describe("changePeopleCountInParty", () => {
      it("should not edit the count if the joining is not successful", async () => {
        await mockedAxios.put.mockResolvedValueOnce({
          data: {
            nModified: 0,
          },
        });
        const { result } = renderHook(() => useParty());
        await act(async () => {
          result.current.getParties();
        });
        await act(async () => {
          result.current.onJoinClick(mockParty, 1)();
        });
        expect(result.current.parties[1].users).toHaveLength(0);
      });

      it("should add 1 to count when the user has successfully joined the party.", async () => {
        await mockedAxios.put.mockResolvedValueOnce({
          data: {
            nModified: 1,
          },
        });
        const { result } = renderHook(() => useParty());
        await act(async () => {
          result.current.getParties();
        });
        await act(async () => {
          result.current.onJoinClick(mockParty, 1)();
        });
        expect(result.current.parties[1].users).toHaveLength(1);
      });
    });

    describe("onJoinClick", () => {
      it("should show the success dialog when the user has successfully joined the party.", async () => {
        await mockedAxios.put.mockResolvedValueOnce({
          data: {
            nModified: 1,
          },
        });
        const { result } = renderHook(() => useParty());
        await act(async () => {
          result.current.getParties();
        });
        await act(async () => {
          result.current.onJoinClick(mockParty, 1)();
        });
        expect(fireSpy).toBeCalledWith(
          expect.objectContaining({ icon: "success" })
        );
      });

      it("should show the error dialog when the user has already joined the party.", async () => {
        await mockedAxios.put.mockResolvedValueOnce({
          data: {
            nModified: 0,
          },
        });
        const { result } = renderHook(() => useParty());
        await act(async () => {
          result.current.getParties();
        });
        await act(async () => {
          result.current.onJoinClick(mockParty, 1)();
        });
        expect(fireSpy).toBeCalledWith(
          expect.objectContaining({ icon: "error" })
        );
      });

      it("should show the error dialog when there is an error", async () => {
        await mockedAxios.put.mockResolvedValueOnce({ error: "error" });
        const { result } = renderHook(() => useParty());
        await act(async () => {
          result.current.getParties();
        });
        await act(async () => {
          result.current.onJoinClick(mockParty, 1)();
        });
        expect(fireSpy).toBeCalledWith(
          expect.objectContaining({ icon: "error" })
        );
      });
    });
  });
});
