"use strict";

const ApiGateway = require("moleculer-web");

module.exports = {
	name: "api",
	mixins: [ApiGateway],

	// More info about settings: https://moleculer.services/docs/0.13/moleculer-web.html
	settings: {
		port: process.env.PORT || 3000,

		routes: [{
			path: "/api",

			authentication: true,

			whitelist: [
				// Access to any actions in all services under "/api" URL
				"**"
			],

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
					// const errObj = _.pick(err, ["name", "message", "code", "type", "data"]);
					// res.end(JSON.stringify(errObj, null, 2));
					res.end('NOT FOUND');
				}
				this.logResponse(req, res, err ? err.ctx : null);
			}
		}],

		// Serve assets from "public" folder
		assets: {
			folder: "public"
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
	}
};
