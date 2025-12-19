
const Supervisor = require('./Supervisor');

// Create a single, shared instance of the Supervisor
const supervisor = new Supervisor();

module.exports = supervisor;
