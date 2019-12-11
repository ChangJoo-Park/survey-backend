"use strict";

const Tracer = require("moleculer-console-tracer");

module.exports = {
	name: "metrics",
	mixins: [Tracer],
	actions: {
		async health(ctx) {
			const { cpu, mem, os, process, transit, time } = await ctx.call('$node.health')
			delete os.hostname
			delete os.type
			delete os.arch
			delete os.platform
			delete os.user
			delete process.argv
			return { cpu, mem, os, process, transit, time }
		},
	}
};
