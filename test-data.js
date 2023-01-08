const monk = require('monk')
const db = monk('localhost/todos')

// random date
const momentRandom = require("moment-random");

const endDate = "2020-11-19T20:30";
const startDate = "2015-01-19T21:30";



// models
const users = db.get('users')
const todos = db.get('todos')
const categories = db.get('categories')

// generate array data
const generate = (arr) => {
  return arr[parseInt(Math.random()*arr.length)];
}

// list of name
const firstnameArr = ["Adam", "Alex", "Aaron", "Ben", "Carl", "Dan", "David", "Edward", "Fred", "Frank", "George", "Hal", "Hank", "Ike", "John", "Jack", "Joe", "Larry", "Monte", "Matthew", "Mark", "Nathan", "Otto", "Paul", "Peter", "Roger", "Roger", "Steve", "Thomas", "Tim", "Ty", "Victor", "Walter"]
const lastnameArr = ["Anderson", "Ashwoon", "Aikin", "Bateman", "Bongard", "Bowers", "Boyd", "Cannon", "Cast", "Deitz", "Dewalt", "Ebner", "Frick", "Hancock", "Haworth", "Hesch", "Hoffman", "Kassing", "Knutson", "Lawless", "Lawicki", "Mccord", "McCormack", "Miller", "Myers", "Nugent", "Ortiz", "Orwig", "Ory", "Paiser", "Pak", "Pettigrew", "Quinn", "Quizoz", "Ramachandran", "Resnick", "Sagar", "Schickowski", "Schiebel", "Sellon", "Severson", "Shaffer", "Solberg", "Soloman", "Sonderling", "Soukup", "Soulis", "Stahl", "Sweeney", "Tandy", "Trebil", "Trusela", "Trussel", "Turco", "Uddin", "Uflan", "Ulrich", "Upson", "Vader", "Vail", "Valente", "Van Zandt", "Vanderpoel", "Ventotla", "Vogal", "Wagle", "Wagner", "Wakefield", "Weinstein", "Weiss", "Woo", "Yang", "Yates", "Yocum", "Zeaser", "Zeller", "Ziegler", "Bauer", "Baxster", "Casal", "Cataldi", "Caswell", "Celedon", "Chambers", "Chapman", "Christensen", "Darnell", "Davidson", "Davis", "DeLorenzo", "Dinkins", "Doran", "Dugelman", "Dugan", "Duffman", "Eastman", "Ferro", "Ferry", "Fletcher", "Fietzer", "Hylan", "Hydinger", "Illingsworth", "Ingram", "Irwin", "Jagtap", "Jenson", "Johnson", "Johnsen", "Jones", "Jurgenson", "Kalleg", "Kaskel", "Keller", "Leisinger", "LePage", "Lewis", "Linde", "Lulloff", "Maki", "Martin", "McGinnis", "Mills", "Moody", "Moore", "Napier", "Nelson", "Norquist", "Nuttle", "Olson", "Ostrander", "Reamer", "Reardon", "Reyes", "Rice", "Ripka", "Roberts", "Rogers", "Root", "Sandstrom", "Sawyer", "Schlicht", "Schmitt", "Schwager", "Schutz", "Schuster", "Tapia", "Thompson", "Tiernan", "Tisler"]
const colorArr = ['#ff00ff','#ffee09', '#1200ff','#ffffff','#00ff00','#ff0000']
// password bcrypt
const bcrypt = require('bcryptjs')
const saltRounds = 10;
// Hashed password
const bcryptPassword = (password) => {
  return bcrypt.hash(password.trim(), saltRounds)
}

const addData = async (userNum, theirTodosNum, theirCategoriesNum) => {
  // generate 5 users
  for (var i = 0; i < userNum; i++) {
    // generate 10 users
    await users.insert({
        username: `${generate(firstnameArr)}_${generate(lastnameArr)}_${parseInt(Math.random() * 100)}g${parseInt(Math.random() * 100)}_${parseInt(Math.random() * 100)}`,
        password: await bcryptPassword('123123123123'),
        roles: ['user'],
        categories: [],
        todos: [],
        createdOn: new Date(),
        updatedOn: new Date(),
        __v: 0
    }).then(user => {
      let categoriesIdArr = []
      // after the user insert, direct add 5 cateogries for this user
      for (var j = 0; j < theirCategoriesNum; j++) {
        const oid = monk.id()
        categories.insert({
          _id: oid,
          color: generate(colorArr),
          title: `Category-${parseInt(Math.random() * 10)}g${parseInt(Math.random() * 10)}_${parseInt(Math.random() * 10)}`,
          createdOn: new Date(),
          createdBy: monk.id(user._id),
          updatedOn: new Date(),
          updatedBy: monk.id(user._id),
          __v: 0
        })
        users.update({_id: monk.id(user._id)}, {$push: { categories: oid}})
        categoriesIdArr.push(oid)
      }
      // after the user insert, direct add 10 todos for this user
      for (var j = 0; j < theirTodosNum; j++) {
        
        // after the user insert, direct add 10 todos for this user
        const oid = monk.id()

        const startString = momentRandom(endDate, startDate);
        const endString = momentRandom(endDate, startString); // ensure end time is later than start, so end time start time will be >= start
        const start = new Date(startString._i)
        const end = new Date(endString._i)
        todos.insert({
          _id: oid,
          category: generate(categoriesIdArr),
          isComplete: generate([true, false]),
          isImportant: generate([true, false]),
          notes: '',
          title: `Todo-${parseInt(Math.random() * 10)}g${parseInt(Math.random() * 10)}_${parseInt(Math.random() * 10)}`,
          start: start,
          end: end,
          createdOn: new Date(),
          createdBy: monk.id(user._id),
          updatedOn: new Date(),
          updatedBy: monk.id(user._id),
          __v: 0
        })
        
        users.update({_id: monk.id(user._id)}, {$push: { todos: oid}})
      }
    })
  }
}
// generate 1-5 users and each of them with 1-10 todos
addData(20, 10, 5).then(() => {
  console.log('Done')
  db.close()
  process.exit(1)
}).catch((e) => {
  console.log(e)
  process.exit(1)
})
