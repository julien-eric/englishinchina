const settings = require('simplesettings');

let Database = function() {};

Database.prototype.getUrl = function() {
  switch (settings.get('environment')) {
    case 'development':
      return settings.get('databaseUrl').urldev;
      break;
    case 'production':
      return settings.get('databaseUrl').url;
      break;
  }
};


module.exports = new Database();
