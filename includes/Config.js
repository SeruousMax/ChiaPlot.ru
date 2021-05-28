let fs = require('fs');

class Config {
    env_file = '.env'
    constructor() {
        this.env = {
            patch: ''
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