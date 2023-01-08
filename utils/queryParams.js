/** many logic is prevent user manually input the queryParams in URL/postman, in order to get safe edge data, response data */

const queryParamsShared = (totalCount, page, perPage, sortOrder) => {
  /** edge case */
  sortOrder = sortOrder.toLowerCase() !== 'desc' ? 'asc' : 'desc'
  // page should be > 0
  page = parseInt(page) <= 0 ? 1 : page
  let newPage = Math.ceil(totalCount / parseInt(perPage)) //eg: 10/9 = 2 but I manually set page 3

  // if set a page greate than newPage, set page = newPage or that page will be empty
  if (newPage < page) { page = newPage }
  // if pageSize less than or equal 0 or greater than totalCount, display totalCount and automatically set page to 1
  if (parseInt(perPage) <= 0 || parseInt(perPage) >= totalCount) {
    perPage = totalCount
    page = 1 //if not set 1, then page will show empty
  } else {
    perPage = parseInt(perPage)
    page = parseInt(page)
  }

  return { totalCount, page, perPage, sortOrder } //return the object for further usage
}

module.exports = queryParamsShared