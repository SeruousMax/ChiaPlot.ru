class Logs {
    /**
     * Обработка ошибок
     */
    error() {
        let date_error = new Date();
        console.error(date_error.toLocaleString(), arguments);
    }


    /**
     * Warning
     */
    warning(text, dump = null) {
        let date_error = new Date();
        let date_string = date_error.toLocaleString('en-GB', { timeZone: 'Europe/Moscow' });
        console.log(date_string + ' | WARNING | ' + text + (dump ? JSON.stringify(dump) : ''));
    }

    /**
     * Информация
     */
    info(text) {
        let date_error = new Date();
        let date_string = date_error.toLocaleString('en-GB', { timeZone: 'Europe/Moscow' });
        console.log(date_string + ' | INFO | ' + text);
    }
}
module.exports = new Logs();