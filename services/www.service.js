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
			auth: true,
			handler(ctx) {
				const { user } = ctx.meta
				return Promise.resolve(user)
			}
		},
		// TODO
		'update-me': {
			auth: true,
			handler(ctx) {
				return ctx.call('user.list')
			}
		},
		'participants-survey': {
			auth: true,
			handler(ctx) {
				const { surveyId } = ctx.params
				return ctx.call('participation.list', { "search": surveyId, "serachFields": "survey" })
			},
		},
		'participate-survey'(ctx) {
			const { participant } = ctx.params
			return ctx.call('participation.insert', { entity: participant })
		},
		'get-published-surveys-by-author': {
			auth: true,
			handler(ctx) {
				const { user }  = ctx.meta
				return ctx.call('survey.find', { query: { published: true, author: user._id }, populate: ['author', 'participantsCount'] })
			}
		},
		'get-draft-surveys-by-author': {
			auth: true,
			handler(ctx) {
				const { user }  = ctx.meta
				return ctx.call('survey.find', { query: { published: false, author: user._id }, populate: ['author', 'participantsCount'] })
			}
		},
		'get-survey'(ctx) {
			const { surveyId: id } = ctx.params
			return ctx.call('survey.get', { id, populate: ['author'] })
		},
		'create-survey': {
			auth: true,
			handler(ctx) {
				const { survey } = ctx.params
				const { user }  = ctx.meta
				survey.author = user._id
				return ctx.call('survey.create', survey)
			}
		},
		'update-survey': {
			auth: true,
			handler(ctx) {
				const { survey } = ctx.params
				return ctx.call('survey.update', { _id: survey._id, ...survey })
			}
		},
		'remove-survey': {
			auth: true,
			handler(ctx) {
				const { surveyId: id } = ctx.params
				return ctx.call('survey.remove', { id })
			}
		},
		'app-stats': {
			async handler(ctx) {
				const requests = [ctx.call('survey.count'), ctx.call('participation.count'), ctx.call('user.count')]
				const [surveys, participations, users] = await Promise.all(requests)
				return Promise.resolve({surveys, participations, users})
			}
		}
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
