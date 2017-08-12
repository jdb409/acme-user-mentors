const Sequelize = require('sequelize');
const faker = require('faker');

const db = new Sequelize(process.env.DATABASE_URL, {
    logging: false
});

const User = db.define('user', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

const Award = db.define('award', {
    award: {
        type: Sequelize.STRING
    }
});

//Associations
Award.belongsTo(User);
User.hasMany(Award);
User.belongsTo(User, { as: 'Mentor' });
User.hasMany(User, { as: 'Mentees', foreignKey: 'MentorId' });

const createUser = (name, mentor) => {
    return User.create({
        name: name
    });
}

const sync = () => {
    return db.sync({ force: true });
}

const seed = () => {
    return Promise.all([createUser('Jon'), createUser('Carolyn'), createUser('Gus')])
        .then(users => {

            return Promise.all([User.generateAward(users[0].id), User.generateAward(users[0].id), User.generateAward(users[1].id), User.generateAward(users[1].id)])
        })
}

//Class Methods
User.findUsersViewModel = () => {
    return User.findAll({
        include: [{ model: Award }, { model: User, as: 'Mentor' }, {model: User, as: 'Mentees'}]
    })
        .then(users => {
            return users.sort(function (a, b) {
                return a.id - b.id;
            });
        });
}

User.destroyById = (id) => {
    return User.findOne({
        where: {
            id: id
        }
    }).then(user => {
        return user.destroy();
    });
}

User.generateAward = (id) => {

    return Award.create({
        award: faker.company.catchPhrase()
    }).then(award => {
        return User.findOne({
            where: {
                id: id
            }
        }).then(user => {
            award.setUser(user);
        });
    });
}

User.removeAward = (userId, awardId) => {
    return Award.findOne({
        where: {
            userId: userId,
            id: awardId
        }
    }).then(award => {
        return award.destroy();
    }).then(() => {
        return Award.findAll({
            where: {
                userId: userId
            }
        })
    }).then(awards => {
        console.log(awards.length);
        if (awards.length < 2) {
            return User.findAll({
                where: {
                    MentorId: userId
                }
            }).then(users => {
                
                users.forEach( (user) => {
                    user.MentorId = null;
                    user.save();
                })
            })
        }

    })
}

User.updateUserFromRequestBody = (userId, mentorId) => {
    return User.findOne({
        where: {
            id: userId
        }
    }).then(user => {
        if (user.MentorId === null) {
            return User.findOne({
                where: {
                    id: mentorId.mentor
                }
            }).then(mentor => {

                user.MentorId = mentor.id;

                return user.save();
            })
        }
        else {
            user.MentorId = null;
            return user.save();
        }
    })
}

module.exports = {
    sync,
    seed,
    models: {
        User
    }
}