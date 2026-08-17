/** 简易按日限流（进程内内存；重启清零） */
export function createDailyLimiter(limit) {
  const max = Math.max(1, Number(limit) || 30)
  /** @type {Map<string, { day: string, count: number }>} */
  const map = new Map()

  function dayKey() {
    return new Date().toISOString().slice(0, 10)
  }

  return {
    check(id) {
      const key = String(id || 'anon')
      const day = dayKey()
      const cur = map.get(key)
      if (!cur || cur.day !== day) {
        map.set(key, { day, count: 1 })
        return { ok: true, remaining: max - 1 }
      }
      if (cur.count >= max) {
        return { ok: false, remaining: 0 }
      }
      cur.count += 1
      return { ok: true, remaining: max - cur.count }
    }
  }
}
