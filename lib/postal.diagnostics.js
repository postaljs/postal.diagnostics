/*
 postal.diagnostics
 Author: Jim Cowart (http://freshbrewedcode.com/jimcowart)
 License: Dual licensed MIT (http://www.opensource.org/licenses/mit-license) & GPL (http://www.opensource.org/licenses/gpl-license)
 Version 0.7.0
 */
(function ( root, factory ) {
	if ( typeof module === "object" && module.exports ) {
		// Node, or CommonJS-Like environments
		module.exports = function( _, postal ) {
			return factory( _, postal );
		}
	} else if ( typeof define === "function" && define.amd ) {
		// AMD. Register as an anonymous module.
		define( ["underscore", "postal"], function ( _, postal ) {
			return factory( postal, _, root );
		} );
	} else {
		// Browser globals
		factory( root._, root.postal, root );
	}
}( typeof window !== 'undefined' ? window : this, function ( _, postal, global, undefined ) {

	postal.diagnostics = postal.diagnostics || {};

	var DiagnosticsWireTap = function ( name, options ) {
		var self = this;
		options = options || {};
		options.writer = options.writer || function(output) {
			console.log(output);
		};

		if(options.serialize) {
			this.serialize = options.serialize;
		}

		self.filters = options.filters || [];

		self.active = options.hasOwnProperty('active') ? options.active : true;

		self.removeWireTap = postal.addWireTap( function ( data, envelope ) {
			if( !self.active ) {
				return;
			}
			if( !self.filters.length || _.any( self.filters, function ( filter ) {
				return self.applyFilter( filter, envelope );
			})) {
				try {
					options.writer( self.serialize( envelope ) );
				}
				catch ( exception ) {
					options.writer( "Unable to serialize envelope: " + exception );
				}
			}
		} );

		if ( postal.diagnostics[name] ) {
			postal.diagnostics[name].removeWireTap();
		}
		postal.diagnostics[name] = self;
	};

	DiagnosticsWireTap.prototype.applyFilter = function ( filter, env ) {
		var match = 0, possible = 0;
		_.each( filter, function ( item, key ) {
			if ( env[key] ) {
				possible++;
				if ( _.isRegExp( item ) && item.test( env[key] ) ) {
					match++;
				}
				else if ( _.isObject( env[key] ) && !_.isArray( env[key] ) ) {
					if ( this.applyFilter( item, env[key] ) ) {
						match++;
					}
				}
				else {
					if ( _.isEqual( env[key], item ) ) {
						match++;
					}
				}
			}
		}, this );
		return match === possible;
	};

	DiagnosticsWireTap.prototype.clearFilters = function () {
		this.filters = [];
	};

	DiagnosticsWireTap.prototype.removeFilter = function ( filter ) {
		this.filters = _.filter( this.filters, function ( item ) {
			return !_.isEqual( item, filter );
		} );
	};

	DiagnosticsWireTap.prototype.addFilter = function ( constraint ) {
		if ( !_.isArray( constraint ) ) {
			constraint = [ constraint ];
		}
		_.each( constraint, function ( item ) {
			if ( this.filters.length === 0 || !_.any( this.filters, function ( filter ) {
				return _.isEqual( filter, item );
			} ) ) {
				this.filters.push( item );
			}
		}, this );
	};

	DiagnosticsWireTap.prototype.serialize = function(env) {
		if ( typeof JSON === 'undefined' ) {
			throw new Error("This browser or environment does not provide JSON support");
		}
		return JSON.stringify(env, null, 4);
	};

	postal.diagnostics.DiagnosticsWireTap = DiagnosticsWireTap;

} ));