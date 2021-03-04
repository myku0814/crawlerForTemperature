/* import module*/
const request = require('request');
const cheerio = require('cheerio');
const urlencode = require('urlencode');
const ObjectsToCsv = require('objects-to-csv');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const rlPromisify = fn => async (...args) => new Promise(resolve => fn(...args, resolve));
const question = rlPromisify(rl.question.bind(rl));

/* prototypal inheritance */
String.prototype.eliminateSpace = function() {
    return this.replace(/^\s+|\s+$/g, '');
};
String.prototype.eliminate0 = function() {
    return this.replace(/^0(?=[0-9])/,'');
};
String.prototype.creatConsole = function() {
    return `${this}\nconsole> `;
};
String.prototype.dateToNum = function() {
    return Number(this.replace(/\//g, ''));
};
Number.prototype.toStr = function() {
    return (String(this).length === 1)? `0${this}` : this;
};

class WebURL {
    constructor(station, stname, datepicker) {
        this._base = `https://e-service.cwb.gov.tw/HistoryDataQuery/MonthDataController.do?command=viewMain`;
        this.station = station;
        this.stname = stname;
        this.datepicker = datepicker;
    }
    getURL() {
        return `${this._base}&station=${this.station}&stname=${urlencode(this.stname, 'utf8').replace(/%/g, '%25')}&datepicker=${this.datepicker}`;
    }
    getStation() {
        return this.station;
    }
    getStname() {
        return this.stname;
    }
    getDatepicker() {
        return this.datepicker.replace(/-/, '/');
    }
    async request() {
        const result = [];
        const self = this;
        return new Promise((resolve, reject) => {
            request({
                url: self.getURL(),
                method: "GET"
            }, function(err, res, body) {
                if(err || !body) console.log(`${self.getURL()} have something error: ${err}`); 
                else {
                    const $ = cheerio.load(body);
                    const trs = $('#MyTable tr');
                    const getTrTdText = (row, col) => trs.eq(row).find('td').eq(col).text().eliminateSpace();
                    for(let i=3; i<trs.length; i++) {
                        result.push(new Data(
                            self.getStname(),
                            `${self.getDatepicker()}/${getTrTdText(i, 0)}`,
                            getTrTdText(i, 7),
                            getTrTdText(i, 8),
                            getTrTdText(i, 10),
                            self.getStation()
                        ));
                    }
                    resolve(result);
                }
            });
        });
    }
}

class Data {
    constructor(stname, date, temp, max, min, station) {
        this.stname = stname; 
        this.date = date;
        this.temp = temp;
        this.max = max;
        this.min = min;
        this.station = station;
    }
}

class Input {
    constructor(rawData) {
        this.rawData = rawData;
    }
    static build(path) {
        return new Promise((resolve, reject) => {
            fs.readFile(path, 'utf8', (err, data) => {
                resolve(new Input(data));
            });
        });
    }
    toArr() {
        const tmp = [];
        this.rawData.split(/\s*}\s*,\s*{\s*/).forEach(dirty => {
            tmp.push(Object.assign({}, {
                station: dirty.match(/station:\s*'[\w]+'/).toString().replace(/station:\s*'|'$/g, ''),
                stname: dirty.match(/stname:\s*'.+'/).toString().replace(/stname:\s*'|'$/g, '')
            }));
        });
        return tmp;
    }
}

/* load list file (async)*/
const loadTxt = async () => {
    return new Promise(async(resolve, reject) => {
        const txt = await Input.build('./info.txt');
        resolve(txt.toArr());
    });
}

/* generate question */
const QGen = (txt) => {
    const options = () => {
        const addSpace = (i, strLength) => {
            let s = '';
            if     (strLength === 2) s += `       `;
            else if(strLength === 3) s += `     `;
            else if(strLength === 4) s += `   `;
            else if(strLength === 5) s += ` `;
            else                    s += ` `;
            if(i%5===4) s += '\n';
            return s;
        };
        let q = '';
        txt.forEach((stInfo,idx) => q+=`${idx.toStr()}: ${stInfo.stname}${addSpace(idx, stInfo.stname.length)}`);
        return q;
    }; 
    return new Promise(async (resolve, reject) => {
        let choose = await question(`<請選擇測站>\n${options()}`.creatConsole());
        if(choose.eliminateSpace() === '520') resolve('520');
        else {
            let yy = await question('<請輸入year>'.creatConsole());
            let mm1 = await question('<請輸入月份(起)>'.creatConsole());
            let mm2 = await question('<請輸入月份(終)>'.creatConsole());
            resolve({
                choose: choose.eliminateSpace().eliminate0(),
                yy: yy.eliminateSpace().eliminate0(),
                mm1: mm1.eliminateSpace().eliminate0(),
                mm2: mm2.eliminateSpace().eliminate0()
            });
        }
    });
}

/* generate urls */
const genURLs = ({txt, choose, yy, mm1, mm2}) => {
    const urls = [];
    const checkInt = (t) => !Number.isInteger(Number(t));
    const checkYear = (yy) => Number(yy)<=0;
    const checkMonth = (mm) => Number(mm)<=0 || Number(mm)>12;
    if(checkInt(yy)||checkInt(mm1)||checkInt(mm2)||checkYear(yy)||checkMonth(mm1)||checkMonth(mm2)) {
        console.log('Year or month 有錯...');
    } else {
        for(let mmm=mm1; mmm<= mm2; mmm++) {
            urls.push(
                new WebURL(txt[choose].station, txt[choose].stname, `${yy}-${Number(mmm).toStr()}`)
            );
        }
    }
    return urls;
};

/* craw website (async) */
const craw = (txt, needs) => {
    let result = [];
    const promises = [];
    return new Promise(async (resolve, reject) => {
        const urls = genURLs(Object.assign(needs, { txt: txt }));
        urls.forEach(async url => { // async
            promises.push(new Promise(async (resolve, reject) => {
                const data = await url.request();
                result = result.concat(data);
                resolve();
            }));
        });
        Promise.all(promises).then(()=> {
            result.sort((a, b) => a.date.dateToNum() - b.date.dateToNum());
            resolve(result);
        });
    });
}

/* save data to csv (async) */
const save = result => {
    return new Promise(async (resolve, reject) => {
        const csv = new ObjectsToCsv(result);
        await csv.toDisk(`./${result[0].stname}.csv`);
        resolve(`${result[0].stname} saved.\n`);
    });
}

/* main */
(async () => {
    while(true) {
        const txt = await loadTxt();
        const needs = await QGen(txt);
        if(needs === '520') {
            console.log('結束程式中...');
            setTimeout(_ => {}, 500);
            process.exit();
        } else {
            const result = await craw(txt, needs);
            const log = await save(result);
            console.log(log);
        }
    }
})();