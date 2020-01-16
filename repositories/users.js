const fs = require('fs');
const crypto = require('crypto');
const util = require('util');
const Repository = require('./repository')

const scrypt = util.promisify(crypto.scrypt)


class UsersRepository extends Repository {
    async create(attrs){
        // attrs is an object that represents the user and always has {email: '', password: ''}
        attrs.id = this.randomId();
        const salt = crypto.randomBytes(8).toString('hex');
        const buf = await scrypt(attrs.password, salt, 64)
        const records = await this.getAll();
        const record = {
            ...attrs,
            password: `${buf.toString('hex')}.${salt}`
        }
        records.push(record);
        await this.writeAll(records);
        return record;
    }
    async comparePasswords(saved, supplied){
        //saved is the password stored in our database // 'hashed.salt'
        //supplied is the password given by the user trying to signin
        // const result = saved.split('.');
        // const hashed = result[0];
        // const salt = result[1];
        const [hashed, salt] = saved.split('.');
        const hashedSuppliedBuf = await scrypt(supplied, salt, 64);
        return hashed === hashedSuppliedBuf.toString('hex');
   }
};

module.exports = new UsersRepository('users.json');