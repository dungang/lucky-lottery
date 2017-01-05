'use strict';
const {
    ipcRenderer,
    desktopCapturer,
} = require('electron');
var fs = require('fs');
var lottery = require('./lottery');
var config  = lottery.config;
var logger = require('./log').logger;

var backgroundImage = config.background;
var body = document.querySelector('body');
body.style.backgroundImage="url("+backgroundImage+")";
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


let clock = null;

let waitTimer = null;

let rollingTimer = null;

let audio = new Audio();

audioPlayMusic('musicOfBackground',true);

function audioPlayMusic(name,loop=false)
{
    audio.pause();
    audio.src = __dirname + '/musics/'+name+'.mp3';
    audio.currentTime = 0;
    audio.loop = loop;
    audio.play();
}

function setRewardInfo(reward)
{
    var rewardInfo = document.querySelector('.reward');
    rewardInfo.innerHTML = reward.title + '('+reward.count+'/'+reward.consume+')';
    rewardInfo.style.fontSize = config.rewardTitleFontSize;
    rewardInfo.style.color = config.rewardTitleColor;
}

function setNames(html)
{
    var box = document.querySelector('.reward-pepole');
    box.innerHTML = html;
}

function renderUsers(users,numOfLine)
{
    var html = '';
    for(var i=0; i<users.length; i++) {
        html += '<span class="col-md-'+numOfLine+' col-'+numOfLine+'">'+users[i]+'</span>';
    }
    setNames(html);
}

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
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
            + "" + date.getHours() + seperator2 + date.getMinutes()
            + seperator2 + date.getSeconds();
    return currentdate;
}

function captureResult()
{
    desktopCapturer.getSources({
            types: ['window', 'screen'],
            thumbnailSize:{width: 1400, height: 960}
        }, 
        function (error, sources) {
            if (error) throw error
            for (var i = 0; i < sources.length; ++i) {
                if (sources[i].name == 'Entire screen') {
                    var timestamp = getNowFormatDate();
                    fs.writeFileSync(
                        config.resultPath + '/'+timestamp.toString()+'.png', 
                        sources[i].thumbnail.toPNG()
                    );
                }
            }
    });
}

function autoStopRolling()
{
    if (rollingTimer) {
        clearTimeout(rollingTimer);
    }
    rollingTimer = setTimeout(function(){
        stopRolling();
    },config.rollingTime*1000);
}

function stopRolling(){
    var reward = lottery.currentReward();
    if(!reward) return;
    clearInterval(clock);
    clock = null;
    audioPlayMusic('musicOfDraw');
    console.log('Stop a drawing reward : '+ reward.title);
    if (lottery.completedOnceRolling()) {
        captureResult();
        setRewardInfo(lottery.currentReward());
        console.log('Save a drawed reward result : '+ reward.title);
    }
    if (waitTimer) {
        clearTimeout(waitTimer);
    }
    waitTimer = setTimeout(function(){
        audioPlayMusic('musicOfBackground',true)
    },3000);
}

function startRolling()
{
    var reward = lottery.currentReward();
    if(!reward) return;
    if (lottery.canStart()) {
        audioPlayMusic('musicOfRolling',true);
        console.log('Start a drawing reward : '+ reward.title);
        clock = window.setInterval(function(){
            var users = lottery.randomUsers();
            if (users.length>0) {
                renderUsers(users,reward.cols);
            }
        },10);
        if(config.rollingTime>0) autoStopRolling();
    } else {
        console.log('Finished a drawing reward : '+ reward.title);
        setNames('<h1>'+config.onceEndMessage+'</h1>');
        audioPlayMusic('musicOfBackground',true);
    }
}

ipcRenderer.on('global-shortcut',(event,arg) => {
        switch(arg) {
            case 'start':
                
                if (clock) return;
                if (waitTimer) {
                    clearTimeout(waitTimer);
                }
                try {
                    startRolling();
                } catch(e) {
                    console.error(e.toString());
                }
                break;
            case 'stop':
                try {
                    stopRolling();
                } catch(e) {
                    console.error(e.toString());
                }
                break;
            case 'next':
                var current = lottery.nextReward();
                if (current) {
                    setRewardInfo(current);
                    if (current.consume === 0) {
                        setNames('<h1>'+config.rewardWelcomeMessage+'</h1>');
                    }
                } else {
                    setNames('<h1>'+config.allEndMessage+'</h1>');
                }
                break;
            case 'novoice':
                audio.paused 
                    ? audio.pause()
                    : audio.play();
                break;
            case 'capture':
                captureResult();
                break;
        }
})

