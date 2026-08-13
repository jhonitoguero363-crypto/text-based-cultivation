import fs from 'fs'

const t = fs.readFileSync('d:/project/text-based-cultivation/src/constants/ore-catalog.ts', 'utf8')
const re = /"name": "([^"]+)",\s*"level": "([^"]+)"/g
let m
const by = {}
while ((m = re.exec(t))) {
  ;(by[m[2]] = by[m[2]] || []).push(m[1])
}
for (const [k, v] of Object.entries(by)) {
  console.log(`${k}|${v.length}|${v.join(',')}`)
}
console.log('TOTAL', Object.values(by).reduce((a, b) => a + b.length, 0))
