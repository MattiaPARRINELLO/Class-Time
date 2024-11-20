import json
import datetime
from art import *
import time

debug = False
runLoop = True


edt ={}
with open('edt copy.json', 'r') as f:
    edt = json.load(f)




def getCurrentDate():
    now = datetime.datetime.now()
    if debug:
        return {
            'weekday': 0,
            'hour': 15,
            'minute': 20,
            'second': now.second,
            'millisecond': now.microsecond
        }
    
    return {
        'weekday': now.weekday(),
        'hour': now.hour,
        'minute': now.minute,
        'second': now.second,
        'millisecond': now.microsecond
    }

def isThereClass() :
    currentDate = getCurrentDate()
    return not (currentDate['hour'] < 8 or currentDate['hour'] > 18 or currentDate['weekday'] == 5 or currentDate['weekday'] == 6)

def getWeekDayName(weekday):
    return {
        0: 'lundi',
        1: 'mardi',
        2: 'mercredi',
        3: 'jeudi',
        4: 'vendredi',
        5: 'samedi',
        6: 'dimanche'
    }[weekday]

def getNextClass():
    currentDate = getCurrentDate()
    json = edt
    if (not isThereClass()):
        return {
            'nextClass': False,
            'nextClassTime': False
        }
    todayEdt = json[getWeekDayName(currentDate['weekday'])]

    nextClass = False
    nextClassTime = False
    for classInfo in todayEdt:
        classTime = classInfo['time'].split(' - ')
        classStartTimestamp = datetime.datetime.strptime(classTime[0], "%H:%M")
        classStartTimestamp -= datetime.timedelta(minutes=2)
        currentTimeTimestamp = datetime.datetime.strptime((str(currentDate['hour']) + ":" + str(currentDate['minute'])),"%H:%M")
        if currentTimeTimestamp < classStartTimestamp:
            nextClass = classInfo['course']
            nextClassTime = classTime
            break
    return {
        'nextClass': nextClass,
        'nextClassTime': nextClassTime
    }

def getCurrentClass():
    currentDate = getCurrentDate()
    json = edt
    if (not isThereClass()):
        return {
            'currentClass': False,
            'currentClassTime': False
        }
    
    todayEdt = json[getWeekDayName(currentDate['weekday'])]
    
    getCurrentClass = False
    getCurrentClassTime = False

    for classInfo in todayEdt:
        classTime = classInfo['time'].split(' - ')
        classStartTimestamp = datetime.datetime.strptime(classTime[0], "%H:%M")
        classStartTimestamp -= datetime.timedelta(minutes=2)
        classEndTimestamp = datetime.datetime.strptime(classTime[1], "%H:%M")
        classEndTimestamp -= datetime.timedelta(minutes=2)
        currentTimeTimestamp = datetime.datetime.strptime((str(currentDate['hour']) + ":" + str(currentDate['minute'])),"%H:%M")
        if classStartTimestamp <= currentTimeTimestamp and currentTimeTimestamp < classEndTimestamp:
            getCurrentClass = classInfo['course']
            getCurrentClassTime = classTime
            break
    return {
        'currentClass': getCurrentClass,
        'currentClassTime': getCurrentClassTime
    }

def percentageAndRemainingTime(classTimeFull):
    classTimeEnd = classTimeFull[1].split(':')
    classTime = classTimeFull[0].split(':')
    classStartHour = int(classTime[0])
    classStartMinute = int(classTime[1])
    classEndMinute = int(classTimeEnd[1])
    classEndHour = int(classTimeEnd[0])
    classStartTimeStamp = datetime.datetime.strptime((str(classStartHour) + ":" + str(classStartMinute-2)), "%H:%M")
    classEndTimeStamp = datetime.datetime.strptime((str(classEndHour) + ":" + str(classEndMinute-2)), "%H:%M")
    currentTime = getCurrentDate()
    currentTimeFormat = datetime.datetime.strptime((str(currentTime['hour']) + ":" + str(currentTime['minute']) + ":" + str(currentTime['second']) + "." + str(currentTime['millisecond'])), "%H:%M:%S.%f")
    elapsedTime = currentTimeFormat - classStartTimeStamp
    classDuration = classEndTimeStamp - classStartTimeStamp
    remainingTime = classDuration - elapsedTime
    remaining_seconds = remainingTime.total_seconds()
    hours, remainder = divmod(remaining_seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    formatted_remaining_time = f"{int(hours):02}:{int(minutes):02}:{int(seconds):02}"
    return {
        'percentage': (elapsedTime / classDuration) * 100,
        'remainingTime': formatted_remaining_time
    }

def clearScreen():
    print("\033[H\033[J")

def progress(percent=0, width=30):
    percent = int(round(percent))

    left = width * percent // 100
    right = width - left

    
    tags = '#' * left 
    spaces = ' ' * right
    percents = f"{percent:.0f}%"

    print("\r[", tags, spaces, "]", percents, end='', sep='', flush=True)

def displayAll():
    clearScreen()
    nextClassInfo = getNextClass()
    currentClassInfo = getCurrentClass()
    tprint("Info Cours")
    if currentClassInfo['currentClass'] == False:
        print('Pas de cours pour le moment')
        return
    print('Actuellement en cours de : ' + str(currentClassInfo['currentClass']))
    # format remaining time hh:mm:ss
    percentageAndTime = percentageAndRemainingTime(currentClassInfo['currentClassTime'])
    print('Temps restant : ' + percentageAndTime['remainingTime'])
    print('Pourcentage du cours : ' + str(percentageAndTime['percentage']) + '%')
    # make a progress bar
    progress(percentageAndTime['percentage'])
    print('\n')
    if nextClassInfo['nextClass'] != False:
        print('Prochain cours : ' + str(nextClassInfo['nextClass']) + ' de ' + str(nextClassInfo['nextClassTime'][0]) + ' à ' + str(nextClassInfo['nextClassTime'][1]))
    else:
        print('Prochain cours : LIBERTÉ 🎉')



displayAll()
while runLoop:
    displayAll()
    time.sleep(50/1000)





