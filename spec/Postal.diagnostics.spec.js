var wiretap,
	msgs = [];
QUnit.reorder = false;
QUnit.specify( "postal.diagnostics", function () {
	describe( "With DiagnosticsWireTap", function () {

		before(function() {
			wiretap = new DiagnosticsWireTap("test", function(x) { msgs.push(x); });
		});
		after(function() {
			msgs = [];
		});
		describe("when not logging anything", function() {
			it("should not capture any messages", function() {
				assert(msgs.length).isEqualTo(0);
			});
			it("should not have any filters", function() {
				assert(wiretap.filters.length).isEqualTo(0);
			});
			it("should default to active", function() {
				assert(wiretap.active).isEqualTo(true);
			});
		});
		describe("when adding a filter with plain string match", function() {
			before(function(){
				wiretap.addFilter({ data: "bacon" });
			});
			it("should have one filter", function() {
				assert(wiretap.filters.length).isEqualTo(1);
			});
			it("should filter a valid match", function(){
				var env = postal.publish({
					channel: "/",
					topic: "Anything.Really",
					data: "bacon"
				});
				assert(msgs.length).isEqualTo(1);
				assert(msgs[0]).isEqualTo(JSON.stringify(env));
			});
			it("should *not* filter an invalid match", function(){
				var env = postal.publish({
					channel: "/",
					topic: "Anything.Really",
					data: "baconista"
				});
				assert(msgs.length).isEqualTo(0);
				assert(msgs[0]).isNotEqualTo(JSON.stringify(env));
			});
		});
		describe("when adding a filter with regex match", function() {
			before(function(){
				wiretap.addFilter({ data: /bacon/ });
			});
			it("should have one filter", function() {
				assert(wiretap.filters.length).isEqualTo(1);
			});
			it("should filter a valid match", function(){
				var env = postal.publish({
					channel: "/",
					topic: "Anything.Really",
					data: "bacon"
				});
				assert(msgs.length).isEqualTo(1);
				assert(msgs[0]).isEqualTo(JSON.stringify(env));
			});
			it("should filter a second valid match", function(){
				var env = postal.publish({
					channel: "/",
					topic: "Anything.Really",
					data: "baconista"
				});
				assert(msgs.length).isEqualTo(1);
				assert(msgs[0]).isEqualTo(JSON.stringify(env));
			});
			it("should *not* filter an invalid match", function(){
				var env = postal.publish({
					channel: "/",
					topic: "Anything.Really",
					data: "barkin"
				});
				assert(msgs.length).isEqualTo(0);
				assert(msgs[0]).isNotEqualTo(JSON.stringify(env));
			});
		});
		describe("when adding a complex filter", function() {
			before(function(){
				wiretap.addFilter({
					topic: "Anything.Really",
					data: {
						foo: "bar",
						bacon: /sizzl/
					}
				});
			});
			it("should have one filter", function() {
				assert(wiretap.filters.length).isEqualTo(1);
			});
			it("should filter a valid match", function(){
				var env = postal.publish({
					channel: "/",
					topic: "Anything.Really",
					data: {
						foo: "bar",
						bacon: "sizzling"
					}
				});
				assert(msgs.length).isEqualTo(1);
				assert(msgs[0]).isEqualTo(JSON.stringify(env));
			});
			it("should *not* filter an invalid match", function(){
				var env = postal.publish({
					channel: "/",
					topic: "Anything.Really",
					data: "barkin"
				});
				assert(msgs.length).isEqualTo(0);
				assert(msgs[0]).isNotEqualTo(JSON.stringify(env));
			});
			it("should *not* filter another invalid match", function(){
				var env = postal.publish({
					channel: "/",
					topic: "Nothing.Really",
					data: {
						foo: "bar",
						bacon: "sizzling"
					}
				});
				assert(msgs.length).isEqualTo(0);
				assert(msgs[0]).isNotEqualTo(JSON.stringify(env));
			});
		});
		describe("when clearing all filters", function() {
			before(function(){
				wiretap.addFilter({
					topic: "Anything.Really",
					data: {
						foo: "bar",
						bacon: /sizzl/
					}
				});
			});
			it("should have one filter before clearing", function() {
				assert(wiretap.filters.length).isEqualTo(1);
			});
			it("should have 0 filters after clearing", function(){
				wiretap.clearFilters();
				assert(wiretap.filters.length).isEqualTo(0);
			});
		});
		describe("when clearing a specific filter", function() {
			before(function(){
				wiretap.addFilter({
					topic: "Anything.Really",
					data: {
						foo: "bar",
						bacon: /sizzl/
					}
				});
				wiretap.addFilter({
					topic: "Not.Really.Anything",
					data: {
						foo: "bar",
						bacon: "frozen"
					}
				});
			});
			it("should have two filters", function() {
				assert(wiretap.filters.length).isEqualTo(2);
			});
			it("should filter valid match against either filter", function(){
				var envA = postal.publish({
					channel: "/",
					topic: "Anything.Really",
					data: {
						foo: "bar",
						bacon: "sizzling"
					}
				});
				var envB = postal.publish({
					channel: "/",
					topic: "Not.Really.Anything"
				});
				assert(msgs.length).isEqualTo(2);
				assert(msgs[0]).isEqualTo(JSON.stringify(envA));
				assert(msgs[1]).isEqualTo(JSON.stringify(envB));
			});
			it("should *not* filter an invalid match", function(){
				var envA = postal.publish({
					channel: "/",
					topic: "Not.Going.To.Get.Captured.YAY",
					data: {
						foo: "bar",
						bacon: "sizzling"
					}
				});
				assert(msgs.length).isEqualTo(0);
			});
			it("should filter valid matches after removing one filter", function(){
				var envA = postal.publish({
					channel: "/",
					topic: "Anything.Really",
					data: {
						foo: "bar",
						bacon: "sizzling"
					}
				});
				var envB = postal.publish({
					channel: "/",
					topic: "Not.Really.Anything"
				});
				wiretap.removeFilter({
					topic: "Not.Really.Anything",
					data: {
						foo: "bar",
						bacon: "frozen"
					}
				});
				var envC = postal.publish({
					channel: "/",
					topic: "Not.Really.Anything"
				});
				assert(msgs.length).isEqualTo(2);
				assert(msgs[0]).isEqualTo(JSON.stringify(envA));
				assert(msgs[1]).isEqualTo(JSON.stringify(envB));
			});
		});
	});
} );