import fs from 'fs'

const t = fs.readFileSync('d:/project/text-based-cultivation/src/constants/pet-catalog.ts', 'utf8')
const re = /"name": "([^"]+)",[\s\S]*?"realm": "([^"]+)"/g
let m
const by = {}
const names = []
while ((m = re.exec(t))) {
  names.push(m[1])
  ;(by[m[2]] = by[m[2]] || []).push(m[1])
}
for (const [k, v] of Object.entries(by)) {
  console.log(`${k}|${v.length}|${v.join(',')}`)
}
console.log('TOTAL', names.length)
console.log('ORDER', names.join(','))
