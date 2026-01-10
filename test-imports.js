const { auth } = require('./src/config/firebase');
console.log('Auth initialized:', !!auth);
const { initializeAppCheck } = require('./src/services/appCheck');
console.log('AppCheck function exists:', !!initializeAppCheck);
