// backend/index.js
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const app = express();
const cors = require("cors");
const path = require("path");
const dbConnect = require("./db/dbConnect");
const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");
const { router: AuthRouter } = require("./routes/AuthRouter");

dbConnect();

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
    cookie: { secure: false, httpOnly: true, sameSite: "lax", maxAge: 24 * 60 * 60 * 1000 },
  })
);

app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/api/user", UserRouter);
app.use("/api/photo", PhotoRouter);
app.use("/api", AuthRouter);

app.get("/", (request, response) => {
  response.send({ message: "Hello from photo-sharing app API!" });
});

app.listen(8081, () => {
  console.log("server listening on port 8081");
});