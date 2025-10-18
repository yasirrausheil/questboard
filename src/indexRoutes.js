const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

router.get("/", (req, res) => {
  res.render("login", { error: null });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const pool = req.app.locals.pool;

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

    if (rows.length === 0) {
      return res.render("login", { error: "No user with that email" });
    }

    const user = rows[0];
    const passwordOK = await bcrypt.compare(password, user.password_hash);

    if (!passwordOK) {
      return res.render("login", { error: "Wrong password" });
    }

    req.session.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      signup_avatar: user.signup_avatar,
      xp: user.xp,
      coins: user.coins,
      theme_bg: user.theme_bg,
      level: user.level || 1,
      general_streak: user.general_streak || 0,
      daily_streak: user.daily_streak || 0,
      weekly_streak: user.weekly_streak || 0
    };

    res.redirect("/dashboard");

  } catch (error) {
    console.error(error);
    res.render("login", { error: "Something went wrong" });
  }
});


router.get("/signup", (req, res) => {
  res.render("signup", { error: null });
});

router.post("/signup", async (req, res) => {
  const { email, username, password, avatar } = req.body;
  const pool = req.app.locals.pool;

  try {
    const [exists] = await pool.query("SELECT 1 FROM users WHERE email = ?", [email]);
    if (exists.length > 0) {
      return res.render("signup", { error: "Email is already taken" });
    }


    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO users
       (email, username, password_hash, avatar, signup_avatar, xp, coins, theme_bg, level, general_streak, daily_streak, weekly_streak, last_completed)
       VALUES (?, ?, ?, ?, ?, 0, 0, NULL, 1, 0, 0, 0, NULL)`,
      [email, username, hashed, avatar, avatar]
    );


    req.session.user = {
      id: result.insertId,
      email,
      username,
      avatar,
      signup_avatar: avatar,
      xp: 0,
      coins: 0,
      theme_bg: null,
      level: 1,
      general_streak: 0,
      daily_streak: 0,
      weekly_streak: 0
    };

    res.redirect("/dashboard");

  } catch (error) {
    console.error(error);
    res.render("signup", { error: "Something went wrong" });
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) console.error(err);
    res.redirect("/");
  });
});

module.exports = router;
