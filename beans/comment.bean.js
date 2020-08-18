class CommentBean{
    message;
    isAuthor;

    constructor(message, isAuthor) {
        this.message = message;
        this.isAuthor = isAuthor;
    }

}
module.exports = CommentBean;
