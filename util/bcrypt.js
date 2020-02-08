const bcrypt = require('bcryptjs');
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';

module.exports = {
    toHash(password){
        return new Promise((res,rej) => {
            bcrypt.hash(password, saltRounds, function(err, hash) {
                // Store hash in your password DB.
                if(err) rej(err);
                else res(hash);
            });
        })
    },
    compare(password,hash){
        return new Promise((res,rej) => {
            bcrypt.compare(password,hash,(err,same) =>{
                if(err || !same) rej(err);
                else res(same);
            })
        })
    },
    toHashSync(password){
        return bcrypt.hashSync(password,saltRounds);
    },
    compareSync(password,hash){
        return bcrypt.compareSync(password,hash);
    }
    
}
