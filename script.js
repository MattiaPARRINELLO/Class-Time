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
        let classStartTimestamp = new Date(0, 0, 0, classStart[0], classStart[1], 0, 0);
        let currentTimestamp = new Date(0, 0, 0, currentDate.hour, currentDate.minute, 0, 0);
        if (currentTimestamp < classStartTimestamp) {
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
        let classStartTimestamp = new Date(0, 0, 0, classStart[0], classStart[1], 0, 0);
        let classEndTimestamp = new Date(0, 0, 0, classEnd[0], classEnd[1], 0, 0);
        let currentTimestamp = new Date(0, 0, 0, currentDate.hour, currentDate.minute, 0, 0);
        if (currentTimestamp >= classStartTimestamp && currentTimestamp <= classEndTimestamp) {
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

function percentageAndRemaining(classTimeFull) {
    let classTimeEnd = classTimeFull[1].split(":")
    let classTime = classTimeFull[0].split(":")
    let classStartTimestamp = new Date(0, 0, 0, classTime[0], classTime[1], 0, 0);
    let classEndTimestamp = new Date(0, 0, 0, classTimeEnd[0], classTimeEnd[1], 0, 0);
    let currentDate = getCurrentDate();
    let currentTimestamp = new Date(0, 0, 0, currentDate.hour, currentDate.minute, currentDate.second, currentDate.miliseconds);
    let percentageOfTheClass = ((currentTimestamp - classStartTimestamp) / (classEndTimestamp - classStartTimestamp)) * 100;
    let remainingTime = classEndTimestamp - currentTimestamp;
    remainingTime = new Date(remainingTime).toISOString().substr(11, 8);
    return {
        percentageOfTheClass: percentageOfTheClass,
        remainingTime: remainingTime
    }
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
            let percentAndRemaining = percentageAndRemaining(currentClassTime);
            document.getElementById("currentClass").innerHTML = currentClass;
            document.getElementById("time-remaining").innerHTML = percentAndRemaining.remainingTime;
            document.getElementById("progress-bar-inner").style.width = percentAndRemaining.percentageOfTheClass + "%";
            document.getElementById("progress-bar-inner").innerHTML = Number(percentAndRemaining.percentageOfTheClass).toFixed(3) + "%";
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









