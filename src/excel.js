import excel from 'exceljs';
import { parse } from 'papaparse';

const sum = (arr) => {
    var result = 0;
    for(var item of arr) {
        result = result + item.count;
    }
    return result;
}

export const parseExcel = (file, cb) => {

    if(file.name.endsWith('.csv')) {
        parse(file, {
            complete: function(result) {

                const { data } = result;
                const seen = {};
                const data2 =  [];
                data.forEach((item, index) => {
                    if(index > 0 && item[1]) {
                        try {

                            var deviceId = item[1].split(',')[2].split(':')[1].trim();
                            var [m, d, y] = item[0].split(',')[0].split('/');
                            var date = `${y}-${parseInt(m) - 1}-${d}`;
                            data2.push({
                                deviceId,
                                date
                            })
                        } catch(err) {
                            console.log(item)
                        }
                        
                    } else {
                        console.log('-----')
                    }
                });
                const sortData = data2
                    .sort(function (a, b) {
                        return new Date(b.date) - new Date(a.date);
                    });
                for(var item of sortData) {
                    const { deviceId, date } = item;
                    if (!seen[date]) {
                        seen[date] = [];
                    } else {
                        const found = seen[date].find(e => e.deviceId === deviceId);
                        if (!found) {
                            seen[date].push({
                                deviceId,
                                count: 1
                            })
                        } else {
                            found.count = found.count + 1;
                        }
                    }
                }

                const dataGenerate = [];
                    for (var date in seen) {
                        dataGenerate.push({
                            date: date,
                            user: seen[date].length,
                            conversation: sum(seen[date])
                        })
                    }
    
                    cb(dataGenerate);
            }
        });
    } else {

        const reader = new FileReader()
    
        const sum = (seenDate) => {
            var result = 0;
            for (var item of seenDate) {
                result = result + item.count;
            }
            return result;
        }
    
        reader.readAsArrayBuffer(file)
        reader.onload = () => {
            const buffer = reader.result;
    
            const workbook = new excel.Workbook();
    
            const data = [];
            workbook.xlsx.load(buffer).then(workbook => {
                var sheet = workbook.worksheets[0];
                if (sheet) {
                    sheet.eachRow((row, rowIndex) => {
                        if (rowIndex > 1) {
    
                            var obj = JSON.parse(row.values[8]);
                            data.push(obj);
                        }
                    })
    
                    const sortData = data.map(e => {
                        const date = new Date(e.requestTime);
                        const y = date.getFullYear();
                        const m = date.getMonth() + 1;
                        const d = date.getDate();
                        return ({
                            ...e,
                            date: `${y}-${m}-${d}`
                        })
                    })
                        .sort(function (a, b) {
                            return new Date(b.requestTime) - new Date(a.requestTime);
                        });
    
                    const seen = {};
                    for (var item of sortData) {
                        const deviceId = item.deviceId;
                        const date = item.date;
                        if (!seen[date]) {
                            seen[date] = [];
                        } else {
                            const found = seen[date].find(e => e.deviceId === deviceId);
                            if (!found) {
                                seen[date].push({
                                    deviceId,
                                    count: 1
                                })
                            } else {
                                found.count = found.count + 1;
                            }
                        }
                    }
    
                    const dataGenerate = [];
                    for (var date in seen) {
                        dataGenerate.push({
                            date: date,
                            user: seen[date].length,
                            conversation: sum(seen[date])
                        })
                    }
    
                    cb(dataGenerate);
                    
                }
    
            });
        }
    }
}