const express = require("express");
const router = express.Router();

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/");
  }
  next();
}

async function equipItem(pool, userId, item) {
  const name = (item.name || "").toLowerCase();

  if (name.includes("avatar")) {
    const newAvatar = "shop/" + item.image;
    await pool.query("UPDATE users SET avatar = ? WHERE id = ?", [newAvatar, userId]);
    return { field: "avatar", value: newAvatar };
  }

  if (name.includes("background")) {
    await pool.query("UPDATE users SET theme_bg = ? WHERE id = ?", [item.image, userId]);
    return { field: "theme_bg", value: item.image };
  }

  return null;
}

router.get("/shop", requireLogin, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.session.user.id;

  try {
    const [items] = await pool.query("SELECT * FROM shop_items");
    const [[user]] = await pool.query("SELECT avatar, theme_bg, coins FROM users WHERE id = ?", [userId]);
    const [owned] = await pool.query("SELECT item_id FROM user_items WHERE user_id = ?", [userId]);

    const ownedIds = owned.map(r => r.item_id);
    req.session.user.coins = user.coins;
    req.session.user.avatar = user.avatar;
    req.session.user.theme_bg = user.theme_bg;

    res.render("shop", {
      user: req.session.user,
      error: null,
      msg: null,
      items,
      ownedIds
    });
  } catch (err) {
    console.log(err);
    res.render("shop", {
      user: req.session.user,
      error: "Could not load shop",
      msg: null,
      items: [],
      ownedIds: []
    });
  }
});

router.post("/shop/buy/:itemId", requireLogin, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.session.user.id;
  const itemId = parseInt(req.params.itemId);

  try {
    if (!itemId) return res.redirect("/shop");

    const [[item]] = await pool.query("SELECT * FROM shop_items WHERE id = ?", [itemId]);
    if (!item) return res.redirect("/shop");

    const [[user]] = await pool.query("SELECT coins FROM users WHERE id = ?", [userId]);
    if (user.coins < item.price) {
      const [items] = await pool.query("SELECT * FROM shop_items");
      const [owned] = await pool.query("SELECT item_id FROM user_items WHERE user_id = ?", [userId]);
      const ownedIds = owned.map(r => r.item_id);

      return res.render("shop", {
        user: req.session.user,
        error: "Not enough money!",
        msg: null,
        items,
        ownedIds
      });
    }

    const [exists] = await pool.query("SELECT 1 FROM user_items WHERE user_id = ? AND item_id = ?", [userId, itemId]);
    if (exists.length > 0) return res.redirect("/shop");

    await pool.query("UPDATE users SET coins = coins - ? WHERE id = ?", [item.price, userId]);
    await pool.query("INSERT INTO user_items (user_id, item_id) VALUES (?, ?)", [userId, itemId]);

    req.session.user.coins = req.session.user.coins - item.price;
    res.redirect("/shop");
  } catch (err) {
    console.log(err);
    res.redirect("/shop");
  }
});

router.post("/shop/equip/:itemId", requireLogin, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.session.user.id;
  const itemId = parseInt(req.params.itemId);

  try {
    const [[item]] = await pool.query("SELECT * FROM shop_items WHERE id = ?", [itemId]);
    if (!item) return res.redirect("/shop");

    const [owns] = await pool.query("SELECT 1 FROM user_items WHERE user_id = ? AND item_id = ?", [userId, itemId]);
    if (owns.length === 0) return res.redirect("/shop");

    const updated = await equipItem(pool, userId, item);
    if (updated) req.session.user[updated.field] = updated.value;

    res.redirect("/shop");
  } catch (err) {
    console.log(err);
    res.redirect("/shop");
  }
});

router.post("/profile/equip/:itemId", requireLogin, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.session.user.id;
  const itemId = parseInt(req.params.itemId);

  try {
    const [[item]] = await pool.query("SELECT * FROM shop_items WHERE id = ?", [itemId]);
    if (!item) return res.redirect("/profile");

    const [owns] = await pool.query("SELECT 1 FROM user_items WHERE user_id = ? AND item_id = ?", [userId, itemId]);
    if (owns.length === 0) return res.redirect("/profile");

    const updated = await equipItem(pool, userId, item);
    if (updated) req.session.user[updated.field] = updated.value;

    res.redirect("/profile");
  } catch (err) {
    console.log(err);
    res.redirect("/profile");
  }
});

router.post("/profile/equip/default-avatar", requireLogin, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.session.user.id;

  try {
    await pool.query("UPDATE users SET avatar = ? WHERE id = ?", ["avatar1.png", userId]);
    req.session.user.avatar = "avatar1.png";
    res.redirect("/profile");
  } catch (err) {
    console.log(err);
    res.redirect("/profile");
  }
});

router.post("/profile/equip/default-bg", requireLogin, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.session.user.id;

  try {
    await pool.query("UPDATE users SET theme_bg = NULL WHERE id = ?", [userId]);
    req.session.user.theme_bg = null;
    res.redirect("/profile");
  } catch (err) {
    console.log(err);
    res.redirect("/profile");
  }
});

module.exports = router;
