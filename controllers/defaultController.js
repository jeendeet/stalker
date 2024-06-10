const { multiMongooseToObj } = require('../util/mongoose');
const Config = require('../config/configuration');
const { redirect, type } = require('express/lib/response');

const axios = require('axios');
const cheerio = require('cheerio');

const fs = require('fs');

// const rule=[
//     {
//         name:"Table Name",
//         skipto:'skipTo(<li data-index="0" data-prop="0">)&&skipTo(<p class="lileft">)',
//         backto:'backTo(<div class="liright">)&&backTo(</p>)',
//         type:"element"
//     },
//     {
//         name:"Table Value",
//         skipto:'skipTo(<div class="liright">)&&skipTo(<span class="">)',
//         backto:'backTo(</span>)',
//         type:"element"
//     }

// ]
const rule=[
    {
        name:"Title",
        start:'skipTo(<span>Giá Rẻ Quá</span>)&&skipTo(<h3>)',
        end:'backTo(</h3>)',
        type:"element"
    },
    {
        name:"Price",
        start:'skipTo(<strong class="price">)',
        end:'backTo(</strong>)',
        type:"element"
    }

]

// URL của trang web bạn muốn clone
// const url = 'https://example.com'; // Thay thế bằng URL bạn muốn
const url = 'https://www.thegioididong.com/sac-dtdd'
// const url = 'https://www.thegioididong.com/sac-dtdd/pin-sac-du-phong-polymer-20000mah-10-5w-ava-plus-q7'
// Hàm để clone mã HTML
async function cloneHtml(url) {
    try {
        // Gửi yêu cầu HTTP GET tới URL
        const { data } = await axios.get(url);
        
        // Tạo một đối tượng cheerio để phân tích cú pháp HTML
        const $ = cheerio.load(data);
        
        // Lấy mã HTML
        const html = $.html();
        
        // Lưu mã HTML vào tệp
        fs.writeFile('./doc/clonedPage.txt', html, (err) => {
            if (err) {
                console.error('Lỗi khi lưu tệp:', err);
                return;
            }
            console.log('Đã lưu mã HTML vào tệp clonedPage.html');
            return html;
        });
    } catch (error) {
        console.error('Lỗi khi clone mã HTML:', error);
    }
}
function mainStart(string, ruleStart){
    let mainString = string;
    let idxStartMain = 0;
    let startRuleList = String(ruleStart).split('||');
    for(let startRule of startRuleList){
        let startStep = String(startRule).split('&&');
        for(let start of startStep){
            let idxStart = 0;
            let idx1 = start.indexOf('skipTo(')+ String('skipTo(').length
            let stringStart = start.slice(idx1, start.length - 1);
            // console.log("Start find: ",stringStart)
            if(mainString.indexOf(stringStart)>0){
                idxStart = mainString.indexOf(stringStart)+stringStart.length;
            }
            else{
                break;
            }
            idxStartMain = idxStartMain+ idxStart;
            // console.log("Start idx ",idxStartMain)
            mainString = mainString.slice(idxStart, mainString.length);
            // console.log("Main String: ", mainString)
        }
        if(idxStartMain !=0) break;
    }
    console.log("Start idx ",idxStartMain)
    return idxStartMain
}
function mainEnd(string, ruleEnd){
    let mainString = string;
    let idxEndMain = 0;
    let endRuleList = String(ruleEnd).split('||');
    for(let endRule of endRuleList){
        let endStep = String(endRule).split('&&');
        for(let end of endStep){
            let idx1 = end.indexOf('backTo(')+ String('backTo(').length
            let stringEnd = end.slice(idx1, end.length - 1);
            // console.log("Stop Find ",stringEnd)
            if(mainString.indexOf(stringEnd)>0){
                idxEndMain = mainString.indexOf(stringEnd)
            }
            mainString = mainString.slice(0, idxEndMain);
        }
        if(idxEndMain !=0) break;
    }
    console.log("Stop idx ",idxEndMain)
    if(idxEndMain ==0){
        idxEndMain = -1;
    }
    return idxEndMain;
}
function wrapper(rule) {
    let rawClone = fs.readFileSync('./doc/clonedPage.txt', 'utf8');
    let isContinue = 1;
    let Objects = [];
    let mainString = String(rawClone)
    mainString = mainString.replace(/    /g, '');
    mainString = mainString.replace(/\n/g, '');
    // console.log("String Data: ", mainString);
    while(isContinue){
        {
            let object = [];
            for(let element of rule){
                let element_object ={}
                // console.log("Element: ", element)
        
                // let idxStart = mainString.indexOf(element.skipto) + String(element.skipto).length
                let idxStart = mainStart(mainString, element.start)
                mainString = mainString.slice(idxStart,mainString.length);
                // let idxStop = mainString.indexOf(element.backto)
                let idxStop = mainEnd(mainString, element.end)
                let data = ''
                if(idxStart>0 && idxStop>0){
                    data = mainString.slice(0,idxStop);
                }

                console.log("Data: ", data)
                mainString = mainString.slice(idxStop,mainString.length);
                element_object.name = element.name;
                element_object.data = data
                // console.log("++++++++++Element Object: ", element_object)
                object.push(element_object);
            }
            if(mainString.length < 5){
                isContinue = 0;
                break;
            }
            // console.log("+++++ Object: ", object)
            // console.log(object);
            Objects.push(object);
        }
    }
    console.log("Final List Object: ", Objects)
    return(Objects);
}

class defaultController {
    // [GET] /index
    index(req, res, next) {
        res.render('default/index', {path: "logged"})
    }
    config(req, res, next) {
        let num_element = req.body.num
        let input_url = req.body.url;
        
        req.session.num = num_element;
        req.session.url = url;

        let element_lst = []
        for(let i =0; i< num_element; i++){
            let element = {}
            element.id = i;
            element.name = "Data Name";
            element.start = "Start rule";
            element.end ="End rule";
            element_lst.push(element);
        }
        req.session.element_lst = element_lst;
        res.render('default/index', {url:input_url,num:num_element,rule:element_lst})
    }
    //[POST]/apiv4/stalker/
    stalker(req, res, next) {
        let input_url = req.body.url;
        let num_element = req.body.num;
        // let rule = req.body.rule;
        cloneHtml(input_url);
        let rawClone = fs.readFileSync('./doc/clonedPage.txt', 'utf8');
        // let rawBody = rawClone.slice(rawClone.indexOf('<body>'),rawClone.indexOf('</body>'));
        
        let rule_matrix = []
        let fields = []
        let element_lst = [];
        for(let i=0; i<num_element; i++){
            let _rule={};
            _rule.name = req.body['name_'+String(i)]
            _rule.start = req.body['start_'+String(i)]
            _rule.end = req.body['end_'+String(i)]
            rule_matrix.push(_rule)
            fields.push(_rule.name)

            let element = {}
            element.id = i;
            element.name = _rule.name;
            element.start =  _rule.start;
            element.end =_rule.end;
            element_lst.push(element);
        }
        console.log(rule_matrix)
        let Objects = wrapper(rule_matrix);
        res.render('default/index', {url:input_url,num:num_element,rule:element_lst,fields:fields,result:Objects})
        // res.send(Objects);
    }
}

module.exports = new defaultController;