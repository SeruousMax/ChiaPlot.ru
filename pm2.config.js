module.exports = {
    apps : [
        {
            name: 'ChiaPlot.ru',
            script: 'index.js',
            args: '',
            node_args: '--experimental-worker --max_old_space_size=2000',
            vizion: false,
            env: {
                NODE_ENV: 'development',
                TZ: "Africa/Addis_Ababa"
            },
            env_production: {
                NODE_ENV: 'production',
                TZ: "Africa/Addis_Ababa"
            }
        }
    ]
};
