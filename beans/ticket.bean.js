class TicketBean{
    id;
    title;
    message;
    status; //  = 'created' | 'pending' | 'done' | 'standby'
    type; // 'bug' | 'request'
    comments;
    author;
    created_at;
    restaurantId;

    constructor(id, title, message, status, type, comments, author,created_at, restaurantId) {
        this.id = id;
        this.title = title;
        this.message = message;
        this.status = status;
        this.type = type;
        this.comments = comments;
        this.author = author;
        this.created_at = created_at;
        this.restaurantId = restaurantId;
    }

}
module.exports = TicketBean;
