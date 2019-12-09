"use strict";

const DbService = require("../mixins/db.mixin");

/**
 * survey service
 */
module.exports = {

	name: "survey",
	mixins: [
		DbService("survey"),
	],
	/**
	 * Service hooks
	 */
	hooks: {
		before: {
			list: []
		},
		after: {
			create: [
				function (ctx, survey) {
					const { user } = ctx.meta
					if (user) {
						return ctx.call('survey.update', { _id: survey._id, author: user._id })
					} else {
						return ctx
					}
				}
			]
		},
		error: {},
	},
	/**
	 * Service settings
	 */
	settings: {
		populates: {
			author: {
				action: "user.get",
				params: {
					fields: ["username", "image"]
				}
			}
		},
		idField: "_id",
		fields: ["_id", "title", "description", "questions", "public", 'author', 'questions'],
		entityValidator: {
			title: 'string',
			description: { type: 'string', optional: true },
			public: { type: 'boolean', default: false },
			author: { type: 'string', optional: true },
			questions: {
				type: 'array', optional: true, props: {
					question: {
						type: 'object', props: {
							_id: { type: 'string' },
							type: { type: 'string', contains: ['string', 'text', 'checkbox', 'radio', 'date', 'time', 'datetime' ] },
							title: 'string',
							description: { type: 'string', optional: true },
							options: { type: 'array', default: [] }
						}
					}
				}
			},
		}
	},

	/**
	 * Service metadata
	 */
	metadata: {

	},

	/**
	 * Service dependencies
	 */
	dependencies: [],

	/**
	 * Actions
	 */
	actions: {
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

	},
	afterConnected() {
		this.logger.info("Connected successfully");
	},

	entityCreated(json, ctx) {
		this.logger.info("New entity created!");
	},

	entityUpdated(json, ctx) {
		this.logger.info(`Entity updated by '${ctx.meta.user.name}' user!`);
	},

	entityRemoved(json, ctx) {
		this.logger.info("Entity removed", json);
	},
};
