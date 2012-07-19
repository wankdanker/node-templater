var Templater = require("../")
	, t = new Templater()
	, assert = require("assert")
	, complete = 0
	, required = 4
	, context = {
		name : "Steve Dave"
	};

t.render("<%=name%>", {engine : "ejs", context : context }, function (err, data) {
	assert.equal(data, "Steve Dave", "ejs string literal test failed");
	finish();
});

t.render(" #{name}", { engine : "jade", context : context }, function (err, data) {
	assert.equal(data, "Steve Dave", "jade string literal test failed");
	finish();
});

t.render({ filename : __dirname + "/test.ejs", context : context }, function (err, data) {
	assert.equal(data, "Steve Dave", "ejs file test failed");
	finish();
});

t.render({ filename : __dirname + "/test.jade", context : context }, function (err, data) {
	assert.equal(data, "Steve Dave", "jade file test failed");
	finish();
});

function finish() {
	complete += 1;
	
	if (complete == required) {
		t.end();
	}
}