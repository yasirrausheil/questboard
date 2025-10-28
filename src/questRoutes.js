const express = require("express");
const router = express.Router();

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/");
  }
  next();
}

router.get("/quest_new", requireLogin, (req, res) => {
  res.render("quest_new", { error: null });
});

router.post("/quests", requireLogin, async (req, res) => {
  const { title, description, type, due_at } = req.body;
  const pool = req.app.locals.pool;
  const userId = req.session.user.id;

  try {
    const today = new Date().toISOString().split("T")[0];
    if (due_at < today) {
      return res.render("quest_new", { error: "Date must be today or later" });
    }

    await pool.query(
      "INSERT INTO quests (user_id, title, description, type, due_at, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
      [userId, title, description, type, due_at]
    );

    res.redirect("/dashboard");
  } catch (err) {
    console.log(err);
    res.render("quest_new", { error: "Could not create quest" });
  }
});

router.get("/quests/:id/edit", requireLogin, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.session.user.id;
  const questId = req.params.id;

  try {
    const [[quest]] = await pool.query(
      "SELECT id, title, description, type, DATE_FORMAT(due_at, '%Y-%m-%d') AS due_at FROM quests WHERE id = ? AND user_id = ?",
      [questId, userId]
    );

    if (!quest) return res.redirect("/dashboard");
    res.render("quest_edit", { quest, error: null });
  } catch (err) {
    console.log(err);
    res.redirect("/dashboard");
  }
});

router.post("/quests/:id/update", requireLogin, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.session.user.id;
  const questId = req.params.id;
  const { title, description, type, due_at } = req.body;

  try {
    const today = new Date().toISOString().split("T")[0];
    if (due_at < today) {
      return res.render("quest_edit", {
        quest: { id: questId, title, description, type, due_at },
        error: "Date must be today or later"
      });
    }

    const [old] = await pool.query("SELECT * FROM quests WHERE id=? AND user_id=?", [questId, userId]);
    if (old.length === 0) return res.redirect("/dashboard");

    const q = old[0];
    const newTitle = title || q.title;
    const newDesc = description || q.description;
    const newType = type || q.type;
    const newDate = due_at || q.due_at;

    await pool.query(
      "UPDATE quests SET title=?, description=?, type=?, due_at=? WHERE id=? AND user_id=?",
      [newTitle, newDesc, newType, newDate, questId, userId]
    );

    res.redirect("/dashboard");
  } catch (err) {
    console.log(err);
    res.render("quest_edit", {
      quest: { id: questId, title, description, type, due_at },
      error: "Update failed"
    });
  }
});

router.post("/quests/:id/complete", requireLogin, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.session.user.id;
  const questId = req.params.id;

  try {
    const [quests] = await pool.query("SELECT * FROM quests WHERE id = ? AND user_id = ?", [questId, userId]);
    if (quests.length === 0) return res.redirect("/dashboard");

    const quest = quests[0];
    if (quest.is_done === 1) return res.redirect("/dashboard");

    var addXp = 0;
    var addCoins = 0;

    if (quest.type === "daily") { addXp = 10; addCoins = 5; }
    else if (quest.type === "once") { addXp = 15; addCoins = 10; }
    else if (quest.type === "weekly") { addXp = 50; addCoins = 20; }

    await pool.query("UPDATE quests SET is_done = 1, completed_at = NOW() WHERE id = ? AND user_id = ?", [questId, userId]);

    const [[user]] = await pool.query("SELECT * FROM users WHERE id = ?", [userId]);

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yString = yesterday.toISOString().split("T")[0];

    var gStreak = user.general_streak || 0;
    if (!user.last_completed) gStreak = 1;
    else if (user.last_completed === yString) gStreak = gStreak + 1;
    else gStreak = 1;

    var dCount = user.daily_count || 0;
    var dStreak = user.daily_streak || 0;

    var wCount = user.weekly_count || 0;
    var wStreak = user.weekly_streak || 0;

    if (quest.type === "daily") {
      dCount = dCount + 1;
      if (dCount >= 3) {
        dStreak = dStreak + 1;
        dCount = 0;
        await pool.query(
          "INSERT IGNORE INTO user_badges (user_id, badge_key, awarded_at) VALUES (?, 'daily_3', NOW())",
          [userId]
        );
      }
    }

    if (quest.type === "weekly") {
      wCount = wCount + 1;
      if (wCount >= 3) {
        wStreak = wStreak + 1;
        wCount = 0;
        await pool.query(
          "INSERT IGNORE INTO user_badges (user_id, badge_key, awarded_at) VALUES (?, 'weekly_3', NOW())",
          [userId]
        );
      }
    }

    var newXp = (user.xp || 0) + addXp;
    var newCoins = (user.coins || 0) + addCoins;
    var newLevel = parseInt(newXp / 100) + 1;

    await pool.query(
      "UPDATE users SET xp=?, coins=?, level=?, general_streak=?, last_completed=?, daily_count=?, daily_streak=?, weekly_count=?, weekly_streak=? WHERE id=?",
      [newXp, newCoins, newLevel, gStreak, today, dCount, dStreak, wCount, wStreak, userId]
    );

    req.session.user.xp = newXp;
    req.session.user.coins = newCoins;
    req.session.user.level = newLevel;
    req.session.user.general_streak = gStreak;
    req.session.user.daily_streak = dStreak;
    req.session.user.weekly_streak = wStreak;

    if (quest.type === "daily") {
      await pool.query(
        "INSERT INTO quests (user_id, title, description, type, due_at, created_at) VALUES (?, ?, ?, ?, DATE_ADD(CURDATE(), INTERVAL 1 DAY), NOW())",
        [userId, quest.title, quest.description, quest.type]
      );
    } else if (quest.type === "weekly") {
      await pool.query(
        "INSERT INTO quests (user_id, title, description, type, due_at, created_at) VALUES (?, ?, ?, ?, DATE_ADD(CURDATE(), INTERVAL 7 DAY), NOW())",
        [userId, quest.title, quest.description, quest.type]
      );
    }

    res.redirect("/dashboard");
  } catch (err) {
    console.log(err);
    res.redirect("/dashboard");
  }
});

module.exports = router;
