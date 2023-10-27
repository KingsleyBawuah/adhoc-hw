import {openCSVFileSystem} from "./parser.js";

const mapZipCodesToStateRateAreas = (slcspZips, zips) => {
    let zipToRateAreasMap = {}
    for (let i1 = 0; i1 < slcspZips.length; i1++){
        let inputZipRow = slcspZips[i1];
        const tempObj = {
            [inputZipRow.zipcode]: {
                state: '',
                rateAreas: []
            }
        }
        // Search the zip table for relevant locale data.
        for (let i = 0; i < zips.length; i++){
            let zipData = zips[i];
            // Ensure that we do not have duplicate rate areas in this array
            if ((zipData.zipcode === inputZipRow.zipcode)
                && !tempObj[inputZipRow.zipcode].rateAreas.includes(zipData.rate_area)) {
                tempObj[inputZipRow.zipcode].rateAreas.push(zipData.rate_area)
                tempObj[inputZipRow.zipcode].state = zipData.state
            }
        }

        zipToRateAreasMap = {
            ...zipToRateAreasMap,
            ...tempObj
        }
    }
    return zipToRateAreasMap
}

const mapZipCodesToRates = (slcspZipObject, plans, metalLevelFilter) => {
    const zipToRatesMap = {}
    for (const [zipCode, valueObj] of Object.entries(slcspZipObject)) {
        const rates = []
        if (valueObj.rateAreas.length === 1) {
            // Search the plans to find appropriate rates, while avoiding duplicate rates and non requested metal levels.
            for (let i = 0; i < plans.length; i++) {
                const plan = plans[i]
                if (plan.rate_area === valueObj.rateAreas[0]
                    && plan.metal_level === metalLevelFilter
                    && plan.state === valueObj.state && !rates.includes(plan.rate)) {
                    rates.push(plan.rate)
                }
            }
        }
        //Sort the array of rates in ascending order.
        rates.sort((val1, val2) => {
            return val1 - val2
        })
        zipToRatesMap[zipCode] = rates
    }

    return zipToRatesMap
}

const determineCosts = (slcsp, zips, plans) => {
    // Transform data into data structures more suited to answer the request.
    const zipToRateAreaMap = mapZipCodesToStateRateAreas(slcsp, zips)
    const zipToRatesMap = mapZipCodesToRates(zipToRateAreaMap, plans, 'Silver')

    // Iterate through and print lines of slcp, and based on zip sort rates for value and print out the one in pos(1)
    for (let index = 0; index < slcsp.length; index++){
        let row = slcsp[index];
        if (index === 0) {
            // Print the headers.
            const headers = Object.keys(row)
            console.log(`${headers[0]},${headers[1]}`)

        }
        const rate = (zipToRatesMap[row.zipcode][1] && zipToRatesMap[row.zipcode].length > 1) ?
            parseFloat(zipToRatesMap[row.zipcode][1]).toFixed(2)
            : ''
        console.log(`${row.zipcode},${rate}`) // Adds a newline at the end of each print statement. Can be easily removed if need be.
    }
}


const slcsp = await openCSVFileSystem('slcsp.csv')
const zips = await (openCSVFileSystem('zips.csv'))
const plans = await (openCSVFileSystem('plans.csv'))
determineCosts(slcsp, zips, plans)
