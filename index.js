/****************************************************************/
/* 選擇時間，可更改年/月 */
const tRange = {
    m1: 7,
    m2: 10,
    y: 2020
};
/* 測站們，可增加 */
const files = [
    { station: 'C0F970', stname: '大坑' },
    { station: 'C0F9N0', stname: '大里' },
    { station: 'C0F9A0', stname: '中竹林' },
	{ station: 'C0F0C0', stname: '中坑' },
    { station: 'C0F9Q0', stname: '外埔' },
    { station: 'C0F9T0', stname: '西屯' },
    { station: 'C0F9V0', stname: '新社' },
    { station: '467490', stname: '臺中' },
	{ station: 'C0F9O0', stname: '潭子' },
    { station: 'C0F9M0', stname: '豐原' },
    { station: 'C0F850', stname: '東勢' },
	{ station: 'C0F9L0', stname: '后里' },
    { station: 'C0F9I0', stname: '神岡' },
    { station: 'C0F9U0', stname: '南屯' },
    { station: 'C0F9S0', stname: '烏日' },
    { station: 'C0F000', stname: '大肚' },
    { station: '467770', stname: '梧棲氣象站' },
    { station: 'C0F930', stname: '大甲' },
    { station: 'C0F0B0', stname: '石岡' },
    { station: 'C0F9K0', stname: '大安' },
    { station: 'C0F9P0', stname: '清水' },
    { station: 'C0F9R0', stname: '龍井' },
    { station: 'C0F9X0', stname: '大雅' },
    { station: 'C0E830', stname: '苑裡' },
    { station: 'C0E880', stname: '三義' },
    { station: 'C1E511', stname: '新開' },
    { station: 'C1E711', stname: '馬拉邦山' },
    { station: 'C0E790', stname: '卓蘭' },
    { station: 'C1E691', stname: '南湖' },
    { station: 'C1E451', stname: '象鼻' },
	{ station: 'C1V830', stname: '國三' },
    { station: 'C0V350', stname: '溪埔' },
    { station: 'C0R590', stname: '里港' },
    { station: 'C0R490', stname: '九如' },
    { station: 'C0R170', stname: '屏東' },
    { station: 'C0R160', stname: '鹽埔' },
    { station: 'C0R480', stname: '長治' },
    { station: 'C0R570', stname: '麟洛' },
    { station: 'C1R630', stname: '龍泉' },
    { station: 'C0R150', stname: '三地門' },
    { station: 'C0R140', stname: '瑪家' },
    { station: 'C1R110', stname: '口社' },
    { station: 'C1R120', stname: '上德文' },
    { station: 'C0R130', stname: '阿禮' },
    { station: 'C0R100', stname: '尾寮山' },
    { station: 'C1V780', stname: '多納林道' },
    { station: 'C0V790', stname: '萬山' },
    { station: 'C1V340', stname: '大津' },
    { station: 'C0R470', stname: '高樹' },
    { station: 'C1V570', stname: '吉東' },
    { station: 'C0V310', stname: '美濃' },
    { station: 'C0V740', stname: '旗山' },
    { station: 'C0K240', stname: '草嶺' },
    { station: 'C1I131', stname: '桶頭' },
    { station: 'C1M620', stname: '瑞里' },
    { station: 'C0K560', stname: '棋山' },
    { station: 'C1M480', stname: '獨立山' },
    { station: 'C0M700', stname: '竹崎' },
    { station: 'C0M770', stname: '嘉義梅山' },
    { station: 'C0K460', stname: '斗南' },
    { station: 'C0K450', stname: '大埤' },
    { station: 'C0M670', stname: '大林' },
    { station: 'C0M760', stname: '民雄' },
    { station: 'C0M660', stname: '溪口' },
    { station: 'C0K390', stname: '土庫' },
    { station: 'C0K500', stname: '元長' },
    { station: 'C0M790', stname: '新港' },
    { station: 'C0K410', stname: '北港' },
    { station: 'C0M740', stname: '六腳' },
    { station: 'C0K510', stname: '水林' },
    { station: 'C0K550', stname: '蔦松' },
    { station: 'C0K280', stname: '四湖' },
    { station: 'C1K540', stname: '口湖' },
    { station: 'C0K291', stname: '宜梧' }
];
/****************************************************************/

const request      = require('request'),
      cheerio      = require('cheerio'),
      urlencode    = require('urlencode'),
      ObjectsToCsv = require('objects-to-csv');

const dateGen = (fromMonth, toMonth, year) => {
    const dates = [];
    if(fromMonth > toMonth) { 
        const tmp = fromMonth;
        fromMonth = toMonth;
        toMonth = tmp;
    }
    for(let mm=fromMonth; mm<=toMonth; mm++) {
        let days = null;
        switch(mm) {
            case 1: case 3: case 5: case 7: case 8: case 10:
                days = 31;
                break;
            case 4: case 6: case 9: case 11: case 12:
                days = 30;
                break;
            case 2: 
                days = ((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0))? 29 : 28;
                break;
        }
        for(let dd=1; dd<=days; dd++) {
            const tmp1 = (mm.toString().length < 2)? '0'+mm : mm;
            const tmp2 = (dd.toString().length < 2)? '0'+dd : dd;
            dates.push(
                `${year}-${tmp1}-${tmp2}`
            );
        }
    }
    return dates;
};

const statsGen = (info, dates) => {
    const stats = [];
    dates.forEach(date => {
        stats.push(
            Object.assign({}, {
                station: info.station,
                stname: info.stname,
                datepicker: date
            })
        );
    });
    return stats;
}

const urlsGen = function(stats) {
    const urls = [];
    const base = 'https://e-service.cwb.gov.tw/HistoryDataQuery/DayDataController.do?command=viewMain';
    stats.forEach(stat => {
        urls.push(
            (
                base + "&station=" + stat.station + '&stname='
                + urlencode(stat.stname, 'utf8').replace(/%/g, '%25')
                + '&datepicker=' + stat.datepicker
            )
        );
    });
    return urls;
}

const QGen = (files) => {
    let q = '';
    files.forEach((file, i) => {
        if(i%5==0 && i!=0) { q+= '\n'; }
        const num = (String(i).length == 1)? '0'+i : i;
        q += `${num}: ${file.stname}`;
        if(file.stname.length == 2) { q+= `       `; }
        else if(file.stname.length == 3) { q+= `     `; }
        else if(file.stname.length == 4) { q+= `   `; }
        else if(file.stname.length == 5) { q+= ` `; }
        else q+= ``;
    });
    return q;
};

const craw = function(urls) {
    const result = [], promises = [];
    urls.forEach((url) => { // 同時爬蟲
        promises.push(new Promise((resolve, _) => {
            request({
                url: url,
                method: "GET"
            }, function(err, res, body) {
                if(err || !body) { console.log(url); return; }
                const $ = cheerio.load(body);
                const trs = $('#MyTable tr');
                for(let i=3; i<trs.length; i++) {
                    result.push(Object.assign({}, {
                        staname: urlencode.decode(
                            url.match(/stname=[A-Za-z0-9%]+/).toString().replace(/%25/g, '%').replace(/stname=/, ''), 
                            'utf8'
                        ),
                        date: url.match(/datepicker=[0-9-]+/).toString().replace(/datepicker=/, '').replace(/-/g, '/'),
                        hour: trs.eq(i).find('td').eq(0).text().replace(/^\s+|\s+$/g, ''),
                        temp: trs.eq(i).find('td').eq(3).text().replace(/^\s+|\s+$/g, ''),
                        station: url.match(/station=[A-Za-z0-9]+/).toString().replace(/station=/, '')
                    }));
                }
                resolve('ok');
            });
        }));
    });
    Promise.all(promises).then(async () => { 
            result.sort((a, b) => Number(a.date.replace(/\//g, '')) - Number(b.date.replace(/\//g, '')));
            const csv = new ObjectsToCsv(result);
            await csv.toDisk(`./${result[0].staname}.csv`);
            console.log(`${result[0].staname}finish`);
            magic = result;
    });
    return result;
}

const tp = function(file, tRange) {
    const { m1, m2, y } = tRange;
    const dates = dateGen(m1, m2, y);
    const stats = statsGen(file, dates);
    const urls = urlsGen(stats);
    craw(urls);
};

const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
function rlPromisify(fn) {
    return async (...args) => {
        return new Promise(resolve => fn(...args, resolve));
    };
}
const question = rlPromisify(rl.question.bind(rl));
(async () => {
    const option = await question(`請選擇要爬蟲的測站: \n${QGen(files)}\nconsole> `);
    tp(files[option.replace(/^\s+|\s+$/g, '').replace(/^0+/, '')], tRange);
    setTimeout(()=>{}, 5000);
    rl.close();
})();