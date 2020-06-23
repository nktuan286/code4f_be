const {
  buildSuccObject,
  buildErrObject,
  itemNotFound
} = require('../middleware/utils')

/**
 * Builds sorting
 * @param {string} sort - field to sort from
 * @param {number} order - order for query (1,-1)
 */
const buildSort = (sort, order) => {
  const sortBy = {}
  sortBy[sort] = order
  return sortBy
}

module.exports = {
  /**
   * Hack for mongoose-paginate, removes 'id' from results
   * @param {Object} result - result object
   */
  async cleanPaginationID(result) {
    result.docs.map(element => delete element.id)
    return result
  },

  /**
   * Builds initial options for query
   * @param {Object} query - query object
   */
  async listInitOptions(req) {
    return new Promise(resolve => {
      const order = req.query.order || -1
      const sort = req.query.sort || 'createdAt'
      const sortBy = buildSort(sort, order)
      const page = parseInt(req.query.page, 10) || 1
      const limit = parseInt(req.query.limit, 10) || 5
      const options = {
        sort: sortBy,
        lean: true,
        page,
        limit
      }
      resolve(options)
    })
  },
  /**
   * Checks the query string for filtering records
   * query.filter should be the text to search (string)
   * query.fields should be the fields to search into (array)
   * @param {Object} query - query object
   */
  async checkQueryString(query) {
    return new Promise((resolve, reject) => {
      try {
        if (
          typeof query.filter !== 'undefined' &&
          typeof query.fields !== 'undefined'
        ) {
          const data = {
            $or: []
          }
          const array = []
          // Takes fields param and builds an array by splitting with ','
          const arrayFields = query.fields.split(',')
          // Adds SQL Like %word% with regex
          arrayFields.map(item => {
            array.push({
              [item]: {
                $regex: new RegExp(query.filter, 'i')
              }
            })
          })
          // Puts array result in data
          data.$or = array
          resolve(data)
        } else {
          resolve({})
        }
      } catch (err) {
        console.log(err.message)
        reject(buildErrObject(422, 'ERROR_WITH_FILTER'))
      }
    })
  },

  /**
   * Deletes an item from database by id
   * @param {string} id - id of item
   */
  async deleteItem(id, model) {
    return new Promise((resolve, reject) => {
      model.findByIdAndRemove(id, (err, item) => {
        itemNotFound(err, item, reject, 'NOT_FOUND')
        resolve(buildSuccObject('DELETED'))
      })
    })
  }
}
