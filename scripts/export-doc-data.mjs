import fs from 'fs'

function groupLevel(file) {
  const t = fs.readFileSync(file, 'utf8')
  const re = /"name": "([^"]+)",\s*"level": "([^"]+)"/g
  const by = {}
  let m
  while ((m = re.exec(t))) {
    ;(by[m[2]] = by[m[2]] || []).push(m[1])
  }
  return by
}

function groupRealm(file) {
  const t = fs.readFileSync(file, 'utf8')
  const re = /"name": "([^"]+)",[\s\S]*?"realm": "([^"]+)"/g
  const by = {}
  let m
  while ((m = re.exec(t))) {
    ;(by[m[2]] = by[m[2]] || []).push(m[1])
  }
  return by
}

const data = {
  ore: groupLevel('src/constants/ore-catalog.ts'),
  herb: groupLevel('src/constants/herb-catalog.ts'),
  beast: groupRealm('src/constants/beast-catalog.ts'),
  pet: groupRealm('src/constants/pet-catalog.ts')
}

fs.writeFileSync('scripts/_doc-data.json', JSON.stringify(data, null, 2), 'utf8')
console.log('wrote scripts/_doc-data.json')
