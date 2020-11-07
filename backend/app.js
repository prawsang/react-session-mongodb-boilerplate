const dotenv = require("dotenv");

const envFile = process.env.NODE_ENV ? `${process.env.NODE_ENV}.env` : ".env";
dotenv.config({ path: envFile });

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
const mongoose = require("mongoose");

// auth
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const session = require("express-session");
app.use(
  session({
    key: "user_sid",
    secret: "mylittlesecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 600000,
    },
  })
);
app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) {
    res.clearCookie("user_sid");
  }
  next();
});

// connect db
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("connected to database"));

app.use(express.json());

const partiesRouter = require("./routes/parties");
const usersRouter = require("./routes/users");
app.use("/parties", partiesRouter);
app.use("/users", usersRouter);

const server = app.listen(5000, () => console.log("server started"));

module.exports = server;
