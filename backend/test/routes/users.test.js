const httpStatus = require("http-status");
const User = require("../../models/user");
const session = require("supertest-session");
const app = require("../../app");

let testSession = null;

let createdUserId = null;
let mockUser = {
  username: "name123123",
  email: "e@e.com",
  password: "123",
  subscribed: true,
};

beforeAll(async () => {
  testSession = session(app);
  const res = await testSession.post("/users").send(mockUser);
  createdUserId = res.body._id;
});

afterAll(async () => {
  if (createdUserId) await User.findByIdAndDelete(createdUserId);
});

describe("Create User API (POST /users)", () => {
  it("should create a user if all fields is provided.", async () => {
    const res = await testSession
      .post("/users")
      .send({
        username: "nametest",
        email: "test@e.com",
        password: "123",
        subscribed: true,
      })
      .expect(httpStatus.CREATED);
    await User.findByIdAndDelete(res.body._id);
  });
  it("should not create a user if some fields are missing", async () => {
    await testSession
      .post("/users")
      .send({ username: "name" })
      .expect(httpStatus.BAD_REQUEST);
  });
});

describe("Get Current User API (GET /users/me)", () => {
  it("should not return the current user if there is not any", async () => {
    await testSession.get("/users/me").expect(httpStatus.UNAUTHORIZED);
  });
  it("should return the current user they are logged in", async () => {
    await testSession.post("/users/login").send({
      username: "name123123",
      password: "123",
    });
    await testSession.get("/users/me").expect(httpStatus.OK);
  });
  it("should not return the password", async () => {
    await testSession.post("/users/login").send({
      username: "name123123",
      password: "123",
    });
    const res = await testSession.get("/me");
    expect(res.body.password).toBeUndefined();
  });
});

describe("Login (POST /users/login)", () => {
  it("should login if the credentials are correct", async () => {
    await testSession
      .post("/users/login")
      .send({ username: "name123123", password: "123" })
      .expect(httpStatus.OK);
  });
  it("should not login if the credentials are incorrect", async () => {
    await testSession
      .post("/users/login")
      .send({ username: "name123123", password: "12345" })
      .expect(httpStatus.UNAUTHORIZED);
  });
});

describe("Is logged in (GET /users/session)", () => {
  beforeEach(async () => {
    const res = await testSession.post("/users").send(mockUser);
    createdUserId = res.body._id;
  });
  it("should return true if there is a session.", async () => {
    await testSession.post("/users/login").send({
      username: "name123123",
      password: "123",
    });
    const res = await testSession.get("/users/session").expect(httpStatus.OK);
    expect(res.body).toBeTruthy();
    await testSession.post("/users/logout");
  });
  it("should return false if there is not a session.", async () => {
    const res = await testSession.get("/users/session").expect(httpStatus.OK);
    expect(res.body).toBeFalsy();
  });
});
