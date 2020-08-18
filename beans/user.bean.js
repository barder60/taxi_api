class UserBean{
    lastName;
    firstName;
    address;
    phone;
    town;
    email;
    postalCode;
    cgu;
    allergens;
    characteristics;
    hasCompletedSituation;
    type;

    constructor(lastName, firstName, address, phone, town, email, postalCode, cgu, hasCompletedSituation, type, id) {
        this.id = id;
        this.lastName = lastName;
        this.firstName = firstName;
        this.address = address;
        this.phone = phone;
        this.town = town;
        this.email = email;
        this.postalCode = postalCode;
        this.cgu = cgu;
        this.hasCompletedSituation = hasCompletedSituation;
        this.type = type;
    }
}
module.exports = UserBean;
