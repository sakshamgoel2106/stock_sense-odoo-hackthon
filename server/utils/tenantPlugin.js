const tenantStorage = require('./tenantStorage');

module.exports = function tenantPlugin(schema) {
  schema.pre(/^find/, function (next) {
    const ownerId = tenantStorage.getStore();
    if (ownerId && !this.getQuery().owner) {
      this.where({ owner: ownerId });
    }
    next();
  });

  schema.pre(/^count/, function (next) {
    const ownerId = tenantStorage.getStore();
    if (ownerId && !this.getQuery().owner) {
      this.where({ owner: ownerId });
    }
    next();
  });

  schema.pre(/^(update|findOneAnd|delete)/, function (next) {
    const ownerId = tenantStorage.getStore();
    if (ownerId && !this.getQuery().owner) {
      this.where({ owner: ownerId });
    }
    next();
  });

  schema.pre('aggregate', function (next) {
    const ownerId = tenantStorage.getStore();
    if (ownerId) {
      this.pipeline().unshift({ $match: { owner: ownerId } });
    }
    next();
  });

  schema.pre('validate', function (next) {
    const ownerId = tenantStorage.getStore();
    if (ownerId && !this.owner) {
      this.owner = ownerId;
    }
    next();
  });

  schema.pre('save', function (next) {
    const ownerId = tenantStorage.getStore();
    if (ownerId && !this.owner) {
      this.owner = ownerId;
    }
    next();
  });

  schema.pre('insertMany', function (next, docs) {
    const ownerId = tenantStorage.getStore();
    if (ownerId) {
      docs.forEach(doc => {
        if (!doc.owner) doc.owner = ownerId;
      });
    }
    next();
  });
};
