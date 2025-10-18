function computeLevel(xp) {
  var level = 1
  var levelXp = 100

  if (xp >= levelXp) {
    level = parseInt(xp / levelXp) + 1
  }

  return level
}

function questCompletion(user, questType, todayStr, lastCompletedStr) {
  var addXp = 0
  var addCoins = 0

  if (questType === "daily") {
    addXp = 10
    addCoins = 5
  } else if (questType === "once") {
    addXp = 15
    addCoins = 10
  } else if (questType === "weekly") {
    addXp = 50
    addCoins = 20
  }

  var newXp = (user.xp || 0) + addXp
  var newCoins = (user.coins || 0) + addCoins
  var newLevel = computeLevel(newXp)

  var generalStreak = user.general_streak || 0

  var date = new Date(todayStr)
  date.setDate(date.getDate() - 1)
  var yesterday = date.toISOString().split("T")[0]

  if (!lastCompletedStr) {
    generalStreak = 1
  } else if (lastCompletedStr === yesterday) {
    generalStreak = generalStreak + 1
  } else if (lastCompletedStr !== todayStr) {
    generalStreak = 1
  }

  var dailyCount = user.daily_count || 0
  var dailyStreak = user.daily_streak || 0

  if (questType === "daily") {
    dailyCount = dailyCount + 1
    if (dailyCount >= 3) {
      dailyStreak = dailyStreak + 1
      dailyCount = 0
    }
  }

  return {
    xp: newXp,
    coins: newCoins,
    level: newLevel,
    general_streak: generalStreak,
    last_completed: todayStr,
    daily_count: dailyCount,
    daily_streak: dailyStreak
  }
}

module.exports = {
  computeLevel,
  questCompletion
}
