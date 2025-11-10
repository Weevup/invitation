// Script pour générer le hash du mot de passe
const bcrypt = require('bcryptjs');

const password = 'admin123';
const hash = bcrypt.hashSync(password, 10);

console.log('Hash généré pour le mot de passe "admin123":');
console.log(hash);
