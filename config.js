"use strict";
var config =  {
     //默认字体颜色
    fontColor: '#fdd312',
    //背景图片
    background:'images/bg-1.png',

    title: '公司年会',
    titleFontSize: '32px',
    titleColor:'#fdd312',

    subTitle: '幸运大抽奖',
    subTitleFontSize: '50px',
    subTitleColor:'#fdd312',
    
    rewardTitleFontSize:'32px',
    rewardTitleColor:'#fdd312',
    rewardAreaTop: "0", //10%
    rewardWelcomeMessage: "激动人心的时刻即将开始！",

    onceEndMessage:"本轮抽奖结束，更多精彩在下一轮！",
    allEndMessage:"抽奖全部结束，新年快，恭喜发财!",

    //抽奖滚动时长 单位秒，自动停止,0表示只能手动停止
    //本系统手动停止始终存在
    rollingTime:0, 

    resultPath:'d:/lottery/', //结果截图保存路径
    tasks:[
        //一个任务可以添加多抽奖活动，
        //每个抽奖活动消费一定数量的人员，
        //消费的人员不出现在后面的活动中
        //每个任务使用 users.txt中的名单
        {
            title:'开心百分百',
            except:['胡歌','张铭恩'], //排除users.txt中的名单
            rewards:[
                {
                    title:'四等奖',  //奖项名称
                    count:70,     //奖项数量
                    capacity:35,//一次抽取数量[1，count]
                    namesOfLine:6,  //获奖区每行显示几个名字 [1,2,3,4,6,12]
                    nameFontSize: 24 //px
                },
                {
                    title:'三等奖', //奖项名称
                    count:10,     //奖项数量
                    capacity:5,//一次抽取数量[1，count]
                    namesOfLine:3,  //获奖区每行显示几个名字 [1,2,3,4,6,12]
                    nameFontSize: 32 //px
                },
                {
                    title:'二等奖',  //奖项名称
                    count:5,//奖项数量
                    capacity:5,//一次抽取数量[1，count]
                    namesOfLine:3,  //获奖区每行显示几个名字 [1,2,3,4,6,12]
                    nameFontSize: 32 //px
                },
                {
                    title:'一等奖', //奖项名称
                    count:5,     //奖项数量
                    capacity:5,//一次抽取数量[1，count]
                    namesOfLine:3,  //获奖区每行显示几个名字 [1,2,3,4,6,12]
                    nameFontSize: 32 //px
                }
            ]
        },
        
        {
            title:'幸运百分百',
            except:['胡歌','李易峰'], //排除users.txt中的名单
            rewards:[
                {
                    title:'幸运奖', //奖项名称
                    count:1,     //奖项数量
                    capacity:1,  //一次抽取数量[1，count]
                    namesOfLine:1,  //获奖区每行显示几个名字 [1,2,3,4,6,12]
                    nameFontSize: 64 //px
                }
            ]
        }
    ]

}
module.exports = {
    config:config
}