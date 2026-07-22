/* Register Service Worker for PWA */

const registerServiceWorker = async () => {
    if ("serviceWorker" in navigator) {
        try {
        const registration = await navigator.serviceWorker.register("./worker.js", {
            scope: "/treadmill-tracker/",
        })
        if (registration.installing) {
            console.log("Service worker installing")
        } else if (registration.waiting) {
            console.log("Service worker installed")
        } else if (registration.active) {
            console.log("Service worker active")
        }
        } catch (error) {
        console.error(`Registration failed with ${error}`)
        }
    }
}
      
registerServiceWorker()

/* Application Code */

function printTime () {
    return (new Date).toLocaleString()
}

/**
 * Save the currently displayed Statistics to history
 * @returns {Promise<void>}
 */
async function saveCurrentStats () {
    let dateElement = document.getElementById("date")
    if (!dateElement) return
    let runTime = document.getElementById("time")
    if (!runTime) return
    let distance = document.getElementById("distance")
    if (!distance) return
    let runNumber = document.getElementById("runNumber")
    if (!runNumber) return


    /**
     * @type {RunData}
     */
    let dataObject = {
        date: new Date(dateElement.innerText),
        distance: parseFloat(distance.innerText),
        run_time: runTime.innerText,
        run_number: runNumber.innerText
    }

    let stats_raw = localStorage.getItem('statistics')

    /**
     * @type {{runs: RunData[]}}
     */
    let stats = {
            runs: []
        }

    if (!stats_raw) {
        stats = {
            runs: []
        }
    } else {
        try {
            stats = JSON.parse(stats_raw)
        } catch (err) {
            console.log('Caught error', err)
        }
    }

    stats.runs.push(dataObject)

    await rotateData(stats)

    localStorage.setItem('statistics', JSON.stringify(stats))
}

/**
 * Check if we have 30 days worth and if so drop anything that is over
 * @argument {{runs: RunData[]}} runData
 * @returns {Promise<void>}
 */
async function rotateData (runData) {
    if (runData.runs.length > 30) {
        runData.runs.shift()
        return
    } else {
        return
    }
}

/**
 * Sets the value of the Status field in UI
 * @param {string} status 
 * @returns 
 */
function setConnectionStatus (status) {
    let statusIcon = document.getElementById('bluetooth_icon')
    if (!statusIcon) return
    if (status == 'Connected') {
        statusIcon.setAttribute("class", "small_icon active")
    } else if (status = 'Disconnected') {
        statusIcon.setAttribute("class", "small_icon")
    }
}

/**
 * 
 * @param {Date} date 
 * @returns 
 */
function setDate (date) {
    let dateSpan = document.getElementById('date')
    if (!dateSpan) return
    dateSpan.innerText = date.toLocaleString()
}

/**
 * Sets displayed current speed in UI.
 * @param {number} speedInMeterph 
 * @returns 
 */
function setWalkSpeed (speedInMeterph) {
    let speedSpan = document.getElementById('current_speed')
    if (!speedSpan) return
    speedSpan.innerText = `${Math.floor( (speedInMeterph * 0.621371) / 10 ) / 100 }`
}

/**
 * Sets displayed target speed in UI.
 * @param {number} speedInMeterph 
 * @returns 
 */
function setTargetSpeed (speedInMeterph) {
    let speedSpan = document.getElementById('target_speed')
    if (!speedSpan) return
    speedSpan.innerText = `${ Math.floor( (speedInMeterph * 0.621371) / 10 ) / 100 }`
}

/**
 * 
 * @param {number} distanceInMeters 
 * @returns 
 */
function setDistance (distanceInMeters) {
    let distanceSpan = document.getElementById('distance')
    if (!distanceSpan) return
    distanceSpan.innerText = `${Math.floor( (distanceInMeters * 0.621371) / 10 ) / 100 }`
}

/**
 * 
 * @param {number} calories 
 * @returns 
 */
function setCalories (calories) {
    let caloriesSpan = document.getElementById('calories')
    if (!caloriesSpan) return
    caloriesSpan.innerText = `${calories}`
}

/**
 * Return a HH:MM:SS.SSS string from a ms time number
 * @param {number} msTime 
 * @returns {string}
 */
function formatTimeFromMs (msTime) {
    let hours = `${Math.floor(msTime / 1000 / 60 / 60)}`
    if (hours.length == 1) {
        hours = `0${hours}`
    }
    let minutes = `${Math.floor(msTime / 1000 /60 % 60)}`
    if (minutes.length == 1) {
        minutes = `0${minutes}`
    }
    let seconds = `${Math.floor(msTime / 1000 % 60)}`
    if (seconds.length == 1) {
        seconds = `0${seconds}`
    }
    let ms = `${Math.floor(msTime % 1000)}`
    if (ms.length == 1) {
        ms = `.00${ms}`
    } else if (ms.length == 2) {
        ms = `.0${ms}`
    } else if (ms.length == 3) {
        ms = `.${ms}`
    }
    
    if (Math.floor(msTime % 1000) < 1) {
        ms = ''
    }

    return `${hours}:${minutes}:${seconds}${ms}`
}

/**
 * 
 * @param {number} walkTimeinMilliseconds 
 * @returns 
 */
function setTimeWalked (walkTimeinMilliseconds) {
    
    let timeWalked = document.getElementById('time')
    if (!timeWalked) return
    timeWalked.innerText = formatTimeFromMs(walkTimeinMilliseconds)
}

/**
 * Set teh Run Number in UI
 * @param {number} runNumber 
 * @returns 
 */
function setRunNumber (runNumber) {
    let runNumberSpan = document.getElementById('runNumber')
    if (!runNumberSpan) return
    runNumberSpan.innerText = `${runNumber}`
}

async function setPastOverview () {
    let stats_raw = localStorage.getItem('statistics')
    /**
     * @type {{runs: RunData[]}}
     */
    let stats = {
        runs: []
    }

    let empty = "#1F150C"
    let success = "#90B800"

    if (!stats_raw) {
        let monthSvgs = document.querySelectorAll(".month-item-svg")
        for (let i = 0; i < monthSvgs.length; i++) {
            monthSvgs[i].setAttribute('fill', empty)
        }
    } else {
        try {
            stats = JSON.parse(stats_raw)
        } catch (err) {
            console.log('Caught parsing error', err)
        }
        if (stats.runs.length > 0) {
            for (let i = 0; i < stats.runs.length; i++) {
                let svg = document.getElementById(`${i+1}`)
                if (stats.runs[i].distance > 2.0) {
                    svg?.setAttribute('fill', success)
                }
            }
        }
    }
}

/** TYPE DEFINITIONS */

/**
 * @typedef {{connected: boolean, device:object, connect:function, disconnect:function, getPrimaryService: Function, getPrimaryServices: function}} BluetoothRemoteGATTServer
 */

/**
 * @typedef {{date: Date, distance: number, run_time: string, run_number: string}} RunData
 */

/** Treadmill Global Object */

/**
 * @property {string} treadmillStatus
 * @property {BluetoothremoteGATTServer} treadmillGATT
 */
const treadmill = {
    treadmillStatus: 'Disconnected',
    /**
     * @type {BluetoothRemoteGATTServer}
     */
    treadmillGATT: {connected: false, device:{}, connect:()=>{}, disconnect:()=>{}, getPrimaryService: ()=>{}, getPrimaryServices: ()=>{}},
    /**
     * add a new connection
     * @param {BluetoothRemoteGATTServer} connection 
     */
    addConnection: function (connection) {
        this.treadmillGATT = connection
        this.treadmillStatus = 'Connected'
        setConnectionStatus('Connected')
    },
    /**
     * disconnects the connection
     */
    disconnectConnection: async function () {
        await this.treadmillGATT.disconnect()

        this.treadmillStatus = 'Disconnected'
        setConnectionStatus('Disconnected')
        console.log(printTime(), 'Disconnected from Device GATT')
        saveCurrentStats()
    }
}

async function establishBluetoothConnection () {
    // @ts-ignore
    let available = await navigator.bluetooth.getAvailability()
    console.log(printTime(), `Bluetooth is available: ${available}`)
    if (available) {
        /**
         * @type {{forget: function, gatt: BluetoothRemoteGATTServer}}
         */
        let device = {
            forget : ()=>{},
            gatt: {connected: false, device:{}, connect:()=>{}, disconnect:()=>{}, getPrimaryService: ()=>{}, getPrimaryServices: ()=>{}}
        }
        try {
            // @ts-ignore
            device = await navigator.bluetooth.requestDevice({
                filters:[
                    {namePrefix: 'Pit'}
                ],
                optionalServices: [
                    "00001910-0000-1000-8000-00805f9b34fb",
                    "00001800-0000-1000-8000-00805f9b34fb",
                    "00001801-0000-1000-8000-00805f9b34fb",
                    "0000fba0-0000-1000-8000-00805f9b34fb"
                ]
            })
            console.log(printTime(), 'Got device: ', device)

            let treadmill_gatt = await device.gatt.connect()
            treadmill.addConnection(treadmill_gatt)
            console.log(printTime(), 'Connected to GATT', treadmill.treadmillGATT)

            let statusService = await treadmill.treadmillGATT.getPrimaryService("0000fba0-0000-1000-8000-00805f9b34fb")
            console.log(printTime(), 'Got Service', statusService)

            let characteristics = await statusService.getCharacteristics()
            console.log(printTime(), 'Got Characteristics', characteristics)

            let unknownChara = await statusService.getCharacteristic("0000fba1-0000-1000-8000-00805f9b34fb")
            console.log('Unknown Characteristic', unknownChara.uuid, unknownChara)

            let currentStatus = await statusService.getCharacteristic("0000fba2-0000-1000-8000-00805f9b34fb")

            if (currentStatus.properties.notify) {

                /**
                 * 
                 * @param {{target: {value: DataView}}} ev 
                 */
                currentStatus.oncharacteristicvaluechanged = (ev) => {
                    /**
                     * @type {DataView}
                     */
                    let data = ev.target.value

                    let date = new Date()
                    setDate(date)
                    /* Current Speed comes back as 1000 times kph (float to digit) */
                    let currentSpeed = data.getUint16(3)
                    setWalkSpeed(currentSpeed)
                    let targetSpeed = data.getUint16(5)
                    setTargetSpeed(targetSpeed)
                    let distance = data.getUint32(7)
                    setDistance(distance)
                    let calories = data.getUint16(18)
                    setCalories(calories)
                    let walkTime = data.getUint32(20)
                    setTimeWalked(walkTime)
                    let runNumber = data.getUint8(24)
                    setRunNumber(runNumber)
                }

                currentStatus.startNotifications()
            }
            
        } catch (error) {
            console.log(printTime(), 'get device err: ', error)
        }
    }
}

async function disconnectBluetoothConnection () {
    if (treadmill.treadmillStatus !== 'Disconnected') {
        await treadmill.disconnectConnection()
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log(printTime(), ' DOM loaded, starting script.')
    const connectButton = document.getElementById('connect')
    const disconnectButton = document.getElementById('disconnect')

    connectButton?.addEventListener('click', establishBluetoothConnection)
    disconnectButton?.addEventListener('click', disconnectBluetoothConnection)

    setPastOverview()
});