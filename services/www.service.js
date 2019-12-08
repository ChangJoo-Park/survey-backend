"use strict";

const { MoleculerClientError } = require("moleculer").Errors;

/**
 * www service
 */
module.exports = {

	name: "www",
	hooks: {
		before: {
			'*': [function (ctx) {
				if (ctx.action.auth && !ctx.meta.user) {
					return Promise.reject(new MoleculerClientError("Please Login!", 422, "", [{ field: "user", message: "not found" }]));
				} else {
					return Promise.resolve(ctx)
				}
			}],
			['me']: [
				function (ctx) {
					const { user } = ctx.meta
					if (!user) {
						return Promise.reject(new MoleculerClientError("Please Login!", 422, "", [{ field: "user", message: "not found" }]));
					}
					return true
				}
			]
		},
	},
	/**
	 * Service settings
	 */
	settings: {},

	/**
	 * Service metadata
	 */
	metadata: {},

	/**
	 * Service dependencies
	 */
	dependencies: [],

	/**
	 * Actions
	 */
	actions: {
		'signin': {
			auth: true,
			handler(ctx) {
				const { user } = ctx.params
				return ctx.call('user.login', { user })
			}
		},
		'signup'(ctx) {
			const { user } = ctx.params
			return ctx.call('user.create', { user })
		},
		'me': {
			handler(ctx) {
				const { user } = ctx.meta
				return Promise.resolve(user)
			}
		},
		// TODO
		'update-me': {
			handler(ctx) {
				return ctx.call('user.list')
			}
		},
		'get-public-surveys'(ctx) {
			return ctx.call('survey.find', { query: { public: true } })
		},
		'get-private-surveys'(ctx) {
			return ctx.call('survey.find', { query: { public: false } })
		},
		'create-survey'(ctx) {
			const { survey } = ctx.params
			return ctx.call('survey.insert', { survey })
		},
		'update-survey'(ctx) {
			const { survey } = ctx.params
			return ctx.call('survey.insert', { survey })
		},
		'delete-survey'(ctx) {
			const { id } = ctx.params
			return ctx.call('survey.remove', { id })
		},
	},

	/**
	 * Events
	 */
	events: {
		"some.thing"(payload) {
			this.logger.info("Something happened", payload);
		}
	},

	/**
	 * Methods
	 */
	methods: {

	},

	/**
	 * Service created lifecycle event handler
	 */
	created() {

	},

	/**
	 * Service started lifecycle event handler
	 */
	started() {

	},

	/**
	 * Service stopped lifecycle event handler
	 */
	stopped() {

	}
};
