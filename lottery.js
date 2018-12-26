'use strict'

var logger = require('./log').logger;
var config = require('./config').config;
var fs = require("fs");
var data = fs.readFileSync(__dirname + '/data/users.txt');
var allUsers = data.toString().trim().split("\n");
var current = null;
var tasks = [];
var rewards = [];

if (!Array.indexOf) {
    Array.prototype.indexOf = function (obj) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] == obj) {
                return i;
            }
        }
        return -1;
    }
}
initData();

function filterRestUser(except) {
    var restUsers = [];
    for (var i = 0; i < allUsers.length; i++) {
        var user = allUsers[i].trim();
        if (except.indexOf(user) == -1) {
            restUsers.push(user);
        }
    }
    logger.info('排除名单：' + except.toString());
    logger.info('剩下名单：' + restUsers.toString());
    return restUsers;
}

function initData() {
    for (var i = 0; i < config.tasks.length; i++) {
        var task = config.tasks[i];
        tasks.push({
            id: i,
            title: task.title,
            restUsers: filterRestUser(task.except),
            consumeUsers: [],
            lastRandUsers: []
        });
        if (task.rewards) {
            for (var j = 0; j < task.rewards.length; j++) {
                var reward = task.rewards[j];
                rewards.push({
                    id: j,
                    taskId: i,
                    title: reward.title,
                    count: reward.count,
                    capacity: reward.capacity,
                    consume: 0,
                    cols: getCols(reward.namesOfLine)
                });
            }
        }
    }
}

function getCols(number) {
    switch (number) {
        case 1:
            return 12;
        case 2:
            return 6;
        case 3:
            return 4;
        case 4:
            return 3;
        case 6:
            return 2;
        case 12:
            return 1;
        default:
            return 4;
    }
}

function canStart() {
    return !isRewardCompleted(current);
}

function isRewardCompleted(reward) {
    if (reward != null) {
        return reward.count > reward.consume ? false : true;
    }
    return true;
}

function nextReward() {
    if (isRewardCompleted(current)) {
        current = rewards.shift();
    }
    return current;
}

function randomUsers() {
    if (!isRewardCompleted(current)) {
        var task = tasks[current.taskId];
        var length = task.restUsers.length;

        var rest = current.count - current.consume;
        var consumeNumber = rest < current.capacity ? rest : current.capacity;
        consumeNumber = length < consumeNumber ? length : consumeNumber;

        var randomUsers = [];
        while (randomUsers.length < consumeNumber) {
            var idx = Math.floor(Math.random() * length);
            if (randomUsers.indexOf(task.restUsers[idx]) == -1) {
                randomUsers.push(task.restUsers[idx]);
            }
        }
        tasks[current.taskId].lastRandUsers = randomUsers;
        return randomUsers;
    }
    return false;
}

function completedOnceRolling() {
    if (!isRewardCompleted(current)) {
        var task = tasks[current.taskId];
        logger.info('Lottery taskId ' + current.taskId + '本次获奖随机用户: ' + task.lastRandUsers.toString());
        if (task.lastRandUsers.length > 0) {
            var rest = current.count - current.consume;
            var consumeNumber = rest < current.capacity ? rest : current.capacity;
            var restUsers = [];
            for (var i = 0; i < task.restUsers.length; i++) {
                if (task.lastRandUsers.indexOf(task.restUsers[i]) == -1) {
                    restUsers.push(task.restUsers[i]);
                }
            }
            current.consume = current.consume + consumeNumber;
            tasks[current.taskId].restUsers = restUsers;
            tasks[current.taskId].lastRandUsers = [];
            tasks[current.taskId].consumeUsers.push(task.lastRandUsers);
            logger.info('Lottery taskId ' + current.taskId + ' 余下:' + tasks[current.taskId].restUsers.toString());
            return true;
        }
    }
    return false;
}


module.exports = {
    config: config,
    currentReward: () => {
        return current;
    },
    canStart: canStart,
    nextReward: nextReward,
    randomUsers: randomUsers,
    completedOnceRolling: completedOnceRolling
}