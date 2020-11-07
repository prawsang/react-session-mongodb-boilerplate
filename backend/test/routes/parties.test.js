const httpStatus = require("http-status");
const Party = require("../../models/party");
const User = require("../../models/party");
const session = require("supertest-session");
const app = require("../../app");

let testSession = null;

let createdUserId = null;
let createdPartyId = null;
let mockUser = {
  username: "name123123",
  email: "e@e.com",
  password: "123",
  subscribed: true,
};
let mockParty = {
  name: "partyname",
  noPeople: 1,
};
let mockFullParty = {
  name: "partyname",
  noPeople: 0,
};

beforeAll(async () => {
  testSession = session(app);
  const user = await testSession.post("/users").send(mockUser);
  createdUserId = user.body._id;
});

beforeEach(async () => {
  const party = await testSession.post("/parties").send(mockParty);
  createdPartyId = party.body._id;
});

afterAll(async () => {
  if (createdUserId) await User.findByIdAndDelete(createdUserId);
});

afterEach(async () => {
  if (createdPartyId) await Party.findByIdAndDelete(createdPartyId);
});

describe("Create Party API (POST /parties)", () => {
  it("should create a user if all fields is provided.", async () => {
    const res = await testSession
      .post("/parties")
      .send({
        name: "mockparty",
        noPeople: 1,
      })
      .expect(httpStatus.CREATED);
    await Party.findByIdAndDelete(res.body._id);
  });
  it("should not create a user if some fields are missing", async () => {
    await testSession
      .post("/parties")
      .send({ name: "name" })
      .expect(httpStatus.BAD_REQUEST);
  });
});

describe("Get a Party (GET /parties/_id)", () => {
  it("should be OK", async () => {
    await testSession.get(`/parties/${createdPartyId}`).expect(httpStatus.OK);
  });
});

describe("Get Parties (GET /parties)", () => {
  it("should be OK", async () => {
    await testSession.get("/parties").expect(httpStatus.OK);
  });
});

describe("Join a Party (PUT /parties/join)", () => {
  it("should not join if the user is not logged in.", async () => {
    await testSession
      .put("/parties/join")
      .send({ partyId: createdPartyId })
      .expect(httpStatus.UNAUTHORIZED);
  });
  it("should join if the user is logged in.", async () => {
    await testSession
      .post("/users/login")
      .send({ username: "name123123", password: "123" });

    await testSession
      .put("/parties/join")
      .send({ partyId: createdPartyId })
      .expect(httpStatus.OK);
  });

  it("should not join if the party is full.", async () => {
    await testSession
      .post("/users/login")
      .send({ username: "name123123", password: "123" });

    const res = await testSession.post("/parties").send(mockFullParty);

    await testSession
      .put("/parties/join")
      .send({ partyId: res.body._id })
      .expect(httpStatus.BAD_REQUEST);
    await Party.findByIdAndDelete(res.body._id);
  });
});
