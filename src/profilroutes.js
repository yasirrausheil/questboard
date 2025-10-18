const express = require("express");
const router = express.Router();

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/");
  }
  next();
}

router.get("/profile", requireLogin, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.session.user.id;

  try {
    const [[user]] = await pool.query(
      "SELECT username, level, xp, coins, avatar, signup_avatar, theme_bg, general_streak, daily_streak, weekly_streak FROM users WHERE id = ?",
      [userId]
    );

    const [badges] = await pool.query(
      "SELECT ub.badge_key, ub.awarded_at, b.label, b.image FROM user_badges ub JOIN badges b ON b.badge_key = ub.badge_key WHERE ub.user_id = ? ORDER BY ub.awarded_at DESC",
      [userId]
    );

    const [owned] = await pool.query(
      "SELECT s.id, s.name, s.image FROM user_items ui JOIN shop_items s ON s.id = ui.item_id WHERE ui.user_id = ? ORDER BY s.id ASC",
      [userId]
    );

    const collection = [];

    collection.push({
      id: "default_avatar",
      name: "Default Avatar",
      image: "avatars/" + user.signup_avatar,
      type: "avatar"
    });

    for (let i = 0; i < owned.length; i++) {
      const item = owned[i];
      const isAvatar = item.name.toLowerCase().includes("avatar");
      collection.push({
        id: item.id,
        name: item.name,
        image: "shop/" + item.image,
        type: isAvatar ? "avatar" : "theme"
      });
    }

    const [completed] = await pool.query(
      "SELECT title, type, completed_at FROM quests WHERE user_id = ? AND is_done = 1 ORDER BY completed_at DESC",
      [userId]
    );

    const [missed] = await pool.query(
      "SELECT title, type, due_at FROM quests WHERE user_id = ? AND is_done = 0 AND due_at < NOW() ORDER BY due_at DESC",
      [userId]
    );

    const history = [];

    for (let i = 0; i < completed.length; i++) {
      const q = completed[i];
      history.push({
        title: q.title,
        type: q.type,
        date: q.completed_at,
        status: "completed"
      });
    }

    for (let i = 0; i < missed.length; i++) {
      const q = missed[i];
      history.push({
        title: q.title,
        type: q.type,
        date: q.due_at,
        status: "missed"
      });
    }

    history.sort((a, b) => new Date(b.date) - new Date(a.date));

    let equippedAvatarId = "default_avatar";
    let equippedThemeId = null;

    if (user.avatar && user.avatar.startsWith("shop/")) {
      const [rowsA] = await pool.query(
        "SELECT id FROM shop_items WHERE CONCAT('shop/', image) = ?",
        [user.avatar]
      );
      if (rowsA.length > 0) equippedAvatarId = rowsA[0].id;
    }

    if (user.theme_bg) {
      const [rowsT] = await pool.query(
        "SELECT id FROM shop_items WHERE image = ?",
        [user.theme_bg]
      );
      if (rowsT.length > 0) equippedThemeId = rowsT[0].id;
    }

    res.render("profile", {
      user: {
        username: user.username,
        avatar: user.avatar,
        theme_bg: user.theme_bg,
        level: user.level || 1,
        xp: user.xp || 0,
        coins: user.coins || 0,
        general_streak: user.general_streak || 0,
        daily_streak: user.daily_streak || 0,
        weekly_streak: user.weekly_streak || 0,
        collection: collection
      },
      badges: badges,
      equippedAvatarId,
      equippedThemeId,
      history
    });
  } catch (error) {
    console.error(error);
    res.render("profile", {
      user: req.session.user,
      badges: [],
      equippedAvatarId: null,
      equippedThemeId: null,
      history: []
    });
  }
});

router.post("/profile/equip/:id", requireLogin, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.session.user.id;
  const itemId = req.params.id;

  try {
    if (itemId === "default_avatar") {
      const [[user]] = await pool.query("SELECT signup_avatar FROM users WHERE id = ?", [userId]);
      const baseAvatar = user ? user.signup_avatar : "avatar1.png";
      await pool.query("UPDATE users SET avatar = ? WHERE id = ?", [baseAvatar, userId]);
      req.session.user.avatar = baseAvatar;
      return res.redirect("/profile");
    }

    const [[item]] = await pool.query("SELECT * FROM shop_items WHERE id = ?", [itemId]);
    if (!item) return res.redirect("/profile");

    if (item.name.toLowerCase().includes("avatar")) {
      await pool.query("UPDATE users SET avatar = ? WHERE id = ?", ["shop/" + item.image, userId]);
      req.session.user.avatar = "shop/" + item.image;
    } else {
      await pool.query("UPDATE users SET theme_bg = ? WHERE id = ?", [item.image, userId]);
      req.session.user.theme_bg = item.image;
    }

    res.redirect("/profile");
  } catch (error) {
    console.error(error);
    res.redirect("/profile");
  }
});

module.exports = router;
