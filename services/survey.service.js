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
			list: [],
			create: [
				function addTimestamp(ctx) {
					ctx.params.createdAt = new Date();
					ctx.params.updatedAt = new Date();
					const { user } = ctx.meta
					ctx.params.author = user._id
					return ctx;
				}
			],
			update: [
				function addTimestamp(ctx) {
					// FIXME
					const { user } = ctx.meta
					ctx.params.author = user._id
					ctx.params.updatedAt = new Date();
					return ctx;
				}
			]
		},
		after: {},
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
					fields: ["id", "_id", "username", "image"]
				}
			},
			participantsCount(ids, surveys, rule, ctx) {
				return this.Promise.all(surveys.map(survey => ctx.call("participation.count", { query: { survey: survey._id } })
					.then(count => survey.participantsCount = count)))
			},
			participations(ids, surveys, rule, ctx) {
				return this.Promise.all(surveys.map(survey => ctx.call("participation.find", { query: { survey: survey._id } })
					.then(participations => survey.participations = participations)))
			}
		},
		idField: "_id",
		fields: [
			"_id", "title", "description", "questions", "createdAt", "updatedAt", "published", 'author', 'questions', 'participantsCount', 'participations',
			"startAt", "endAt"
		],
		entityValidator: {
			title: 'string',
			description: { type: 'string', optional: true },
			published: { type: 'boolean', default: false },
			author: { type: 'string', optional: false },
			questions: {
				type: 'array', optional: true, props: {
					question: {
						type: 'object', props: {
							_id: { type: 'string' },
							type: { type: 'enum', values: ['string', 'text', 'checkbox', 'radio', 'date', 'time', 'datetime'] },
							title: 'string',
							description: { type: 'string', optional: true },
							options: { type: 'array', default: [] }
						}
					}
				}
			},
			startAt: { type: 'date', optional: true },
			endAt: { type: 'date', optional: true },
			createdAt: { type: 'date' },
			updatedAt: { type: 'date' }
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
