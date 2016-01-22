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

	//Hook to save organizations with my own parameters
	Organization.saveMe = (params, cb) => {
		Organization.create(params, (err, model) => cb(null, model));
	};

	Organization.remoteMethod(
		'saveMe',
		{
			accepts: {arg: 'req', type: 'object', 'http':{source: 'body'}, required: true},
			returns: {arg: 'res', type: 'object', 'http':{source: 'body'}},
		});

	Organization.observe(
		'before save',
		(ctx, next) => {
			//console.log(ctx);
			//console.log(next);
			if(ctx.instance){
				ctx.instance.haber = ctx.instance.haber + ' beforeSAVE!!!!!' 
			}
			next();
		});

	Organization.observe(
		'after save',
		(ctx, next) => {
			ctx.instance.unsetAttribute('haber');
			next();
		});

};
