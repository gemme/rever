'use strict';

module.exports = function (Rev) {

    var async = require('async');
    
    Rev.observe('after save', (ctx, next) => {
        // Verify for new account relationships
        if (!ctx.instance.owner && 
            !ctx.instance.coach && 
            !ctx.instance.collaborators) {
                return next();
        }
        // Link Account with provided Rev
        var link = (account, type, next) => {
            Rev.app.models.AccountRev.findOne({
                where: {
                    revId: ctx.instance.id,
                    type: type
                }
            }, (err, accountRev) => {
                if (err) return next(err);
                if (!accountRev) {
                    return ctx.instance.accounts.add(account.id, { type: type }, next);
                };
                ctx.instance.accounts.destroyAll({ type: type }, err => {
                    if (err) return next(err);
                    ctx.instance.accounts.add(account.id, { type: type }, next);
                });
            })
        };
        // Workflow
        async.parallel([
            // Set Owner
            next => {
                if (!ctx.instance.owner) return next();
                link(ctx.instance.owner, 'owner', next);
            },
            // Set Coach
            next => {
                if (!ctx.instance.coach) return next();
                link(ctx.instance.coach, 'coach', next);
            },
            // Set Collaborators
            next => {
                if (!ctx.instance.collaborators) return next();
                ctx.instance.accounts.destroyAll(err => {
                    if (err) return next(err);
                    async.each(
                        ctx.instance.collaborators,
                        (collaborator, next) =>
                            ctx.instance.accounts.add(collaborator.id, {type: 'collaborator'}, next),
                        next
                    )
                });
            }
        ], err => {
            if (err) { return next(err); }
            if (ctx.instance.owner) ctx.instance.unsetAttribute('owner');
            if (ctx.instance.coach) ctx.instance.unsetAttribute('coach');
            if (ctx.instance.collaborators) ctx.instance.unsetAttribute('collaborators');
            ctx.instance.save(next);
        });
    });
};
