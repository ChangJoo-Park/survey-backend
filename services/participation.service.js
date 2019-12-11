"use strict";
const DbService = require("../mixins/db.mixin");

/**
 * participation service
 */
module.exports = {

	name: "participation",
	mixins: [
		DbService("participation"),
	],
	hooks: {
	},
	/**
	 * Service settings
	 */
	settings: {
		idField: "_id",
		entityValidator: {
			survey: 'string',
			answers: { type: 'array', default: [], props: {
				_id: 'string',
				value: 'any'
			} },
			ua: { type: 'string', optional: true }
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
		/**
		* Test action
		*/
		test(ctx) {
			return this.Promise.resolve("Hello Moleculer");
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
		this.logger.info("Participation Service created!");
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

	async entityCreated (participant, ctx) {
		// FIXME: NEED Optimize
		const { author } = await this.broker.call('survey.get', { id: participant.survey, fields: 'author' })
		const total = await this.broker.call('participation.count', { "search": participant.survey, "serachFields": "survey" })
		this.broker.emit(`someone-take-a-survey/${participant.survey}`, { participant, total })
		this.broker.emit(`author/${author}`, { event: 'PARTICIPATION_CREATED', survey: participant.survey, participantsCount: total })
		return Promise.resolve(participant)
	},
};
