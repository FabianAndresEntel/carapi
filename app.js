var express = require('express');
var app = express();
var _ = require("underscore");

app.use(express.static('public'));
app.set('view engine', 'jade');

app.get('/', function (req, res) {
    res.render('index', { title: 'Probando el template JADE', message: 'Todas las marcas y modelos de vehículos gratuitamente para tus proyectos.'});
});

app.get('/make/:idmake', function(request, response) {

    var idmake = request.params.idmake;
    idmake = Number(idmake);

    var autoapi = require('./json/autoapi.json');
    var makes = _.where(autoapi.makes, {id: idmake});
    console.log(makes);

    response.send('Marca: ' + makes[0].make + '!');

});

app.listen(3000, function () {
    console.log('Puerto 3000 corriendo correctamente.');
})
