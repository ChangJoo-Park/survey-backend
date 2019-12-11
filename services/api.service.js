"use strict";
const _ = require('lodash')

const ApiGateway = require("moleculer-web")
const IO = require('socket.io')

module.exports = {
	name: "api",
	mixins: [ApiGateway],

	// More info about settings: https://moleculer.services/docs/0.13/moleculer-web.html
	settings: {
		port: process.env.PORT || 3000,

		routes: [{
			path: "/api",

			authentication: true,

			aliases: {
				// Login
				"POST /users/signin": "v1.www.signin",
				"POST /users/signup": "v1.www.signup",

				// Users
				// "REST /users": "users",
				// App Level Statistics
				'GET /app-stats': 'v1.www.app-stats',
				// Current user
				"GET /me": "v1.www.me",
				"PUT /me": "update-me",

				// Participate a survey
				"GET /surveys/:surveyId/participate": "v1.www.participants-survey",
				"POST /surveys/:surveyId/participate": "v1.www.participate-survey",

				// Surveys
				"GET /me/surveys": "v1.www.get-surveys-by-author",
				"POST /surveys": "v1.www.create-survey",
				"GET /surveys/:surveyId": "v1.www.get-survey",
				"PUT /surveys/:surveyId": "v1.www.update-survey",
				"DELETE /surveys/:surveyId": "v1.www.remove-survey",
			},

			cors: true,

			bodyParsers: {
				json: {
					strict: false
				},
				urlencoded: {
					extended: false
				}
			},

			onError(req, res, err) {
				// Return with the error as JSON object
				res.setHeader("Content-type", "application/json; charset=utf-8");
				res.writeHead(err.code || 500);

				if (err.code == 422) {
					let o = {};
					err.data.forEach(e => {
						let field = e.field.split(".").pop();
						o[field] = e.message;
					});

					res.end(JSON.stringify({ errors: o }, null, 2));
				} else {
					const errObj = _.pick(err, ["name", "message", "code", "type", "data"]);
					res.end(JSON.stringify(errObj, null, 2));
				}
				this.logResponse(req, res, err ? err.ctx : null);
			}
		}],

		// Serve assets from "public" folder
		assets: {
			folder: "public"
		}
	},
	events: {
		"author/*"(payload, sender, event) {
			if (!this.io) { return }
			this.io.emit(event, { payload, sender, event });
		},
		"someone-take-a-survey/*"(payload, sender, event) {
			if (!this.io) { return }
			this.io.emit(event, { sender, event, payload });
		}
	},
	methods: {
		/**
		 * Authorize the request
		 *
		 * @param {Context} ctx
		 * @param {Object} route
		 * @param {IncomingRequest} req
		 * @returns {Promise}
		 */
		authenticate(ctx, route, req, res) {
			let accessToken = req.headers["access_token"];

			if (accessToken) {
				return ctx.call('user.resolveToken', { token: accessToken })
					.then(user => Promise.resolve(user))
					.catch(error => {
						// Malformed jwt
						return Promise.resolve(null)
					})
			} else {
				// anonymous user
				return Promise.resolve(null);
			}
		}
	},
	started () {
		// Create a Socket.IO instance, passing it our server
		this.io = IO.listen(this.server);

		// Add a connect listener
		this.io.on("connection", client => {
			this.logger.info("Client connected via websocket!");
			client.on("disconnect", () => {
				this.logger.info("Client disconnected");
			});
		});
	}
};
