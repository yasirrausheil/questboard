/* eslint-disable no-unused-vars */

function initXpBar(xp) {
  var levelXp = 100;
  var currentLevel = 1;


  if (xp >= 100) {
    currentLevel = parseInt(xp / levelXp) + 1;
  }

  var progress = (xp % levelXp) / levelXp * 100;

  var el = document.getElementById("xpFill");
  if (!el) return;

  el.style.width = progress + "%";
  el.title = "Level " + currentLevel;
}
