'use strict';
const {
    ipcRenderer,
    desktopCapturer,
} = require('electron');
var fs = require('fs');
var lottery = require('./lottery');

//初始化参数
var config = lottery.config;
var logger = require('./log').logger;

var backgroundImage = config.background;
var body = document.querySelector('body');
body.style.backgroundImage = "url(" + backgroundImage + ")";
body.style.color = config.fontColor;


var title = document.querySelector('.title');
title.innerHTML = config.title;
title.style.color = config.titleColor;
title.style.fontSize = config.titleFontSize;


var subTitle = document.querySelector('.sub-title');
subTitle.innerHTML = config.subTitle;
subTitle.style.color = config.subTitleColor;
subTitle.style.fontSize = config.subTitleFontSize;

var area = document.querySelector('#reward-area');
area.style.marginTop = config.rewardAreaTop;
//-- 初始化参数结束

//开始抽奖的时候定时随机出现的人员名单的定时器
let randomTimer = null;

//定时停止的抽奖的定时器
let autoStopRollingTimer = null;

/**
 * 播放器
 */
let audio = new Audio();

/**
 * 是否在抽奖中
 */
let rolling = false;

audioPlayMusic('musicOfBackground', true);

/**
 * 清楚随机显示人员的定时器
 */
function clearRandomTimer () {
    if(randomTimer) {
        window.clearInterval(randomTimer);
        randomTimer = null;
    }
}

/**
 * 是否可以开启rolling
 */
function canStartRolling(){
    if(randomTimer) return false;
    else return true;
}

/**
 * 开启随机显示人员的定时器
 */
function startRandomTimer(callback,time){
    randomTimer = window.setInterval(callback,time);
}

/**
 * 开启定时停止本轮抽奖的定时器
 */
function startAutoStopRollingTimer(callback,time){
    if(autoStopRollingTimer) {
        window.clearTimeout(autoStopRollingTimer);
        autoStopRollingTimer = null;
    }
    autoStopRollingTimer = window.setTimeout(callback,time);
}

/**
 * 播放背景音乐
 * @param {string} name 
 * @param {boolean} loop 
 */
function audioPlayMusic(name, loop = false, callback) {
    audio.pause();
    audio.src = __dirname + '/musics/' + name + '.mp3';
    audio.currentTime = 0;
    audio.loop = loop;
    audio.addEventListener('loadedmetadata', function () {
        audio.play();
        if (typeof callback == 'function') {
            callback.call(audio);
        }
    },{once:true});

}

/**
 * 设置奖项的信息
 * @param {object} reward 
 */
function setRewardInfo(reward) {
    var rewardInfo = document.querySelector('.reward');
    rewardInfo.innerHTML = reward.title + '(' + reward.count + '/' + reward.consume + ')';
    rewardInfo.style.fontSize = config.rewardTitleFontSize;
    rewardInfo.style.color = config.rewardTitleColor;
}

/**
 * 更新获奖区域的内容
 * @param {string} html 
 */
function setNames(html) {
    var box = document.querySelector('.reward-pepole');
    box.innerHTML = html;
}

/**
 * 渲染抽奖的人员名单
 * 
 * @param {array} users 
 * @param {number} numOfLine 
 */
function renderUsers(users, numOfLine) {
    var html = '';
    for (var i = 0; i < users.length; i++) {
        html += '<span class="col-md-' + numOfLine + ' col-' + numOfLine + '">' + users[i] + '</span>';
    }
    setNames(html);
}

/**
 * 将当前时间生成格式化的字符串
 * 主要使用在截图文件的存储
 */
function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "";
    var seperator2 = "";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate +
        "" + date.getHours() + seperator2 + date.getMinutes() +
        seperator2 + date.getSeconds();
    return currentdate;
}

/**
 * 截图
 */
function captureResult() {
    desktopCapturer.getSources({
            types: ['window', 'screen'],
            thumbnailSize: {
                width: 1400,
                height: 960
            }
        },
        function (error, sources) {
            if (error) throw error
            for (var i = 0; i < sources.length; ++i) {
                if (sources[i].name == 'Entire screen') {
                    var timestamp = getNowFormatDate();
                    if (!fs.existsSync(config.resultPath)) {
                        fs.mkdirSync(config.resultPath);
                    }

                    fs.writeFileSync(
                        config.resultPath + '/' + timestamp.toString() + '.png',
                        sources[i].thumbnail.toPNG()
                    );

                }
            }
        });
}

/**
 * 定时停止抽奖活动
 * 需配置参数开启，才生效
 * config.rollingTime
 */
function autoStopRolling() {
    startAutoStopRollingTimer(function () {
        stopRolling();
    }, config.rollingTime * 1000);
}

/**
 * 停止本轮抽奖，展示结果，并自动截屏
 */
function stopRolling() {
    if(rolling===true) {
        rolling = false;
        var reward = lottery.currentReward();
        clearRandomTimer();
        console.log('Stop a drawing reward : ' + reward.title);
        if (lottery.completedOnceRolling()) {
            //获取最新的奖项数据（获奖人数的变化）
            reward = lottery.currentReward();
            setRewardInfo(reward);
            //等待一秒后执行，应为渲染是结果是异步的，需要时间
            window.setTimeout(function(){
                captureResult();
            },500);
            console.log('Save a drawed reward result : ' + reward.title);
        }
        audioPlayMusic('musicOfDraw', false, function () {
            
            this.addEventListener('ended', function () {
                audioPlayMusic('musicOfBackground', true);
            }, {
                once: true
            })
        });
    }
}

/**
 * 执行本轮抽奖
 */
function startRolling() {
    var reward = lottery.currentReward();
    if(rolling == false && reward) {
        if (canStartRolling() && lottery.canStart()) {
            rolling = true;
            audioPlayMusic('musicOfRolling', true, function () {
                console.log('Start a drawing reward : ' + reward.title);
                startRandomTimer(function () {
                    var users = lottery.randomUsers();
                    if (users.length > 0) {
                        renderUsers(users, reward.cols);
                    }
                }, 10);
                if (config.rollingTime > 0) autoStopRolling();
            });
    
        } else {
            console.log('Finished a drawing reward : ' + reward.title);
            setNames('<h1>' + config.onceEndMessage + '</h1>');
            audioPlayMusic('musicOfBackground', true);
        }
    }
}

//接受命令
ipcRenderer.on('global-shortcut', (event, arg) => {
    switch (arg) {
        case 'start': //开始本轮抽奖
            try {
                startRolling();
            } catch (e) {
                console.error(e.toString());
            }
            break;
        case 'stop': //停止本轮抽奖，展示结果并自动截图
            try {
                stopRolling();
            } catch (e) {
                console.error(e.toString());
            }
            break;
        case 'next': //切换下一轮抽奖
            var current = lottery.nextReward();
            if (current) {
                setRewardInfo(current);
                if (current.consume === 0) {
                    setNames('<h1>' + config.rewardWelcomeMessage + '</h1>');
                }
            } else {
                setNames('<h1>' + config.allEndMessage + '</h1>');
            }
            break;
        case 'novoice': //关闭背景音乐
            audio.paused ?
                audio.pause() :
                audio.play();
            break;
        case 'capture': //截屏
            captureResult();
            break;
    }
})