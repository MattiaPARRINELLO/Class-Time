import json
import datetime
from art import *
import time
# import _strptime

edt ={}
with open('edt copy.json', 'r') as f:
    edt = json.load(f)




def getCurrentDate():
    now = datetime.datetime.now()
    return {
        'weekday': 0,
        'hour': 14,
        'minute': now.minute,
        'second': now.second,
        'millisecond': now.microsecond
    }
    # return {
    #     'weekday': now.weekday(),
    #     'hour': now.hour,
    #     'minute': now.minute,
    #     'second': now.second,
    #     'millisecond': now.microsecond
    # }

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
        classStart = classTime[0].split(':')
        if currentDate['hour'] < int(classStart[0]) or (currentDate['hour'] == int(classStart[0]) and currentDate['minute'] < int(classStart[1])):
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
        classStart = classTime[0].split(':')
        classEnd = classTime[1].split(':')
        if ((int(classStart[0]) == int(currentDate['hour']) and int(classStart[1]) <= int(currentDate['minute'])) or (int(classStart[0]) < int(currentDate['hour']) and int(currentDate['hour']) < int(classEnd[0])) or (int(currentDate['hour']) == int(classEnd[0]) and int(currentDate['minute']) < int(classEnd[1]))) :
            getCurrentClass = classInfo['course']
            getCurrentClassTime = classTime
            print(getCurrentClass)
            print(getCurrentClassTime)
            break
    return {
        'currentClass': getCurrentClass,
        'currentClassTime': getCurrentClassTime
    }

def getRemainingTime(classTime):
    currentDate = getCurrentDate()
    classTimeArray = classTime.split(':')
    classHour = int(classTimeArray[0])
    classMinute = int(classTimeArray[1])
    remainingHour = classHour - currentDate['hour']
    remainingMinute = classMinute - currentDate['minute']
    remainingSecond = 60 - currentDate['second']
    remainingMilisecond = 1000 - currentDate['millisecond']
    remainingTime = (remainingHour * 3600000) + (remainingMinute * 60000) + (remainingSecond * 1000) + remainingMilisecond
    return remainingTime


def percentageOfTheClassCalculator(classTimeFull):
    classTimeEnd = classTimeFull[1].split(':')
    classTime = classTimeFull[0].split(':')
    classStartHour = int(classTime[0])
    classStartMinute = int(classTime[1])
    classEndMinute = int(classTimeEnd[1])
    classEndHour = int(classTimeEnd[0])
    classStartTimeStamp = datetime.datetime.strptime((str(classStartHour) + ":" + str(classStartMinute)), "%H:%M")
    classEndTimeStamp = datetime.datetime.strptime((str(classEndHour) + ":" + str(classEndMinute)), "%H:%M")
    currentTime = getCurrentDate()
    currentTimeFormat = datetime.datetime.strptime((str(currentTime['hour']) + ":" + str(currentTime['minute']) + ":" + str(currentTime['second']) + "." + str(currentTime['millisecond'])), "%H:%M:%S.%f")
    elapsedTime = currentTimeFormat - classStartTimeStamp
    classDuration = classEndTimeStamp - classStartTimeStamp
    return (elapsedTime / classDuration) * 100


        

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
    if currentClassInfo['currentClass'] == False or nextClassInfo['nextClass'] == False:
        print('Pas de cours pour le moment')
        return
    print('Actuellement en cours de : ' + str(currentClassInfo['currentClass']))
    # format remaining time hh:mm:ss
    remainingTimeFormatted = str(datetime.timedelta(milliseconds=getRemainingTime(currentClassInfo['currentClassTime'][1])))
    print('Temps restant : ' + remainingTimeFormatted)
    print('Pourcentage du cours : ' + str(percentageOfTheClassCalculator(currentClassInfo['currentClassTime'])) + '%')
    # make a progress bar
    # progress(percentageOfTheClassCalculator(currentClassInfo['currentClassTime']))
    print('\n')
    if nextClassInfo['nextClass'] != False:
        print('Prochain cours : ' + str(nextClassInfo['nextClass']) + 'de ' + str(nextClassInfo['nextClassTime'][0]) + ' à ' + str(nextClassInfo['nextClassTime'][1]))
    else:
        print('Prochain cours : LIBERTÉ 🎉')


displayAll()

while True:
    displayAll()
    time.sleep(30 / 1000)





