module.exports = function (Model) {
    'use strict';
    Model.observe('before save', function updateSave(ctx, next) {
        if (ctx.instance) {
            ctx.instance.createdAt = new Date();
            ctx.instance.updatedAt = new Date();
        } else {
            ctx.data.createdAt = new Date();
            ctx.data.updatedAt = new Date();
        }
        next();
    });
};