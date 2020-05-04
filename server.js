var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());



app.get('/', function(req, res) {
	res.send('Todo API Root ');
});



//GET/ todos/completed=true&q=string
app.get('/todos', function(req, res) {
	var queryParams = req.query;
	var filteredTodos = todos;
	if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
		filteredTodos = _.where(filteredTodos, {
			'completed': true
		});
	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
		filteredTodos = _.where(filteredTodos, {
			'completed': false
		});

	}


	if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
		filteredTodos = _.filter(filteredTodos, function(todo) {
			return todo.description.indexOf(queryParams.q) > -1;
		});
	}

	res.json(filteredTodos);
});
app.get('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedIdTodos = _.findWhere(todos, {
		id: todoId
	});

	// var matchedIdTodos;

	// todos.forEach(function(todo){
	// 	if (todoId === todo.id){
	// 		matchedIdTodos = todo;
	// 	}
	// });
	if (matchedIdTodos) {
		res.json(matchedIdTodos);
	} else {
		res.status(404).send();

	}

});
app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');
	if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
		return res.status(400).send();
	}
	body.description = body.description.trim();
	body.id = todoNextId;
	todoNextId++;

	todos.push(body);
	res.json(body);

});

app.delete('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedIdTodos = _.findWhere(todos, {
		id: todoId
	});


	if (!matchedIdTodos) {
		res.status(404).json('Error!! nothing found in the id!!');
	} else {
		todos = _.without(todos, matchedIdTodos);
		res.json(matchedIdTodos);
	}
});
app.put('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedIdTodos = _.findWhere(todos, {
		id: todoId
	});

	var body = _.pick(req.body, 'description', 'completed');
	var validAttribute = {};


	if (!matchedIdTodos) {
		return res.status(404).send();
	}
	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttribute.completed = body.completed;

	} else if (body.hasOwnProperty('completed')) {
		res.status(404).send();

	}
	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		validAttribute.description = body.description;
	} else if (body.hasOwnProperty('description')) {
		res.status(404).send();
	}


	_.extend(matchedIdTodos, validAttribute);
	res.json(matchedIdTodos);


});
// app.get('/todos/:id', function(req, res){
// 	var todoId = parseInt(req.params.id, 10);
// 	var matchedId;
// 	todos.forEach(function(todo){x
// 		if(todoId=== todo.id){
// 			matchedId = todoId;
// 		}
// 	});
// 	if(matchedId){
// 		res.json(matchedId);
// 	}else{
// 		res.status(404).send();
// 	}
// });



app.listen(PORT, function() {
	console.log('Express listening the port: ' + PORT + '!!!');
});