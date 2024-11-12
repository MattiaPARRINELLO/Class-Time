function getCurrentDate() {
    let day = new Date().getDate();
    let weekday = new Date().getDay();
    let hour = new Date().getHours();
    let minute = new Date().getMinutes();
    let second = new Date().getSeconds();
    // return {
    //     day: 22,
    //     weekday: 5,
    //     hour: 11,
    //     minute: 0,
    //     second: 0
    // }
    return {
        day: day,
        weekday: weekday,
        hour: hour,
        minute: minute,
        second: second
    }
}

async function readJSON() {
    let response = await fetch('./edt.json');
    let json = await response.json();
    return json;
}
function isThereClass() {
    let currentDate = getCurrentDate();
    return !(currentDate.hour < 8 || currentDate.hour > 18 || currentDate.weekday == 6 || currentDate.weekday == 7);
}

function getWeekdayName(weekday) {
    let weekdayName = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
    console.log("test");
    return weekdayName[weekday - 1];
}
async function getNextClass() {
    let currentDate = getCurrentDate();
    let json = await readJSON();

    if (!isThereClass()) {
        return {
            nextClass: false,
            nextClassTime: false
        }
    }

    let todayEdt = json[getWeekdayName(currentDate.weekday)];
    // todayEdt:
    // {
    //     "8:30 - 10:20": "Histoire-géographie - PRUNIER",
    //     "10:20 - 10:40": "Pause",
    //     "10:40 - 12:30": "Mathématiques - MIGOT",
    //     "12:30 - 13:30": "Pause déjeuner",
    //     "13:30 - 14:25": "Espagnol LV2 - BARREIRO"
    // }

    let nextClass = "";
    let nextClassTime = "";
    let nextClassFound = false;
    for (let time in todayEdt) {
        let timeSplit = time.split(" - ");
        let hour = parseInt(timeSplit[0].split(":")[0]);
        let minute = parseInt(timeSplit[0].split(":")[1]);
        let second = currentDate.second;
        if (hour > currentDate.hour || (hour == currentDate.hour && minute > currentDate.minute) || (hour == currentDate.hour && minute == currentDate.minute && second > currentDate.second)) {
            nextClass = todayEdt[time];
            nextClassTime = time;
            nextClassFound = true;
            break;
        }
    }
    if (nextClassFound) {
        return {
            nextClass: nextClass,
            nextClassTime: nextClassTime
        }
    }
    else {
        return {
            nextClass: false,
            nextClassTime: false
        }
    }
}


async function getCurrentClass() {
    let currentDate = getCurrentDate();
    let json = await readJSON();

    if (!isThereClass()) {
        return {
            currentClass: false,
            currentClassTime: false,
            currentClassProgression: false,
            remainingTime: false,
        }
    }

    let todayEdt = json[getWeekdayName(currentDate.weekday)];
    // todayEdt:
    // {
    //     "8:30 - 10:20": "Histoire-géographie - PRUNIER",
    //     "10:20 - 10:40": "Pause",
    //     "10:40 - 12:30": "Mathématiques - MIGOT",
    //     "12:30 - 13:30": "Pause déjeuner",
    //     "13:30 - 14:25": "Espagnol LV2 - BARREIRO"
    // }

    let currentClass = "";
    let currentClassTime = "";
    let currentClassFound = false;
    let currentClassProgression = 0;
    let remainingTime = 0;
    for (let time in todayEdt) {
        let timeSplit = time.split(" - ");
        let hourMin = parseInt(timeSplit[0].split(":")[0]);
        let minuteMin = parseInt(timeSplit[0].split(":")[1]);
        let hourMax = parseInt(timeSplit[1].split(":")[0]);
        let minuteMax = parseInt(timeSplit[1].split(":")[1]);
        let second = currentDate.second;
        if (hourMin < currentDate.hour && currentDate.hour < hourMax && ((minuteMin < currentDate.minute && currentDate.minute < minuteMax) || (currentDate.hour != hourMin && currentDate.hour != hourMax)) && second >= currentDate.second) {
            currentClass = todayEdt[time];
            currentClassTime = time;
            currentClassFound = true;
            currentClassProgression = ((currentDate.hour - hourMin) * 60 + (currentDate.minute - minuteMin)) / ((hourMax - hourMin) * 60 + (minuteMax - minuteMin)) * 100;
            remainingTime = (hourMax - currentDate.hour) + ":" + (minuteMax - currentDate.minute) + ":" + (60 - currentDate.second);
            break;
        }
    }

    if (currentClassFound) {
        return {
            currentClass: currentClass,
            currentClassTime: currentClassTime,
            currentClassProgression: currentClassProgression,
            remainingTime: remainingTime
        }
    }
    else {
        return {
            currentClass: false,
            currentClassTime: false,
            currentClassProgression: false,
            remainingTime: false,
        }
    }

}


function display() {
    getCurrentClass().then((currentClass) => {
        getNextClass().then((nextClass) => {
            console.log(currentClass);
            console.log(nextClass);
            if (!currentClass.currentClass) {
                currentClass.currentClass = "Pas de cours en ce moment";
                currentClass.remainingTime = "00:00:00";
                currentClass.currentClassProgression = 100;
            }

            if (!nextClass.nextClass) {
                nextClass = {
                    nextClass: "Pas de prochain cours",
                    nextClassTime: ""
                };
            }
            document.getElementById("currentClass").innerHTML = currentClass.currentClass;
            document.getElementById("time-remaining").innerHTML = currentClass.remainingTime || "00:00:00";
            document.getElementById("event").innerHTML = nextClass.nextClass;
            document.getElementById("progress-bar-inner").style.width = currentClass.currentClassProgression + "%";
            document.getElementById("progress-bar-inner").innerHTML = Number((currentClass.currentClassProgression).toFixed(3)) + "%";
        })
    })

}

setInterval(display, 30);









