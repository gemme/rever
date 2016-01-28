'use strict';

module.exports = Model => {
    /**
    * After Reset Password
    *
    **/
    Model.on('resetPasswordRequest', info => {
        if(!info.accessToken.id) return; // we may want to log this
        // Get url from config file
        var dashboard = Model.app.get('dashboard');
        Model.app.models.Email.send({
            to: info.email,
            from: 'noreply@reverscore.com',
            subject: 'Password Recovery',
            template: {
                name: 'reset-test',
                content: [
                    {name: 'borjarever'},
                    {accountId: 'a33b9b8be52fbb1178ece522f8e1dcc5-us12'}
                ]
            },
            merge_language: 'handlebars',
            merge: true,
            global_merge_vars: [{
                name: 'account_name',
                content: info.user.username
            },{
                name: 'dashboard_url',
                content: dashboard.url
            },{
                name: 'token_id',
                content: info.accessToken.id
            }],
        })
    });
    /**
    * Reset Password
    **/
    Model.changePassword = (token_id, password, confirm, next) => {
        if(!password || password=='' || !confirm || confirm=='') return next(new Error('Invalid Credentials'));
        Model.app.models.AccessToken.findById(token_id, (err, AccessToken) => {
            if(err) return next(err);
            if(!AccessToken) return next(new Error('Invalid or Expired Access Token'));
            Model.findById(AccessToken.userId, (err, instance) => {
                if(err) return next(err);
                instance.password = password;
                instance.save();
                next();
            });
        });
    };
    Model.remoteMethod(
        'changePassword',
        {
            accepts: [
                {arg: 'token_id', type: 'string', required: true},
                {arg: 'password', type: 'string', required: true},
                {arg: 'confirm',  type: 'string', required: true}
            ],
            returns: [
                {arg: 'account', type: 'object'}
            ],
            http: {path: '/change-password', verb: 'post'}
        }
    );
};