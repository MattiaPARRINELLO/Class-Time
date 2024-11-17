let data = []
readJSON().then((json) => {
    data = json;
});
async function readJSON() {
    let response = await fetch('./edt copy.json');
    let json = await response.json();
    return json;
}

function getCurrentDate() {
    let day = new Date().getDate();
    let weekday = new Date().getDay();
    let hour = new Date().getHours();
    let minute = new Date().getMinutes();
    let second = new Date().getSeconds();
    let miliseconds = new Date().getMilliseconds();
    return {
        day: day,
        weekday: weekday,
        hour: hour,
        minute: minute,
        second: second,
        miliseconds: miliseconds
    }
}


function isThereClass() {
    let currentDate = getCurrentDate();
    return !(currentDate.hour < 8 || currentDate.hour > 18 || currentDate.weekday == 6 || currentDate.weekday == 0);
}
function getWeekdayName(weekday) {
    let weekdayName = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
    return weekdayName[weekday - 1];
}

async function getNextClass() {
    let currentDate = getCurrentDate();
    let json = data

    if (!isThereClass()) {
        return {
            nextClass: false,
            nextClassTime: false
        }
    }
    let todayEdt = json[getWeekdayName(currentDate.weekday)];

    let nextClass = false;
    let nextClassTime = false;
    for (let classInfo of todayEdt) {
        let time = classInfo.time.split(" - ");
        let start = time[0].split(":");
        let end = time[1].split(":");
        if (currentDate.hour < start[0] || (currentDate.hour == start[0] && currentDate.minute < start[1])) {
            nextClass = classInfo.course;
            nextClassTime = time;
            break;
        }
    }
    return {
        nextClass: nextClass,
        nextClassTime: nextClassTime
    }
}

async function getCurrentClass() {
    let currentDate = getCurrentDate();
    let json = data

    if (!isThereClass()) {
        return {
            currentClass: false,
            currentClassTime: false
        }
    }

    let todayEdt = json[getWeekdayName(currentDate.weekday)];
    let currentClass = false;
    let currentClassTime = false;
    let remainingTime = false;
    for (let classInfo of todayEdt) {
        let time = classInfo.time.split(" - ");
        let start = time[0].split(":");
        let end = time[1].split(":");
        if ((start[0] == currentDate.hour && start[1] <= currentDate.minute) || (start[0] < currentDate.hour && currentDate.hour < end[0]) || (currentDate.hour == end[0] && currentDate.minute < end[1])) {
            currentClass = classInfo.course;
            currentClassTime = time;
            break;
        }
    }
    return {
        currentClass: currentClass,
        currentClassTime: currentClassTime,
    }
}

function getRemainingTime(classTime) {
    let currentDate = getCurrentDate();
    let classTimeArray = classTime.split(":");
    let classHour = parseInt(classTimeArray[0]);
    let classMinute = parseInt(classTimeArray[1]);
    let remainingHour = classHour - currentDate.hour;
    let remainingMinute = classMinute - currentDate.minute;
    let remainingSecond = 60 - currentDate.second;
    let remainingMiliseconds = 1000 - currentDate.miliseconds;
    let remainingTime = (remainingHour * 3600000) + (remainingMinute * 60000) + (remainingSecond * 1000) + remainingMiliseconds;
    // calculate remaining time in miliseconds
    return remainingTime;
}

function percentageOfTheClassCalculator(classTimeFull) {
    let classTimeEnd = classTimeFull[1].split(":")
    let classTime = classTimeFull[0].split(":")
    let classHour = classTime[0]
    let classMinute = classTime[1]
    let currentTimeVar = getCurrentDate()
    let currentHour = currentTimeVar.hour
    let currentMinute = currentTimeVar.minute
    let currentSecond = currentTimeVar.second
    let currentMilisecond = currentTimeVar.miliseconds
    let elapsedHour = currentHour - classHour
    let elapsedMinute = currentMinute - classMinute;
    let elapsedTime = (elapsedHour * 3600) + (elapsedMinute * 60) + currentSecond + (currentMilisecond / 1000);

    let classEndHour = parseInt(classTimeEnd[0]);
    let classEndMinute = parseInt(classTimeEnd[1]);
    let classDurationHour = classEndHour - classHour;
    let classDurationMinute = classEndMinute - classMinute;
    let classDuration = (classDurationHour * 3600) + (classDurationMinute * 60);

    let percentageElapsed = (elapsedTime / classDuration) * 100;
    return percentageElapsed;
}

async function display() {
    getNextClass().then((nextClassInfo) => {
        getCurrentClass().then((currentClassInfo) => {
            if (currentClassInfo.currentClass == false && nextClassInfo.nextClass == false) {
                document.getElementById("currentClass").innerHTML = "LIBERTÉ 🎉";
                document.getElementById("time-remaining").innerHTML = "LIBERTÉ 🎉";
                document.getElementById("progress-bar-inner").style.width = "100%";
                document.getElementById("progress-bar-inner").innerHTML = "100%";
                document.getElementById("event").innerHTML = "LIBERTÉ 🎉";
                return;
            }
            let nextClass = nextClassInfo.nextClass;
            let nextClassTime = nextClassInfo.nextClassTime;
            let currentClass = currentClassInfo.currentClass;
            let currentClassTime = currentClassInfo.currentClassTime;
            let remainingTime = getRemainingTime(currentClassTime[1]);
            let remainingTimeFormatted = new Date(remainingTime).toISOString().substr(11, 8);
            let percentageOfTheClass = percentageOfTheClassCalculator(currentClassInfo.currentClassTime)
            document.getElementById("currentClass").innerHTML = currentClass;
            document.getElementById("time-remaining").innerHTML = remainingTimeFormatted;
            document.getElementById("progress-bar-inner").style.width = percentageOfTheClass + "%";
            document.getElementById("progress-bar-inner").innerHTML = Number(percentageOfTheClass).toFixed(3) + "%";
            if (nextClass == false) {
                document.getElementById("event").innerHTML = "LIBERTÉ 🎉";
                return;
            }
            document.getElementById("event").innerHTML = nextClass + " de " + nextClassTime[0] + " à " + nextClassTime[1];
        });
    });
}
// display();



setInterval(() => {
    display();
}, 30);









