const util = require('util');
const path = require('path');
const fs = require('fs');
const tv4 = require('tv4');

const USERS_SCHEMA = require('../data/user-schema.json');
const DATA_PATH = path.join(__dirname, '..', 'data', 'users-data.json');

const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

const handlers = {
    readAll: async(req, res) => {
        try {
            const usersDataString = await readFile(DATA_PATH, 'utf-8');
            const usersData = JSON.parse(usersDataString);
            console.log(usersDataString);
            const userNames = usersData.users
                .map(entry => ({
                    id: entry.id,
                    username: entry.username,
                }));

            res.json(userNames)

        } catch (err) {
            console.log(err)

            if (err && err.code === 'ENOENT') {
                res.status(404).end();
                return;
            }

            next(err);
        }
    },
    readOne: async(req, res) => {
        const userId = Number(req.params.id);

        try {
            const usersDataString = await readFile(DATA_PATH, 'utf-8');
            const usersData = JSON.parse(usersDataString);

            const entryWithId = usersData.users
                .find(entry => entry.id === userId);

            if (entryWithId) {
                return res.json(entryWithId);
            } else {
                res.status(404).end();
            }

        } catch (err) {
            console.log(err)

            if (err && err.code === 'ENOENT') {
                res.status(404).end();
                return;
            }

            next(err);
        }
    },
    create: async(req, res) => {
        const newUser = req.body;

        try {
            const usersDataString = await readFile(DATA_PATH, 'utf-8');
            const usersData = JSON.parse(usersDataString);

            newUser.id = usersData.nextId;
            usersData.nextId++;

            const isValid = tv4.validate(newUser, USERS_SCHEMA);

            if (!isValid) {
                const error = tv4.error
                console.error(error)

                res.status(400).json({
                    error: {
                        message: error.message,
                        dataPath: error.dataPath
                    }
                })
                return
            }

            usersData.users.push(newUser);

            const newUserDataString = JSON.stringify(usersData, null, '  ');

            await writeFile(DATA_PATH, newUserDataString);

            res.json(newUser);

        } catch (err) {
            console.log(err);

            if (err && err.code === 'ENOENT') {
                res.status(404).end();
                return;
            }

            next(err);
        }

    },
    update: async(req, res) => {
        const idToUpdate = Number(req.params.id);

        const newUser = req.body
        newUser.id = idToUpdate;
        const isValid = tv4.validate(newUser, USERS_SCHEMA)

        if (!isValid) {
            const error = tv4.error;
            console.error(error)

            res.status(400).json({
                error: {
                    message: error.message,
                    dataPath: error.dataPath
                }
            })
            return
        }

        try {
            const usersDataString = await readFile(DATA_PATH, 'utf-8');
            const usersData = JSON.parse(usersDataString);

            const entryToUpdate = usersData.users
                .find(user => user.id === idToUpdate);

            if (entryToUpdate) {
                const indexOfUser = usersData.users
                    .indexOf(entryToUpdate);
                usersData.users[indexOfUser] = newUser;

                const newUserDataString = JSON.stringify(usersData, null, '  ');

                await writeFile(DATA_PATH, newUserDataString);

                res.json(newUser);
            } else {
                res.json(`no entry with id ${idToUpdate}`);
            }

        } catch (err) {
            console.log(err);

            if (err && err.code === 'ENOENT') {
                res.status(404).end();
                return;
            }

            next(err);
        }
    },
    delete: async(req, res) => {
        const idToDelete = Number(req.params.id);

        try {
            const usersDataString = await readFile(DATA_PATH, 'utf-8');
            const usersData = JSON.parse(usersDataString);

            const entryToDelete = usersData.users
                .find(user => user.id === idToDelete);

            if (entryToDelete) {

                usersData.users = usersData.users.filter(user => user.id !== entryToDelete.id);

                const newUserDataString = JSON.stringify(usersData, null, '  ');

                await writeFile(DATA_PATH, newUserDataString);

                res.json(entryToDelete);
            } else {
                res.send(`no entry with id ${idToDelete}`);
            }

        } catch (err) {
            console.log(err);

            if (err && err.code === 'ENOENT') {
                res.status(404).end();
                return;
            }

            next(err);
        }
    },
};

module.exports = handlers;