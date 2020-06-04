const faker = require('faker')
const ObjectID = require('mongodb').ObjectID

module.exports = [
  {
    _id: new ObjectID(),
    name: 'admin',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  {
    _id: new ObjectID(),
    name: 'visitor',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  }
]
