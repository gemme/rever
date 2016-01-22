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
    	provider: 'amazon',
    	key: 'qjeNSMLcy9rpvb90zqB9u9XbS+wEpvCOp8kevwJL',
    	keyId: 'AKIAJ7IPRCCGV2JHFFJA'
    	//provider: "filesystem",
    	//root: "./server/storage"
  	}
};
