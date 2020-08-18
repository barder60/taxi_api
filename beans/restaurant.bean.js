class RestaurantBean{
    id;
    name;
    type;
    address;
    city;
    website;
    postalCode;
    characteristics;
    allergens;

    constructor(id, name, types, address, city, website, postalCode, characteristics, allergens) {
        this.id = id;
        this.name = name;
        this.type = "";
        if(types){
            types.forEach((t, index) => this.type += index !== types.length -1 ? t.name + ", " : t.name)
            if(types.length > 0){
                this.type.slice(0, -2)
            }
        }
        this.address = address;
        this.city = city;
        this.website = website;
        this.postalCode = postalCode;
        if(characteristics && characteristics.length > 0){
            const formattedCharacteristics = []
            characteristics.forEach(char => formattedCharacteristics.push(char.name))
            this.characteristics = formattedCharacteristics;
        }
        if(allergens && allergens.length > 0){
            const formattedAllergens = []
            allergens.forEach(a => formattedAllergens.push(a.name))
            this.allergens = formattedAllergens;
        }
    }
}
module.exports = RestaurantBean;
