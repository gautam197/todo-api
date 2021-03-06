var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var Sequelize = require('sequelize');
var db = require('./db.js');
const Op = Sequelize.Op;
var app = express();
var bcrypt = require('bcrypt');
PORT = process.env.PORT || 3000;
var todo = [];
var todoNextId = 1;

app.use(bodyParser.json());



app.get('/', function(req, res) {
	res.send('Todo API Root ');
});



//GET/ todos/completed=true&q=string
app.get('/todo', function(req, res) {
	var query = req.query;
	var where = {};
	if (query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	} else if (query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	}
	if (query.hasOwnProperty('q') && query.q.length > 0) {
		where.description = {
			[Op.like]: '%' + query.q + '%'
		};
	}
	db.todo.findAll({
		where: where
	}).then(function(todos) {
		res.json(todos);
	}, function(e) {
		res.status(500).send();
	});



	// var filteredTodos = todos;
	// if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
	// 	filteredTodos = _.where(filteredTodos, {
	// 		'completed': true
	// 	});
	// } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
	// 	filteredTodos = _.where(filteredTodos, {
	// 		'completed': false
	// 	});

	// }


	// if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
	// 	filteredTodos = _.filter(filteredTodos, function(todo) {
	// 		return todo.description.indexOf(queryParams.q) > -1;
	// 	});
	// }

	// res.json(filteredTodos);
});
app.get('/todo/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	db.todo.findByPk(todoId).then(function(todo) {
		if (!!todo) {
			res.json(todo.toJSON());
		} else {
			res.status(404).send('Id could not the found!!!');
		}

	}, function(e) {
		res.status(500).send();

	});
	// var matchedIdTodos = _.findWhere(todos, {
	// 	id: todoId
	// });

	// // var matchedIdTodos;

	// // todos.forEach(function(todo){
	// // 	if (todoId === todo.id){
	// // 		matchedIdTodos = todo;
	// // 	}
	// // });
	// if (matchedIdTodos) {
	// 	res.json(matchedIdTodos);
	// } else {
	// 	res.status(404).send();

	// }

});
app.post('/todo', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');


	db.todo.create(body).then(function(todo) {
		res.json(todo.toJSON());
	}, function(e) {
		res.status(400).json(e);
	});



	// if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
	// 	return res.status(400).send();
	// }
	// body.description = body.description.trim();
	// body.id = todoNextId;
	// todoNextId++;

	// todos.push(body);
	// res.json(body);

});

app.delete('/todo/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	db.todo.destroy({
		where: {
			id: todoId
		}
	}).then(function(myvar) {
		if (myvar === 0) {
			res.status(404).json({
				error: 'No todo found!!'
			})
		} else {
			res.status(204).send();
		}

	}, function() {
		res.status(500).send();
	});
});
app.put('/todo/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);

	var body = _.pick(req.body, 'description', 'completed');
	var attribute = {};


	if (body.hasOwnProperty('completed')) {
		attribute.completed = body.completed;

	}
	if (body.hasOwnProperty('description')) {
		attribute.description = body.description;
	}
	db.todo.findByPk(todoId).then(function(todo) {
		if (todo) {
			todo.update(attribute).then(function(todo) {
				res.json(todo.toJSON());
			}, function(e) {
				res.status(400).json(e);
			});

		} else {
			res.status(404).send();
		}
	}, function() {
		res.status(500).send();
	});

});

app.post('/user', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body).then(function(user) {
		res.json(user.toPublicJSON());
	}, function(e) {
		res.status(400).json(e);
	});

});


app.post('/user/login', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');
	if (typeof body.email !== 'string' || typeof body.password !== 'string') {
		return reject();
	}
	db.user.findOne({
		where: {
			email: body.email
		}
	}).then(function(user) {
		if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
			return res.status(401).send();
		}
		var token = user.generateToken('authentication');
		if (token) {
			res.header('Auth', token).json(user.toPublicJSON());
		} else {
			return res.status(401).send();

		}

	}, function(e) {
		res.status(500).send();

	});



});

db.sequelize.sync({
	force: true
}).then(function() {
	app.listen(PORT, function() {
		console.log('Express listening the port: ' + PORT + '!!!');
	});
});