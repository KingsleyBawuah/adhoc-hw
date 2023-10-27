import * as readline from 'readline'
import * as fs from "fs";
import path from 'path';
import {fileURLToPath} from 'url';

export const readFileToArr = async (fileStream) => {
    // This function will read each line of the csv file and insert it into an array to be returned.
    // Avoids reading the entire file into memory at once.
    return new Promise(((resolve, reject) => {
            // Read file line by line.
            const lines = []
            return readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity
            }).on('line', (line) => {
                lines.push(line)
            }).on('close', () => {
                resolve(lines)
            }).on('error', reject)
        }

    ))
}

// Convert and store file as 2D array containing csv contents.
export const mapCSVRowsToObjects = (csvArr) => {
    // This function should then map through each line of the string and do the split before then continuing onwards.
    const csvArrSplit = csvArr.map(line => line.split(','))
    const outputArr = []
    const headers = csvArrSplit[0]?.map(header => header.replace(/\s+/g, ''))

    for (let i = 0; i < csvArrSplit.length; i++){
        let row = csvArrSplit[i];
        // Skip the headers row, it's not real data
        let rowObj = {}
        if (i !== 0 && row.length === headers.length) {
            row.forEach((value, index) => {
                rowObj = {...rowObj, [headers[index]]: value}
            })
            outputArr.push(rowObj)
        }
    }
    return outputArr
}

export const openCSVFileSystem = async (filePath) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const filestream = fs.createReadStream(path.join(__dirname, filePath))
    const dataLines = await readFileToArr(filestream)

    return mapCSVRowsToObjects(dataLines)
}




