const log = require('node-file-logger');
const options = {
    timeZone: 'Africa/Addis_Ababa',
    folderPath: './logs/',
    dateBasedFileNaming: true,
    fileNamePrefix: '',
    fileNameExtension: '.log',
    dateFormat: 'YYYY_MM_D',
    timeFormat: 'hh:mm:ss',
}
log.SetUserOptions(options);
class Logs {

    /**
     * Обработка ошибок
     */
    error() {
        let date_error = new Date();
        console.error(date_error.toLocaleString(), arguments);
        log.Fatal(JSON.stringify(arguments));
    }


    /**
     * Warning
     */
    warning(text, dump = null) {
        let date_error = new Date();
        let date_string = date_error.toLocaleString('en-GB', { timeZone: 'Europe/Moscow' });
        console.log(date_string + ' | WARNING | ' + text + (dump ? JSON.stringify(dump) : ''));
        log.Error(text, (dump ? JSON.stringify(dump) : ''));
    }

    /**
     * Информация
     */
    info(text) {
        let date_error = new Date();
        let date_string = date_error.toLocaleString('en-GB', { timeZone: 'Europe/Moscow' });
        console.log(date_string + ' | INFO | ' + text);
        log.Info(text);
    }
}
module.exports = new Logs();