import fs from 'fs'

/**
 * @param {string} filePath File name
 * @returns {Promise<Array<string>>}
 */
export function readFromFile(filePath, property) {
  try {
    const data = fs.readFileSync(filePath);
    if (property) return JSON.parse(data)?.[property]
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

/**
 * @param {string} filePath File name
 */
export function writeToFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}
