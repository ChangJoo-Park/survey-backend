"use strict";

const { MoleculerClientError } = require("moleculer").Errors;

/**
 * www service
 */
module.exports = {

	name: "www",
	version: 1,
	hooks: {
		before: {
			'*': [function (ctx) {
				if (ctx.action.auth && !ctx.meta.user) {
					return Promise.reject(new MoleculerClientError("Please Login!", 422, "", [{ field: "user", message: "not found" }]));
				}
				return true
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
		'participants-survey'(ctx) {
			const { surveyId } = ctx.params
			return ctx.call('participation.list', { "search": surveyId, "serachFields": "survey" })
		},
		'participate-survey'(ctx) {
			const { participant } = ctx.params
			this.logger.info('==========')
			this.logger.info(participant)
			this.logger.info('==========')
			return ctx.call('participation.insert', { entity: participant })
		},
		'get-public-surveys'(ctx) {
			return ctx.call('survey.find', { query: { public: true }, populate: ['author'] })
		},
		'get-private-surveys'(ctx) {
			return ctx.call('survey.find', { query: { public: false }, populate: ['author'] })
		},
		'get-survey'(ctx) {
			const { surveyId: id } = ctx.params
			return ctx.call('survey.get', { id, populate: ['author'] })
		},
		'create-survey'(ctx) {
			const { survey } = ctx.params
			return ctx.call('survey.create', survey)
		},
		'update-survey'(ctx) {
			const { survey } = ctx.params
			return ctx.call('survey.update', { _id: survey._id, ...survey })
		},
		'remove-survey'(ctx) {
			const { surveyId: id } = ctx.params
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
