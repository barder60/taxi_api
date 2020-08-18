const crypto = require('crypto');

class SecurityUtil {

    /**
     * @param password {string}
     * @returns {string}
     */
    static hashPassword(password) {
        const hash = crypto.createHash('sha256');
        hash.update(password);
        return hash.digest('hex').toString();
    }

    static randomToken() {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(32, (err, buf) => {
                if(err) {
                    reject(err);
                    return;
                }
                resolve(buf.toString('hex'));
            });
        });
    }
}

module.exports = SecurityUtil;
