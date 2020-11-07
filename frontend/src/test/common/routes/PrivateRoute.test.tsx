import * as PrivateRouteType from "common/routes/PrivateRoute";
import React from "react";
import { render } from "@testing-library/react";

describe("", () => {
  const selectorSpy = jest.fn().mockImplementation((selector) => selector());

  jest.doMock("react-redux", () => ({
    useSelector: selectorSpy,
  }));
  const getAuthStateSpy = jest.fn();
  jest.doMock("common/selectors", () => ({
    getAuthState: getAuthStateSpy,
  }));
  const RouteSpy = () => <div data-testid="Route">Route</div>;
  const RedirectSpy = () => <div data-testid="Redirect">Redirect</div>;
  jest.doMock("react-router-dom", () => ({
    Route: RouteSpy,
    Redirect: RedirectSpy,
  }));
  const {
    default: PrivateRoute,
  } = require("common/routes/PrivateRoute") as typeof PrivateRouteType;

  describe("PrivateRoute", () => {
    it("should not return anything if the auth state is null.", async () => {
      getAuthStateSpy.mockReturnValue(null);
      const { container } = render(<PrivateRoute to="/" />);
      expect(container.firstChild).toBeNull();
    });

    it("should return the page if the auth state is true.", async () => {
      getAuthStateSpy.mockReturnValue(true);
      const { getByTestId } = render(<PrivateRoute to="/" />);
      expect(getByTestId("Route")).toBeDefined();
    });

    it("should redirect to the login page if the auth state is false", async () => {
      getAuthStateSpy.mockReturnValue(false);
      const { getByTestId } = render(<PrivateRoute to="/" />);
      expect(getByTestId("Redirect")).toBeDefined();
    });
  });
});
