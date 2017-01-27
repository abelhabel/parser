const log = console.log;
var input = process.argv.slice(2).join(' ');

function Parser(options) {
  this.id = Parser.nextId();
  this.prepositions = options.prepositions || [];
  this.verbs = options.verbs || [];
  this.store = options.store || [];
  this.globals = options.globals || [];
  this.output = (str) => console.log(str);
}
Parser.id = 0;

Parser.nextId = function() {
  return ++Parser.id;
}

Parser.prototype.remove = function(obj) {
  var index = this.indexBy('id', obj.id);
  this.store.splice(index, 1);
}

Parser.prototype.parse = function(phrase) {
  phrase = phrase.replace(/the\s/g, '').trim();
  console.log(phrase);
  var actions = phrase.split(' and ');
  if(actions.length > 1) return actions.forEach( (p) => this.parse(p));
  var words = actions[0].split(' ');
  var verb, prep, noun, found;
  verb = words[0];

  if(words.length == 1) {
    if(typeof this.globals[verb] === 'function') {
      return this.globals[verb]();
    }
  }

  if(words.length == 2) {
    noun = words[1];
  } else {
    prep = words[1];
    noun = words[2];
  }
  found = this.findBy('name', noun) || this.findBy('alias', noun);
  if(!found) return `${noun} not found`;


  if(!found[verb]) return `nothing noteworthy`;

  if(typeof found[verb] === 'function') {
    console.log(`found ${found.name}`);
    found[verb](found);
    return `${verb} ${found.name}`;
  }

  if(prep && !found[verb][prep]) return `Nothing ${prep} for ${noun}`;

  this.output(found[verb][prep]());

}

Parser.prototype.indexBy = function(key, val) {
  for(var i = 0, l = this.store.length; i < l; i++) {
    if(this.store[i][key] === val) return i;
  }
  return -1;
}

Parser.prototype.findBy = function(key, val) {
  for(var i = 0, l = this.store.length; i < l; i++) {
    if(this.store[i][key].match(val)) return this.store[i];
  }
  return false;
}

Parser.prototype.listNames = function() {
  return this.store.map((o) => o.name).join(', ');
}

var player = {
  inventory: []
};
var p = new Parser({
  prepositions: ['in', 'at'],
  verbs: ['look', 'take'],
  store: [{
    name: 'book',
    alias: 'bok page',
    look: {
      at: () => 'a red book',
      in: () => 'a lot of text'
    },
    take: (obj) => {
      console.log(p.store);
      p.remove(obj);
      console.log(p.store);
      player.inventory.push(obj);
    }
  }],
  globals: {
    look: () => p.output(p.listNames()),
    take: () => p.output('You need to define what you want to take.')
  }
});

p.parse(input);
