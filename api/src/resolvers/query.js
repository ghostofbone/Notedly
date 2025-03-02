const models = require("../models");
const mongoose = require("mongoose");


module.exports = {
    notes: async (parent, args, {models}) => {
        return await models.Note.find();
    },
    note: async (parent, args, {models}) => {
        return await models.Note.findById(args.id);
    },
    user: async (parent, {username}, {models}) => {
        return await models.User.findOne({ username });
    },
    users: async (parent, args, {models}) => {
        return await models.User.find();
    },
    me: async (parent, args, {models, user}) => {
        return await models.User.findById(user.id);
    },
    noteFeed: async (parent, { cursor }, { models }) => {
        const limit = 10; // Pagination limit
        let hasNextPage = false;

        // Base query
        let cursorQuery = {};
        if (cursor && !mongoose.Types.ObjectId.isValid(cursor)) {
            throw new Error("Invalid cursor");
        }
        if (cursor) {
            cursorQuery = { _id: { $lt: cursor } };
        }

        try {
            // Query notes and populate author
            let notes = await models.Note.find(cursorQuery)
                .populate("author") // Ensure author is populated
                .sort({ _id: -1 })
                .limit(limit + 1);

            // Filter out notes with null authors or undefined entries
            notes = notes.filter(note => note && note.author);

            // Handle pagination
            if (notes.length > limit) {
                hasNextPage = true;
                notes = notes.slice(0, -1);
            }

            const newCursor = notes.length > 0 ? notes[notes.length - 1]._id : "";

            return {
                notes,
                cursor: newCursor,
                hasNextPage
            };
        } catch (error) {
            console.error("Error in noteFeed resolver:", error);
            throw new Error("Failed to fetch note feed");
        }
    }

}