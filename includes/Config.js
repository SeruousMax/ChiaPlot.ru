let fs = require('fs');

class Config {
    env_file = '.env'
    //url_api = 'http://localhost/api/'
    url_api = 'http://chiaplot.ru/api/'
    version = 5.1
    constructor() {
        this.env = {
            patch: '',
            auto: false,
            user_id: null,
            user_token: null
        };
        if (fs.existsSync(this.env_file)) {
            this.env = JSON.parse(fs.readFileSync(this.env_file, 'utf8'));
        } else {
            fs.writeFileSync(this.env_file, JSON.stringify(this.env), 'utf8');
        }
    }
    saveEnv() {
        fs.writeFileSync(this.env_file, JSON.stringify(this.env), 'utf8');
    }
}
module.exports = new Config();