const progress = require("./questJest")

describe("computeLevel", () => {
  test("ska öka level var 100 xp", () => {
    expect(progress.computeLevel(100)).toBe(2)
    expect(progress.computeLevel(250)).toBe(3)
  })
})

describe("questCompletion", () => {
  var user = {
    xp: 0,
    coins: 0,
    level: 1,
    general_streak: 0,
    last_completed: null,
    daily_count: 0,
    daily_streak: 0
  }

  var today = "2025-10-15"

  test("daily quest ska ge 10 xp och 5 coins", () => {
    var res = progress.questCompletion(user, "daily", today, null)
    expect(res.xp).toBe(10)
    expect(res.coins).toBe(5)
    expect(res.level).toBe(1)
    expect(res.general_streak).toBe(1)
  })

  test("3 daily quests ger streak och nollställer count", () => {
    var user2 = {
      xp: 20,
      coins: 10,
      general_streak: 2,
      last_completed: "2025-10-14",
      daily_count: 2,
      daily_streak: 0
    }

    var res = progress.questCompletion(user2, "daily", today, "2025-10-14")
    expect(res.daily_count).toBe(0)
    expect(res.daily_streak).toBe(1)
    expect(res.general_streak).toBe(3)
  })
})
