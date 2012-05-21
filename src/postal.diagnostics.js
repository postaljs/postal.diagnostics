postal.diagnostics = postal.diagnostics || {};

var DiagnosticsWireTap = function(name, writer, filters) {
	var self = this;

  self.filters = filters || [];

  self.active = true;

  self.removeWireTap = postal.addWireTap( function( data, envelope ) {
    if(!self.active) {
      return;
    }
		if ( !self.filters.length || _.any( self.filters, function ( filter ) {
			return self.applyFilter( filter, envelope );
		} ) ) {
			if ( !JSON ) {
				throw "This browser or environment does not provide JSON support";
			}
			try {
				writer( JSON.stringify( envelope ) );
			}
			catch ( exception ) {
				try {
					var env = _.extend( {}, envelope );
					delete env.data;
					writer( JSON.stringify( env ) + "\n\t" + "JSON.stringify Error: " + exception.message );
				}
				catch ( ex ) {
					writer( "Unable to parse data to JSON: " + exception );
				}
			}
		}
	});

	if(postal.diagnostics[name]) {
		postal.diagnostics[name].removeWireTap();
	}
	postal.diagnostics[name] = self;
};

DiagnosticsWireTap.prototype.applyFilter = function( filter, env ) {
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

