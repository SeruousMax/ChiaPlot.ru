let fs = require('fs');

class Config {
    env_file = '.env'
    //url_api = 'http://localhost/api/'
    url_api = 'http://chiaplot.ru/api/'
    version = 7.4
    constructor() {
        this.env = {
            dirs: [],
            auto: false,
            user_id: null,
            user_token: null,
            auto_count: 1
        };
        if (fs.existsSync(this.env_file)) {
            this.env = JSON.parse(fs.readFileSync(this.env_file, 'utf8'));
        } else {
            fs.writeFileSync(this.env_file, JSON.stringify(this.env), 'utf8');
        }
        if (((!this.env.dirs) || (this.env.dirs.length === 0)) && (this.env.patch)) {
            this.env.dirs = [{
                name: this.env.patch
            }];
            this.saveEnv();
        }
        if (!this.env.auto_count) {
            this.env.auto_count = 1;
            this.saveEnv();
        }
    }
    saveEnv() {
        fs.writeFileSync(this.env_file, JSON.stringify(this.env), 'utf8');
    }
}
module.exports = new Config();