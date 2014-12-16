var Templater = require("../")
  , t = new Templater({ engineExtensions : { html : 'trimpath-template' }, alternateExtensions : ['.jade', '.ejs'], alternateIndexes : ['home.html', 'index.ejs'] })
  , assert = require("assert")
  , complete = 0
  , required = 11
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

t.render("{{name}}", { engine : "handlebars", context : context }, function (err, data) {
  assert.equal(data, "Steve Dave", "handlebars string literal test failed");
  finish();
});

/*t.render("{name}", { engine : "dustjs-linkedin", context : context }, function (err, data) {
  assert.equal(data, "Steve Dave", "dust string literal test failed");
  finish();
});*/

t.render("${name}", { engine : "trimpath-template", context : context }, function (err, data) {
  assert.equal(data, "Steve Dave", "trimpath-template string literal test failed");
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

t.render({ filename : __dirname + "/test.handlebars", context : context }, function (err, data) {
  assert.equal(data, "Steve Dave\n", "handlebars file test failed");
  finish();
});

/*t.render({ filename : __dirname + "/test.dustjs-linkedin", context : context }, function (err, data) {
  assert.equal(data, "Steve Dave", "dust file test failed");
  finish();
});*/

t.render({ filename : __dirname + "/test.trimpath-template", context : context }, function (err, data) {
  assert.equal(data, "Steve Dave", "trimpath-template file test failed");
  finish();
});

t.render({ filename : __dirname + "/test.html", context : context }, function (err, data) {
  assert.equal(data, "Steve Dave", "trimpath-template via engineExtensions file test failed");
  finish();
});

t.render({ filename : __dirname + "/test.asdf", context : context }, function (err, data) {
  assert.equal(data, "Steve Dave", "Didn't resolve alternate file extension");
  finish();
});

t.render({ filename : __dirname + "/root/", context : context }, function (err, data) {
  assert.equal(data, "Steve Dave", "Didn't resolve alternate index file");
  finish();
});

function finish() {
  complete += 1;
  console.log('Test Complete');

  if (complete == required) {
    t.end();
  }
}
