const TicketModel = require('../models').Ticket;
const CoreController = require('./core.controller');
const UserController = require('./user.controller');
const SessionDao = require('../dao').SessionDAO;
const TicketDao = require('../dao').TicketDAO;
const TicketBean = require('../beans').TicketBean;
const CommentBean = require('../beans').CommentBean;
const UserBean = require('../beans').UserBean;

class TicketController extends CoreController {
    /**
     * 
     * @param list
     * @param options
     * @returns {Promise<*>}
     */
    static render(list, options = {}) {
        const populates = [
            {
                path: 'author',
                select: 'name username',
            },
            {
                path: 'users',
                select: 'name username',
            },
            {
                path: 'comments.author',
                select: 'name username',
            },
        ];

        return super.render(list, { ...options, populates })
    }

    /**
     * create a ticket with status created
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void>}
     */
    static async createTicket(req, res, next){
        let data = req.body;
        data.status = 'created';

        const authorizedFields = [
            'title',
            'author',
            'message',
            'emergency',
            'status',
            'users'
        ];
        Promise.resolve()
            .then(() => TicketController.create(data, { authorizedFields }))
            .then(ticket => TicketController.render(ticket))
            .then(ticket => res.status(200).json(ticket))
            .catch(next);
    }

    /**
     * create a support request ticket
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void>}
     */
    static async supportRequest(req, res, next){
        const data = req.body;
        const token = req.params.token;
        const userId = await SessionDao.getUserIDByToken(token);
        if(userId && data){
            const newTicket = {
                message : data.description,
                title: data.object,
                status:'created',
                author: userId,
                type: data.type
            }
            await TicketController.create(newTicket);
            res.status(200).json({
                message: `The ticket has been created`
            })
        }else{
            res.status(500).json({
                message: `An error occurred`
            })
        }
    }

    static async manageTicket(ticket, userId = null){
        let status = "";
        let type = "";
        switch (ticket.status){ // 'created' | 'pending' | 'done' | 'standby'
            case 'created' :
                status = "Créé";
                break;
            case 'pending' :
                status = "En cours de traitement";
                break;
            case 'done' :
                status = "Traité";
                break;
            case 'standby' :
                status = "En attente";
                break;
        }
        switch (ticket.type){ // 'bug' | 'request'
            case 'bug' :
                type = "Bogue";
                break;
            case 'request' :
                type = "Demande";
                break;
            case 'newRestaurant' :
                type = 'Nouveau restaurant'
                break;
            // aura t on d'autre types dans le futur?
        }
        const comments = []
        ticket.comments.forEach(comment => {
            comments.push(new CommentBean(comment.message, JSON.stringify(comment.author) === JSON.stringify(userId)))
        })
        let author = null;
        if(ticket.author.firstName !== undefined){
            author = new UserBean(ticket.author.firstName, ticket.author.lastName)
        }else {
            const smallAuthor = await UserController.getSmallUserById(ticket.author)
            author = new UserBean(smallAuthor.firstName, smallAuthor.lastName)
        }
        return new TicketBean(ticket.id, ticket.title,ticket.message, status, type, comments, author,ticket.created_at, ticket.restaurant);
    }

    /**
     * get tickets for user
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void>}
     */
    static async getTicketsForUser(req, res, next){
        const token = req.params.token;
        const userId = await SessionDao.getUserIDByToken(token);
        if(userId){
            const tickets = await TicketDao.getByUserId(userId)
            const ticketBeans = [];
            for (const ticket of tickets) {
                const ticketBean = await TicketController.manageTicket(ticket, userId)
                ticketBeans.push(ticketBean)
            }
            res.status(200).json(ticketBeans)
        }else{
            res.status(500).json({
                message: `Une erreur est survenue`
            })
        }
    }

    /**
     * get ticket for user
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void>}
     */
    static async getTicketForUser(req, res, next){
        const token = req.params.token;
        const idTicket = req.params.id;
        const userId = await SessionDao.getUserIDByToken(token);
        if(userId){
            const ticket = await TicketDao.getById(idTicket)
            if(JSON.stringify(ticket.author) === JSON.stringify(userId)){ // or else will return false (?)
                const ticketBean = await TicketController.manageTicket(ticket, userId)
                res.status(200).json(ticketBean)
            }else{
                res.status(500).json({
                    message: `Le ticket n'appartient pas à l'utilisateur`
                })
            }
        }else{
            res.status(500).json({
                message: `Une erreur est survenue`
            })
        }
    }

    /**
     * get all tickets
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void>}
     */
    static async getAllTickets(req, res, next){
            const tickets = await TicketDao.getAll();
            if(tickets){
                const ticketsBean = []
                for (const t of tickets) {
                    const ticketBean = await TicketController.manageTicket(t)
                    ticketsBean.push(ticketBean)
                }
                res.status(200).json(ticketsBean)
            }else{
                res.status(500).json({
                    message: 'Aucun tickets'
                })
            }
    }

    /**
     * delete comment of ticket from id ticket and comment id
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void>}
     */
    static async deleteCommentOfTicket(req, res, next) {
    const id = req.params.id;
    const commentId = req.params.comment;

    Promise.resolve()
        .then(() => TicketModel.findById(id).exec())
        .then(ticket => {
            ticket.comments.id(commentId).remove();
            return ticket.save()
        })
        .then(ticket => TicketController.render(ticket))
            .then(ticket => res.json(ticket))
            .catch(next);
    }

    /**
     * Add comment to ticket by post request
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void>}
     */
    static async addCommentToTicket(req, res, next){
    const id = req.params.id;
    const author = req.params.idAuthor;
    const { message } = req.body;

    Promise.resolve()
        .then(() => TicketModel.findById(id))
        .then(ticket => {
            ticket.comments.push({ author, message });
            return ticket.save();
        })
        .then(ticket => TicketController.render(ticket))
        .then(ticket => res.json(ticket))
        .catch(next);
    }

    /**
     * Add comment to ticket by post request
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void>}
     */
    static async addCommentToTicketFromFront(req, res, next){
    const token = req.params.token;
    const { message, idTicket } = req.body;
    const userId = await SessionDao.getUserIDByToken(token);

    if(!message || message === ""){
        res.status(500).json({
            message: `Le commentaire est vide`
        })
    }

    if(userId){
        const ticket = await TicketDao.getById(idTicket)
        const comment = { author:userId, message }
        ticket.comments.push(comment);
        await ticket.save();
        const ticketBean = await TicketController.manageTicket(ticket, userId);
        res.status(200).json(ticketBean);
    }else{
        res.status(500).json({
            message: `Une erreur est survenue`
        })
    }
    }

    static async get_ticket_from_id(req, res, next){
        const id = req.params.id;

        const fields = [
            '_id',
            'author',
            'title',
            'message',
            'emergency',
            'status',
            'tags',
            'users',
            'comments',
            'created_at'
        ];

        Promise.resolve()
            .then(() => TicketController.read(id, { fields }))
            .then(ticket => res.json({ ticket }))
            .catch(next);
    }

    static update(id, data, options) {
        if (data.users) {
            const list = new Set(data.users);
            data.users = [...list];
        }
        return super.update(id, data, options)
    }

    /**
     * Get all opened tickets is there is
     * @returns {Promise<undefined| tickets>}
     */
    static async getOpenTickets(){
        const tickets = await TicketDao.getOpenedTickets();
        if(tickets){
            const ticketsBean = []
            for (const t of tickets) {
                const ticketBean = await TicketController.manageTicket(t)
                ticketsBean.push(ticketBean)
            }
            return ticketsBean;
        }else{

        }
        return undefined;
    }

    /**
     *
     * @returns {Promise<void>}
     */
    static async updateTicketStatus(ticketId, newStatus){
        const isStatusValid = await this.isStatusValid(newStatus);
        if (!ticketId || !isStatusValid){
            return -1;
        }

        const ticket = await TicketDao.updateStatus(ticketId, newStatus);

        if ( ticket ){
            return ticket;
        } else {
            return undefined;
        }
    }

    /**
     * Check if status valid
     * @param status
     * @returns {Promise<undefined|string>}
     */
    static async isStatusValid(status){
        if (status === "done" || status === "pending" || status === "created" || status === "standby"){
            return status;
        }
        return undefined;
    }

}

TicketController.prototype.modelName = 'Ticket';

module.exports = TicketController;
