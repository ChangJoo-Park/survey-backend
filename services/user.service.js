"use strict";

const DbService = require("../mixins/db.mixin");
const { MoleculerClientError } = require("moleculer").Errors;

const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");

/**
 * user service
 */
module.exports = {

  name: "user",
  mixins: [
    DbService("user"),
  ],
	/**
	 * Service hooks
	 */
  hooks: {
    before: {},
    after: {},
    error: {}
  },
	/**
	 * Service settings
	 */
  settings: {
    JWT_SECRET: process.env.JWT_SECRET || "jwt-user-secret",
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
		 * Create user
		 *
		 * @actions
		 * @param {}  -
		 * @returns {}
		 */
    create: {
      cache: {},
      params: {
        user: {
          type: 'object', props: {
            username: { type: 'string', min: 3 },
            email: { type: 'string' },
            password: { type: 'string', min: 3 },
          }
        }
      },
      async handler(ctx) {
        const { user } = ctx.params
        const { username, email, password } = user

        const existsUserByUsername = this.adapter.findOne({ username })
        const existsUserByEmail = this.adapter.findOne({ email })

        const [resultByUsername, resultByEmail] = await Promise.all([existsUserByUsername, existsUserByEmail])

        if (resultByUsername) {
          return Promise.reject(new MoleculerClientError("Username or Email is exist!", 422, "", [{ field: "username", message: "is exist" }]));
        }

        if (resultByEmail) {
          return Promise.reject(new MoleculerClientError("Email is exist!", 422, "", [{ field: "email", message: "is exist" }]));
        }

        user.password = bcrypt.hashSync(password, 10);

        return this.adapter.insert({ ...user })
          .then(doc => this.transformDocuments(ctx, {}, doc))
          .then(json => this.entityChanged("created", json, ctx).then(() => json));
      }
    },
		/**
		 * Update user
		 *
		 * @actions
		 * @param {String} id - id from user
		 * @returns {}
		 */
    get: {
      auth: 'required',
      cache: {},
      params: {
        id: { type: 'string' }
      },
      handler(ctx) {
        const { id: _id } = ctx.params
        return this.getById(_id)
      }
    },
		/**
		 * Update user
		 *
		 * @actions
		 * @param {}  -
		 * @returns {}
		 */
    update: {
      cache: {},
      params: {
        id: { type: 'string', optional: false },
        user: {
          type: 'object'
        }
      },
      handler(ctx) {
        const { id, user } = ctx.params
        user.updated_at = new Date()
        delete user._id
        return this.adapter.updateById(id, {
          ...user
        })
      }
    },
		/**
		 * Remove user
		 *
		 * @actions
		 * @param {}  -
		 * @returns {}
		 */
    remove: {
      cache: {},
      params: {
        id: {
          type: 'string',
          optional: true
        }
      },
      handler(ctx) {
        const { id } = ctx.params
        return this.adapter.removeById(id)
      }
    },
		/**
		 * Listing user
		 *
		 * @actions
		 * @returns {}
		 */
    list: {
      cache: {},
      params: {},
      handler() {
        return this._find()
      }
    },
    /**
     * Login User and Generate Token
     */
    login: {
      cache: {},
      params: {
        user: {
          type: 'object',
          props: {
            email: 'string',
            password: 'string'
          }
        }
      },
      async handler(ctx) {
        const { user: { email, password } } = ctx.params
        const found = await this.adapter.findOne({ email })

        if (!found) {
          return Promise.reject(new MoleculerClientError("Login failed!", 422, "", [{ field: "email", message: "is not found" }]));
        }
        const samePassword = await bcrypt.compare(password, found.password)

        if (!samePassword) {
          return Promise.reject(new MoleculerClientError("Login failed!", 422, "", [{ field: "password", message: "is not matched" }]));
        }

        return this.transformDocuments(ctx, {}, found)
          .then(user => this.transformEntity(user, true, ctx.meta.token))
      }
    },
		/**
		 * Get user by JWT token (for API GW authentication)
		 *
		 * @actions
		 * @param {String} token - JWT token
		 *
		 * @returns {Object} Resolved user
		 */
		resolveToken: {
			cache: {
				keys: ["token"],
				ttl: 60 * 60 // 1 hour
			},
			params: {
				token: "string"
			},
			handler(ctx) {
				return new Promise((resolve, reject) => {
					jwt.verify(ctx.params.token, this.settings.JWT_SECRET, (err, decoded) => {
						if (err) {
							return reject(err);
            }
						resolve(decoded);
					});
				})
					.then(decoded => {
						if (decoded.id) {
							return this.getById(decoded.id);
            }
					});
			}
		},
  },

	/**
	 * Events
	 */
  events: {
  },

	/**
	 * Methods
	 */
  methods: {
		/**
		 * Generate a JWT token from user entity
		 *
		 * @param {Object} user
		 */
    generateJWT(user) {
      const today = new Date();
      const exp = new Date(today);
      exp.setDate(today.getDate() + 60);

      return jwt.sign({
        id: user._id,
        username: user.username,
        exp: Math.floor(exp.getTime() / 1000)
      }, this.settings.JWT_SECRET);
    },
		/**
		 * Transform returned user entity. Generate JWT token if neccessary.
		 *
		 * @param {Object} user
		 * @param {Boolean} withToken
		 */
    transformEntity(user, withToken, token) {
      if (user) {
        //user.image = user.image || "https://www.gravatar.com/avatar/" + crypto.createHash("md5").update(user.email).digest("hex") + "?d=robohash";
        user.image = user.image || "";
        if (withToken)
          user.token = token || this.generateJWT(user);
      }

      return { user };
    },
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
