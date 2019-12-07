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
		error: {}
	},
	/**
	 * Service settings
	 */
	settings: {
		populates: {
			author: {
				action: "users.get",
				params: {
					fields: ["username", "image"]
				}
			}
		},
		idField: "_id",
		fields: ["_id", "title", "description", "questions", "author"],
		entityValidator: {
			title: 'string',
			description: { type: 'string', optional: true },
			questions: {
				type: 'array', optional: true, props: {
					block: {
						type: 'object', props: {
							type: 'string',
							title: 'string',
							description: 'string',
							options: { type: 'array' }
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
		// You can also access to Context
		this.logger.info(`Entity updated by '${ctx.meta.user.name}' user!`);
	},

	entityRemoved(json, ctx) {
		this.logger.info("Entity removed", json);
	},
};
