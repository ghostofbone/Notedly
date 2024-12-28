const models = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const {
    AuthenticationError,
    ForbiddenError
} = require('apollo-server-express');
require('dotenv').config();

const gravatar = require('../util/gravatar');
const {user} = require("../resolvers/query");

module.exports = {
    newNote: async (parent, args, { models, user }) => {
        if (!user) {
            throw new AuthenticationError('You are not logged in');
        }

        const note = await models.Note.create({
            content: args.content,
            author: new mongoose.Types.ObjectId(user.id),
        });

        // Add the new note to the user's "notes" array
        await models.User.findByIdAndUpdate(
            user.id,
            { $push: { notes: note._id } }, // Add the note ID to the `notes` array
            { new: true }
        );

        return note;
    },
    deleteNote: async (parent, {id}, {models, user}) => {
        if (!user) {
            throw new AuthenticationError('You must be signed in to delete a note');
        }
        const note = await models.Note.findById(id);
        if(note && String(note.author) !== user.id) {
            throw new ForbiddenError("You don't have permissions to delete the note");
        }

        try {
            await models.Note.findOneAndDelete({ _id: id });
            return true;
        } catch (err) {
            return false;
        }
    },
    updateNote: async (parent, {content, id}, {models, user}) => {
        if (!user) {
            throw new AuthenticationError('You are not logged in');
        }
        const note = await models.Note.findById(id);
        if (note && String(note.author) !== user.id) {
            throw new ForbiddenError("You don't have permissions to update the note");
        }

        return await models.Note.findOneAndUpdate(
            {
                _id: id,
            },
            {
                $set: {
                    content,
                }
            },
            {
                new: true,
            }
        )
    },
    toggleFavorite: async (parent, {id}, {models, user}) => {
        if (!user) {
            throw new AuthenticationError('You are not logged in');
        }

        let noteCheck = await models.Note.findById(id);
        const hasUser = noteCheck.favoritedBy.indexOf(user.id);
        console.log(noteCheck.favoritedBy);
        if (hasUser >= 0) {
            return await models.Note.findByIdAndUpdate(
                id,
                {
                    $pull: {
                        favoritedBy: new mongoose.Types.ObjectId(user.id),
                    },
                    $inc: {
                        favoriteCount: -1
                    }
                },
                {
                    new: true,
                }
            )
        } else {
            return await models.Note.findByIdAndUpdate(
                id,
                {
                    $addToSet: {
                        favoritedBy: new mongoose.Types.ObjectId(user.id),
                    },
                    $inc: {
                        favoriteCount: 1
                    }
                },
                {
                    new: true,
                }
            )
        }
    },
    signUp: async (parent, {username, email, password}, {models}) => {
        email = email.trim().toLowerCase();

        const hashed = await bcrypt.hash(password, 10);

        const avatar = gravatar(email);
        try {
            const user = await models.User.create({
                username,
                email,
                avatar,
                password: hashed
            })
            return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        }catch(err) {
            console.log(err)
            throw new Error('Error creating account');
        }
    },
    signIn: async (parent, {username, email, password}, {models}) => {
        if (email) {
            email = email.trim().toLowerCase();
        }
        const user = await models.User.findOne({
            $or: [{ email }, { username }]
        })
        if (!user) {
            throw new AuthenticationError('Error signing in');
        }
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            throw new AuthenticationError('Error signing in');
        }
        return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    }
}