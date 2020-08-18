class FriendsListUsersBean{
    id;
    friends;
    name;

    constructor(friends, id, name) {
        this.friends = friends;
        this.name = name;
        this.id = id;
    }

}
module.exports = FriendsListUsersBean;
