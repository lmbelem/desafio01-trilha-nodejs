const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user){
    return response.status(400).json({error: "User not found"});
  }

  request.user = user
  
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some( user => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists!" })
  }

  user = {
    id: uuidv4(),
    name,
    username,
    todos:[]
  };
  users.push(user);
  
  return response.status(201).send(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const todo_for_update = user.todos.find( todo => todo.id === id);

  if (!todo_for_update){
    return response.status(404).json({error: "ToDo not found"})
  }

  todo_for_update.title = title;
  todo_for_update.deadline = new Date(deadline);

  return response.status(201).json(todo_for_update)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  
  const todo_done = user.todos.find( todo => todo.id === id);

  if (!todo_done){
    return response.status(404).json({error: "ToDo not found"})
  }

  todo_done.done = true;
  return response.json(todo_done);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo_delete = user.todos.find( todo => todo.id === id);

  if (!todo_delete){
    return response.status(404).json({error: "ToDo not found"})
  }

  const index_todo_delete = user.todos.findIndex( todo_index => todo_index.id === todo_delete.id);

  user.todos.splice(index_todo_delete, 1)

  return response.status(204).json();

});

module.exports = app;