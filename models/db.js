const Sequelize = require('sequelize');
const faker = require('faker');

const db = new Sequelize(process.env.DATABASE_URL, {
    logging: false
});

const User = db.define('user', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    mentor: {
        type: Sequelize.STRING
    },
    awards: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: []
    }
});


const createUser = (name, mentor, awards) => {
    return User.create({
        name: name,
        mentor: mentor || 'Gus',
        awards: awards || ['Greatest Guy', 'Cool Dude']
    });
}

const sync = () => {
    return db.sync({ force: true });
}

const seed = () => {
    return Promise.all([createUser('Jon')], createUser('Carolyn', 'Jon', ['Cool Chick']));
}

//Class Methods
User.findUsersViewModel = () => {
    return User.findAll()
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
    return User.findOne({
        where: {
            id: id
        }
    }).then(user => {
        return user.update({
            awards: Sequelize.fn('array_append', Sequelize.col('awards'), faker.company.catchPhrase())
        }).then(user => {
            return user;
        });
    });
}

User.removeAward = (userId, awardId) => {
    return User.findOne({
        where: {
            id: userId
        }
    }).then(user => {
        user.awards.splice(awardId, 1);
        user.changed('awards', true);
        return user.save();
    }); 
}

    module.exports = {
        sync,
        seed,
        models: {
            User
        }
    }