var express = require('express');
var app = express();
var csv = require('fast-csv');
var fs = require('fs');

var home_url = "http://carapi.heroku.com";

app.use(express.static('public'));
app.set('view engine', 'jade');

app.get('/', function (req, res) {
    res.render('index', { title: 'Carapi', subtitle: 'All makes and models of vehicles for free for your projects.', message: 'We have 74 makes of vehicles until now'});
});

app.get('/api/make/:make', function(request, response) {

    var make = request.params.make;

    if (!(make > 0)){
        response.send('{"detail":"Not found."}'); // Return json with data
    }
    var json_models = new Array();

    var csv_makes = fs.createReadStream("./data/makes.csv");

    csv
    .fromStream(csv_makes, {headers : true})
    .validate(function(makes){

        return makes.id == make; // make with id url

    })
    .on("data", function(makes){

        // Defino contadores para ver en que momento debo hacer el "send"
        var ma = 0;
        var mo = 0;
        var csv_models = fs.createReadStream("./data/models.csv");

        csv
        .fromStream(csv_models, {headers : true})
        .validate(function(models){

            return models.idmake == make; //all models with id make

        })
        .on("data", function(models){

            ma++;
            var data_models = new Object();
            var idmodel = models.id;
            data_models.id = idmodel;
            data_models.model = models.model;
            data_models.url = home_url+"/api/model/"+idmodel;

            var csv_years = fs.createReadStream("./data/years_models.csv");
            var json_years = new Array();

            csv
            .fromStream(csv_years, {headers : true})
            .validate(function(years){

                return years.idmodel == idmodel; //all years with id make

            })
            .on("data", function(years){

                var data_years = new Object();
                data_years.year = years.year;
                data_years.url = home_url+"/api/year/"+years.year;
                json_years.push(data_years); // Add models to array

            })
            .on("end", function(){
                // End of years
                mo++;
                data_models.versions = json_years;
                json_models.push(data_models); // Add models to array
                //console.log("ready years!");
                makes.models = json_models;

                if (mo == ma) {
                    response.send(makes); // Return json with data
                }

            });

        })
        .on("end", function(){
            // End of models
            //console.log("ready models!");

        });
    })
    .on("end", function(){
        // End of makes
        //console.log("ready makes!");
    });

});

var port = process.env.PORT || 3000;
app.listen(port);

// Render some console log output
console.log("Listening on port " + port);
