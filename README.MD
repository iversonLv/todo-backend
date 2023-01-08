# Todo App MEN backend restful API

This is a todo app MEN backend(nodejs, express, mongodb) restful API.  

The server is backend folder using nodejs, express, mongodb  

- backend port is <http://localhost:5000>  

api url is /api/v1/  

## Roles

- If login as admin, will check the admin dashboard page (example: iversonLv_admin 123123123123)
- If login as normal user, will check the user dashboard page (example: iversonLv 123123123123)

| Roles | Permissions                                                               |
|-------|---------------------------------------------------------------------------|
| Admin | View topOne, topTen todos related datas but not todo details, Delete user |
| User  | CURD its own todos, CRUD its own categories, UR its own profile           |

## Config the env
Please check .env_sample for more detail
| Keys | Values                                                               | Examples |
|-------|---------------------------------------------------------------------------|---|
| TOKEN_SECRET | jwt secret | sdfwedfabcgefgwwdfdsfsdfscvsdsf |
| DB_URI  | Mongodb URI           | mongodb://127.0.0.1:27017/todos?retryWrites=true&w=majority |
| PORT  | API port           | 5000 |

## How to run the app  

- Go to terminal, cd into the server folder
- Run `npm start`
- Or `npm run dev` for dev phase  

## How to generate test data  

- After installing dependencies `npm i`  
- Run `npm run test-data` to populate extra test data.  
It will generate some test users with their todos and categories

## HTTP Code
| Codes | Purposes | Examples |
|-------|--|---------------------------------------------------------------------------|
|200|Ok, update, delete a resource|
|201|Create, signup| |
|400|Bad request| joi validate schema |
|401|Unauthorization| No header authorization|
|403|Forbidden| No admin roles |
|404|Not found| No user, category, todo|
|409|Conflict| username is taken|

## Git commit rule

- Backend_MEN: xxxxxx  
- General: xxxxxx  

## Additional info

- .nvmc is node version for the app
- ./docs/todo-fullstack.postman_environment.json files for import to postman for the API environments
- ./docs/todos.postman_collection.json files for import to postman for the API collections
- [swagger](http://localhost:5000/docs/swagger)
- ![backend database UML](./docs/Todo-Fullstack%20project%20-%20UML.png)
- [trello  for the project management](https://trello.com/b/IHYxgUdU/todo-fullstack-project)
- [trello join link](https://trello.com/invite/b/IHYxgUdU/df7abaf6bf3b1e84b599e246e14d8d78/todo-fullstack-project)
