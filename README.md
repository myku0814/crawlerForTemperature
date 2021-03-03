# crawlerForTemperature
對觀測站日報表進行爬蟲，並存成CSV檔。

- [Git操作](https://medium.com/tsungs-blog/day13-git-github%E6%93%8D%E4%BD%9C-304ad94a1c6a)
- [npm pkg: 打包成exe檔](https://codertw.com/%E5%89%8D%E7%AB%AF%E9%96%8B%E7%99%BC/218961/)
- [npm request, cheerio: JS基礎爬蟲](https://andy6804tw.github.io/2018/02/11/nodejs-crawler/)
- [npm readline: 在terminal讓使用者輸入資料](https://segmentfault.com/q/1010000022283003)
- [npm urlencode: 將編碼轉成utf-8或解碼](https://www.npmjs.com/package/urlencode)
- [存成csv檔](https://www.npmjs.com/package/objects-to-csv)
- [node fs: 教學](https://nodejs.org/api/fs.html)

## regEx心得

- `/ ... /`為regEx literal。
- `/\./`的`.`是字元的`.`，因為前面有跳脫字元`\`
- `//g`的g代表匹配全部，沒加則匹配掉一個。
- `\s`表各種空格的統稱。
- `*`表0個以上，`+`表1個以上。
- `^`表開頭，`$`表結尾。
- `|`表或。
- `/[^a-zA-Z0-9%]/`的`[]`表集合，在集合中`^`表否定。這裡意思是匹配非字母大小寫或數字的東西。等同`\W`(大寫為否)。
- `/a[^]*b/`表a跟b之間能有隨意的字。也可用`.`代表任意字元。
- `a(?=b)`表匹配a但a後面要有b，b是a存在的意義。
