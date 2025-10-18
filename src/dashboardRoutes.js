const express = require("express");
const router = express.Router();

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/");
  }
  next();
}

router.get("/dashboard", requireLogin, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.session.user.id;

  try {
    const [todayQuests] = await pool.query(
      "SELECT * FROM quests WHERE user_id = ? AND DATE(due_at) = CURDATE() AND is_done = 0",
      [userId]
    );

    const [upcomingQuests] = await pool.query(
      "SELECT * FROM quests WHERE user_id = ? AND DATE(due_at) > CURDATE() AND is_done = 0 ORDER BY due_at ASC",
      [userId]
    );

    const [rows] = await pool.query(
      "SELECT xp, coins, avatar, signup_avatar, theme_bg, username, daily_streak, weekly_streak, general_streak FROM users WHERE id = ?",
      [userId]
    );
    const user = rows[0];

    const [badges] = await pool.query(
      "SELECT ub.badge_key, ub.awarded_at, b.label, b.image FROM user_badges ub JOIN badges b ON b.badge_key = ub.badge_key WHERE ub.user_id = ? ORDER BY ub.awarded_at DESC",
      [userId]
    );

    if (user) {
      req.session.user = {
        ...req.session.user,
        xp: user.xp,
        coins: user.coins,
        avatar: user.avatar,
        signup_avatar: user.signup_avatar,
        theme_bg: user.theme_bg,
        username: user.username,
        daily_streak: user.daily_streak,
        weekly_streak: user.weekly_streak,
        general_streak: user.general_streak
      };
    }

    res.render("dashboard", {
      user: req.session.user,
      todayQuests,
      upcomingQuests,
      badges
    });
  } catch (error) {
    console.error(error);
    res.render("dashboard", {
      user: req.session.user,
      todayQuests: [],
      upcomingQuests: [],
      badges: []
    });
  }
});

module.exports = router;
