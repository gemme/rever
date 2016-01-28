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




    /*Rev.observe('after save',(ctx, next) => {
        
        var current = loopback.getCurrentContext();
        var accessToken = current.get('accessToken');
        var Account = Rev.app.models.Account;
        var saveOrUpdate = (ctx.instance)? 'instance': 'data';

        var rev = (() =>{

            //We delete unused properties for Rev Model
            var deleteUnusedProperty = (accountId , property) => {
                
                    if (ctx.instance) {
                        ctx.instance.unsetAttribute(property);
                    } else {
                        delete ctx.data[property];
                    }
            };
            //We link type of users coach, owner, collaborators to revs
            var linkUserType = (user,type) => {
                    ctx[saveOrUpdate].accounts.add(
                        user,
                        {type: type},
                        (err, account) => console.log(account)
                    );
                 
            }
            return {
                deleteUnusedProperty: deleteUnusedProperty,
                linkUserType: linkUserType
            }
        })();

        async.parallel({
            addingOwner: () => {      
                //Account.findById(accessToken.userId,(err, model) => {            
                    rev.linkUserType(model.id, "owner");
                });
            },
            addingCoach: () => {
                let coachId = ctx[saveOrUpdate].coach.id;                
                let type = "coach";
                rev.linkUserType(coachId, type);
                rev.deleteUnusedProperty(coachId, type);
            },
            addingCollaborators: () => {
                let type = "collaborator";
                ctx[saveOrUpdate].collaborators.forEach((collaborator) => {
                    rev.linkUserType(collaborator.id, type);
                    rev.deleteUnusedProperty(collaborator.id, type+'s');
                });
            }
        }, function (err, results) {
            console.log(err);
            console.log(results);            
        });
        next();
    });
*/
    //Defining a model hook to delete unused properties and to link models
    /*Rev.afterRemote('create',(ctx, unused, next) => {
        
        var current = loopback.getCurrentContext();
        var accessToken = current.get('accessToken');
        var Account = Rev.app.models.Account;
        //We get the current user id
        Account.findById(accessToken.userId, (err, model) => {
                //We link coaches, collaborators and user to Rev
                console.log(model);
                if (ctx.result.coach) {
                    ctx.result.unsetAttribute('coach');
                }
                if (ctx.result.collaborators) {
                    ctx.result.unsetAttribute('collaborators');
                }
            next();
        });
    });
    */
