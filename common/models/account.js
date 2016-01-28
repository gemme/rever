'use strict';

module.exports = Account => {

    var async = require('async');

    Account.welcome = function(accountId, next){
        // Find Account data
        Account.findById(accountId, (err, account) => {
            if(err) return next(err);

            // Get config environment urls
            var api = Account.app.get('api');
            var dashboard = Account.app.get('dashboard');

            async.waterfall([
                // Generate token
                next => Account.generateVerificationToken(account, (err,token) => {
                    if(err) return next(err);
                    next(null, token);
                }),
                // Send the email
                (token, next) => {
                    Account.app.models.Email.send({
                        to: account.email,
                        from: 'noreply@reverscore.com',
                        subject: 'Confirmation email REVER',
                        template: {
                            name: 'confirm-test',
                            content: [
                                {name: 'borjarever'},
                                {accountId: 'a33b9b8be52fbb1178ece522f8e1dcc5-us12'}
                            ]
                        },
                        merge_language: 'handlebars',
                        merge: true,
                        global_merge_vars: [{
                            name: 'username',
                            content: account.username
                        },{
                            name: 'apiURL',
                            content: api.url
                        },{
                            name: 'userid',
                            content: account.id
                        },{
                            name: 'token',
                            content: token
                        },{
                            name: 'redirect',
                            content: dashboard.url
                        }],
                    },
                    // Save the token as property into account
                    err => {
                        if(err) return next(err);
                        account.verificationToken = token;
                        account.save();
                        next();
                    });
                }],next);
        });
    };
    // Send confirmation email after creating user
    Account.observe('after save', (ctx, next) =>{
        if(!ctx.isNewInstance) return next();
        // If new instance
        Account.welcome(ctx.instance.id, next);
    });

    // Endpoint settings
    Account.remoteMethod(
        'welcome',
        {
          accepts: {arg: 'id', type: 'string', required: true},
          returns: {arg: 'sent', type: 'string'},
          http: {path: '/:id/welcome', verb: 'get'},
          description: 'Send confirmation emails'
        });

};
