var assert = require('chai').assert
var app = require('../server')
var request = require('request')
const environment = process.env.NODE_ENV || 'test'
const configuration = require('../knexfile')[environment]
const database = require('knex')(configuration)

describe('Server', function(){
  before(function(){
    this.port = 9876
    this.server = app.listen(this.port, function(err, result){
      if(err) { return done(err) }
      done()
    })
    this.request = request.defaults({
      baseUrl: 'http://localhost:9876'
    })
  })

  after(function(){
    this.server.close()
  })

  it('should exist', function(){
    assert(app)
  })

  describe('GET /', function(){
    it('should return a 200', function(done){
      this.request.get('/', function(error, response){
        if (error) { done(error) }
        assert.equal(response.statusCode, 200)
        done()
      })
    })

    it('should have a body with the name of the application', function(done){
      this.request.get('/', function(error, response){
        if (error) { done(error) }
        assert.include(response.body, app.locals.title)
        done()
      })
    })
  })

  describe('GET /api/secrets/:id', function(){
    beforeEach(function(){
      database.raw(
        'INSERT INTO secrets (message, created_at) VALUES (?, ?)',
        ["I hate game shows", new Date])
        .then(function() {
          done()
        })
    })

    it('should return a 404 if the resource is not found', function(done){
      this.request.get('/api/secrets/bahaha', function(error, response){
        if (error) { done(error) }
        assert.equal(response.statusCode, 404)
        done()
      })
    })

    it('should have the id and message from the resource', function(done){
      var id = '1'
      var message = "I hate game shows"

      this.request.get('/api/secrets/' + id, function(error, response){
        if (error) { done(error) }
        assert.include(response.body, id)
        assert.include(response.body, message)
        done()
      })
    })
  })

  describe('POST /api/secrets', function(){
    beforeEach(function(){
      app.locals.secrets = {}
    })

    it('should receive and store data', function(done){
      var message = {
        message: 'I like pineapples!'
      }

      this.request.post('/api/secrets', { form: message }, function(error, response){
        if (error) { done(error) }

        var secretCount = Object.keys(app.locals.secrets).length
        assert.equal(secretCount, 1)
        done()
      })
    })
  })
})
