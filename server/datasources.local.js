// messenger-api/server/datasources.local.js
module.exports = {
    // DB Datasource
    db: {
        name: 'db',
        connector: 'mongodb',
        url: 'mongodb://reverUser:Rev3r@127.0.0.1/rever'
    },
  	storage: {
    	name: "storage",
    	connector: "loopback-component-storage",
    	provider: 'filesystem',
    	root: './server/storage'
  	}
};
