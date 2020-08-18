const Ticket = require('../models').Ticket;
const mongoose = require('mongoose');

class TicketDao {

    /**
     * Get all tickets for one user
     * @returns {Promise<*>}
     */
    static async getByUserId(userId) {
        return await Ticket.find({$and:[{"author":{$eq:userId}}]})
            .populate({
                path: 'ticket',
                model: 'Ticket',
                select: 'id title message status type comments'
            });
    }
    /**
     * Get one ticket
     * @returns {Promise<*>}
     */
    static async getById(id) {
        return await Ticket.findOne({_id: id})
            .populate({
                path: 'ticket',
                model: 'Ticket',
                select: 'id title message status type comments',
                populate: {
                    path: 'comments',
                    model: 'Comment',
                    select: 'message author'
                }
            });
    }
    /**
     * Get all tickets
     * @returns {Promise<*>}
     */
    static async getAll() {
        return await Ticket.find()
            .populate({
                path: 'ticket',
                model: 'Ticket',
                select: 'id title message status type comments author',
                populate: {
                    path: 'comments',
                    model: 'Comment',
                    select: 'message author'
                }
            });
    }

    /**
     * Get all tickets with any status except "done"
     * Relevant for admin application
     * @returns {Promise<*>}
     */
    static async getOpenedTickets(){
        return await Ticket.find({status: { $ne: "done" }});
    }

    /**
     *
     * @param id
     * @param newStatus
     * @returns {Promise<Ticket|void|undefined>}
     */
    static async updateStatus(id, newStatus){
        if(mongoose.Types.ObjectId.isValid(id)){
            return Ticket.findOneAndUpdate({_id: id}, {status: newStatus},{
                new: true //To return model after update
            });
        }
        return undefined;
    }

}

module.exports = TicketDao;
