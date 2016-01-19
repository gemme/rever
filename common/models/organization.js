module.exports = function(Organization) {

	Organization.greet = function(msg, cb){
		cb(null, 'Greetings ' + msg);
	};

	Organization.remoteMethod(
		'greet',
		{
			accepts: {arg: 'msg', type: 'string', required: true},
			returns: {arg: 'greeting', type: 'string'},
			http: { path: '/saludos', verb: 'get', status: 203},
			description: 'haber haber'
		});

	Organization.getName = function (req, cb){

		cb(null, 'My fullname ' + req.name + req.lastname);

	};

	Organization.remoteMethod(
		'getName',
		{
			accepts: {arg: 'req', type: 'object', 'http':{source: 'body'}},
			returns: {arg: 'fullname', type: 'string'}
		});
};
