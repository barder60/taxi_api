class Util {

    /**
     * dateNow
     * get and format the current datetime
     */
    static dateNow(){
        const dateNow = new Date();
        const day = dateNow.getDate();
        let month = dateNow.getMonth();
        const year = dateNow.getFullYear();
        const hour = dateNow.getHours();
        const minutes = dateNow.getMinutes();
        const seconds = dateNow.getSeconds();
        month += 1;
        return this.formatDigits(day) + '/' + this.formatDigits(month) + '/' + year + ' ' +
            this.formatDigits(hour) + ':' + this.formatDigits(minutes) + ':' + this.formatDigits(seconds);
    }

    /**
     * Return the number to digit format
     * @param number
     * @returns {string}
     */
    static formatDigits(number){
        if(number < 10) {
            number = ('0' + number);
        }
        return number;
    }

    /**
     *
     * @param min
     * @param max
     * @returns {number}
     */
    static getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

}

module.exports = Util;
