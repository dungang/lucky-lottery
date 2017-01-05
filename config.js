'use strict'
var config = {

    fontColor: '#fdd312',
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

    rollingTime:0, //抽奖滚动时长 单位秒，自动停止,0表示只能手动停止

    resultPath:'d:/lottery/', //结果截图保存路径
    tasks:[
        {
            title:'开心百分百',
            except:['胡歌','张铭恩'], //排除名单
            rewards:[
                {
                    title:'一等奖',  //奖项名称
                    count:70,     //奖项数量
                    capacity:70,//一次抽取数量[1，count]
                    namesOfLine:6  //获奖区每行显示几个名字 [1,2,3,4,6,12]
                },
                {
                    title:'二等奖', //奖项名称
                    count:5,     //奖项数量
                    capacity:5,//一次抽取数量[1，count]
                    namesOfLine:1//获奖区每行显示几个名字 [1,2,3,4,6,12]
                },
                {
                    title:'三等奖',  //奖项名称
                    count:5,//奖项数量
                    capacity:5,//一次抽取数量[1，count]
                    namesOfLine:1   //获奖区每行显示几个名字 [1,2,3,4,6,12]
                },
                {
                    title:'四等奖', //奖项名称
                    count:5,     //奖项数量
                    capacity:5,//一次抽取数量[1，count]
                    namesOfLine:1    //获奖区每行显示几个名字 [1,2,3,4,6,12]
                }
            ]
        },
        
        {
            title:'幸运百分百',
            except:['胡歌','李易峰'], //排除名单
            rewards:[
                {
                    title:'幸运奖', //奖项名称
                    count:1,     //奖项数量
                    capacity:1,  //一次抽取数量[1，count]
                    namesOfLine:1 //获奖区每行显示几个名字 [1,2,3,4,6,12]
                }
            ]
        }
    ]

}
module.exports = {
    config:config
}