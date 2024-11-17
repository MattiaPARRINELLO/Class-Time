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
    return {
        weekday: new Date().getDay(),
        hour: new Date().getHours(),
        minute: new Date().getMinutes(),
        second: new Date().getSeconds(),
        miliseconds: new Date().getMilliseconds()
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
        let classTime = classInfo.time.split(" - ");
        let classStart = classTime[0].split(":");
        if (currentDate.hour < classStart[0] || (currentDate.hour == classStart[0] && currentDate.minute < classStart[1])) {
            nextClass = classInfo.course;
            nextClassTime = classTime;
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
    for (let classInfo of todayEdt) {
        let classTime = classInfo.time.split(" - ");
        let classStart = classTime[0].split(":");
        let classEnd = classTime[1].split(":");
        if ((classStart[0] == currentDate.hour && classStart[1] <= currentDate.minute) || (classStart[0] < currentDate.hour && currentDate.hour < classEnd[0]) || (currentDate.hour == classEnd[0] && currentDate.minute < classEnd[1])) {
            currentClass = classInfo.course;
            currentClassTime = classTime;
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
    let classStartHour = classTime[0]
    let classStartMinute = classTime[1]
    let currentTime = getCurrentDate()
    let elapsedTime = ((currentTime.hour - classStartHour) * 3600) + ((currentTime.minute - classStartMinute) * 60) + currentTime.second * 1000 + currentTime.miliseconds

    let classEndHour = parseInt(classTimeEnd[0]);
    let classEndMinute = parseInt(classTimeEnd[1]);
    let classDuration = ((classEndHour - classStartHour) * 3600) + (classEndMinute - classStartMinute * 60);

    return (elapsedTime / classDuration) * 100;
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









