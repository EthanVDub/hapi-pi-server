'use strict';

const Hapi = require('@hapi/hapi');
const { Pool, Client } = require('pg');
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
	connectionString: connectionString,
});

const posts = async () => {
	
}

const init = async () => {
	
	const server = Hapi.server({
		port: 3000,
		host: '0.0.0.0'
	});
	
	
	server.route({
		method: 'GET',
		path: '/',
		handler: (request, h) => {
			return 'Hello World!';
		}
	});
	
	server.route({
		method: 'GET',
		path: '/posts/all',
		handler: async (request, h) =>  {
			
			const res = await pool.query('SELECT * FROM post');
			
			if(!res) {
				return h.response('Something went wrong while fetching data').code(500);
			}
			return h.response(res.rows).code(200);
		} 
		
	});
	
	server.route({
		method: 'POST',
		path: '/posts/new',
		handler: async (request, h) => {
			const newPost = {
				title: request.payload.title,
				body: request.payload.body,
				created_on: new Date()
			}
			let err = 'Unable to make post because: ';
			let errCheck = false;
			
			if(!newPost.title) {
				err += '| missing title | ';
				errCheck = true;
			}
			if(!newPost.body) {
				err += '| missing body | ';
				errCheck = true;
			}
			if(!newPost.created_on) {
				err += '| Could not create time stamp | ';
				errCheck = true;
			}
			
			if(errCheck == true) {
				return h.response(err).code(400);
			}
			
			const insertText = 'INSERT INTO post(title, body, created_on) VALUES ($1, $2, $3)';
			const res = await pool.query(insertText, [newPost.title, newPost.body, newPost.created_on]);
			
			if(!res) {
				return h.response('Something went wrong. Post was unable to be saved').code(500);
			}
			
			return h.response('Inserted new post: ' + newPost.title + ": " + newPost.body);
		}
		
		
	});
		
	
	await server.start();
	console.log('Server running on %s', server.info.url);
	console.log('Connected to database: %s', connectionString);
};

process.on('unhandledRejection', (err) => {
	console.log(err);
	pool.end();
	process.exit(1);
});

init();
