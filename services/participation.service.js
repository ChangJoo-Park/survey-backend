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
		after: {
			create(ctx) {
				// TODO: call EVENT
				return ctx
			}
		}
	},
	/**
	 * Service settings
	 */
	settings: {
		idField: "_id",
		entityValidator: {
			survey: 'string',
			answers: { type: 'array' },
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
