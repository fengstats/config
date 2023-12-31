import fs from 'fs'

const filePath = process.argv.slice(2)[0]
const data = fs.readFileSync(filePath, 'utf8')
const wordRegex = /- (.*)/g
const words = []

let match = null
while ((match = wordRegex.exec(data)) !== null) {
  words.push(match[1])
}

words.sort()
for (let word of words) {
  console.log(`- ${word}`)
}
