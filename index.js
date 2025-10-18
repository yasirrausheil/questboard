const express = require("express");
const session = require("express-session");
const mysql = require("mysql2/promise");
const indexRoutes = require("./src/indexRoutes.js");
const questRoutes = require("./src/questRoutes.js");
const dashboardRoutes = require("./src/dashboardRoutes.js");
const shopRoutes = require("./src/shopRoutes");
const profileRoutes = require("./src/profilroutes");


const config = require("./config/questboard.json");


const app = express();
const port = 1337;

const pool = mysql.createPool(config);
app.locals.pool = pool;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "my_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);

app.use("/", indexRoutes);
app.use("/", dashboardRoutes);
app.use("/", questRoutes);
app.use("/", shopRoutes);
app.use("/", profileRoutes);


app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
