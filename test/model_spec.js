const expect = require('chai').expect;
const db = require('../models/db');
const user = db.models.User;
const award = db.models.Award;

describe('Models', () => {
    beforeEach(() => {
        return db.sync()
            .then(() => {
                return db.seed()
            })
    })

    describe('User model', () => {
        it('seeds data', () => {
            user.findAll()
                .then((users) => {
                    expect(users[0].name).to.equal('Jon');
                    expect(users[2].name).to.equal('Gus');
                });
        });
        it('wont allow duplicates', () => {
            user.create({
                name: 'Jon'
            }).catch(err => {
                expect(err.message).to.equal('Validation error');
            })
        });
    });

    describe('findUsersViewModel', () => {
        it('finds all users', () => {
            return user.findUsersViewModel()
                .then(users => {
                    expect(users.length).to.equal(3);
                })
        });
    });

    describe('destroyById', () => {
        beforeEach(() => {
            return user.destroyById(2);
        });

        it('deletes a row', () => {
            return user.findUsersViewModel()
                .then(users => {
                    expect(users.length).to.equal(2);
                });
        });

        it('deletes a row', () => {
            return user.findOne({
                where: {
                    id: 2
                }
            })
                .then(res => {
                    expect(res).to.equal(null);
                });
        });
    });

    describe('generateAward', () => {
        beforeEach(() => {
            return user.generateAward(3);
        });

        it('creates an award for correct user', () => {
            return user.generateAward(3)
                .then(() => {
                    return award.findOne({
                        where: {
                            userId: 3
                        }
                    }).then(result => {
                        expect(result).to.be.ok;
                    })

                })

        });
    });

    describe('removeAward', () => {
        it('removes an award for correct user', () => {
            return user.removeAward(1, 1)
                .then(() => {
                    return award.findAll({
                        where: {
                            userId: 1
                        }
                    }).then(result => {
                        expect(result.length).to.equal(1);
                    })

                })

        });
    });

    describe('updateUserFromRequestBody', () => {
        beforeEach(() => {
            return user.updateUserFromRequestBody(1, { mentor: 2 })
        })
        it('updates mentors', () => {
            user.findOne({
                where: {
                    id: 1
                }
            }).then(user => {
                expect(user.MentorId).to.equal(2);
            })
        });
        it('removes mentors', () => {
            return user.updateUserFromRequestBody(1, { mentor: 2 })
                .then(() => {
                    return user.findOne({
                        where: {
                            id: 1
                        }
                    })
                        .then(result => {
                            expect(result.MentorId).to.equal(null);
                        })
                })
        });
    });

    });



