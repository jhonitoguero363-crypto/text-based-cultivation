import fs from 'fs'
const herb = fs.readFileSync('src/constants/herb-catalog.ts', 'utf8')
const pill = fs.readFileSync('src/constants/pill-catalog.ts', 'utf8')
const recipes = [...herb.matchAll(/"pillName": "([^"]+)"/g)].map((m) => m[1])
const pills = [...pill.matchAll(/name: '([^']+)'/g)].map((m) => m[1])
const missing = pills.filter((p) => !recipes.includes(p))
console.log('recipes', recipes.length, 'pills', pills.length)
console.log('no recipe:', missing.join(', '))
