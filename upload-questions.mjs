import fs from 'fs'
import path from 'path'

const dataDirPath = './backend/data'
const files = fs.readdirSync(dataDirPath).filter(file => file.endsWith('.json'))

let allQuestions = []
for (const file of files) {
  const filePath = path.join(dataDirPath, file)
  const rawData = fs.readFileSync(filePath, 'utf-8')
  const questions = JSON.parse(rawData)
  if (Array.isArray(questions)) allQuestions = allQuestions.concat(questions)
  else allQuestions.push(questions)
}

fs.writeFileSync('./merged.json', JSON.stringify(allQuestions, null, 2))
console.log('✅ merged.json 생성 완료!')