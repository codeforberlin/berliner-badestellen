var _badestellen,_freibaeder,_fkk,_hallenbaeder;

function init() {
    $.get('data/badestellen.kml', function(kml) {
        _badestellen = kml;
        $.get("data/freibaeder.kml", function(kml) {
            _freibaeder = kml;
            $.get("data/fkk.kml", function(kml) {
                _fkk = kml;
                $.get("data/hallenbaeder.kml", function(kml) {
                    _hallenbaeder = kml;
                    $.ajax({
                        url: "data/all.json",
                        type: 'GET',
                        dataType: 'json',
                        cache: false,
                        success: function (json) {
                            _quality = json;
                            initMap();
                        }
                    });
                });
            });
        });
    });
}

function initMap() {
    var map = new L.Map('map');

    var min = 11;
    var max = 16;
    var reuse = true;

    //var baseUrl = 'http://mamanoke.de/tiles/badeseen/';
    var baseUrl = 'http://services.codefor.de/static/badeseen/';
    var errorTile = baseUrl + 'error.png';

    var osmCopyright = "Map data &copy; 2012 OpenStreetMap contributors";

    var center = new L.LatLng(52.51, 13.37628);
    map.setView(center, min);

    var icons = {
        'blau': L.icon({
            iconUrl: 'img/blau.png',    
            iconSize:     [32, 39], // size of the icon width,height
            iconAnchor:   [14, 45], // point of the icon which will correspond to marker's location
            popupAnchor:  [4,-46]   // point from which the popup should open relative to the iconAnchor
        }),
        'gelb': L.icon({
            iconUrl: 'img/gelb.png',    
            iconSize:     [32, 37],
            iconAnchor:   [14, 39],
            popupAnchor:  [4,-46]
        }),
        'rot': L.icon({
            iconUrl: 'img/rot.png',    
            iconSize:     [26, 45],
            iconAnchor:   [13, 44],
            popupAnchor:  [4,-46]
        }),
        'freibad': L.icon({
            iconUrl: 'img/freibad.png',    
            iconSize:     [23, 32],
            iconAnchor:   [11, 26],
            popupAnchor:  [4,-46]
        }),
        'fkk': L.icon({
            iconUrl: 'img/fkk.png',    
            iconSize:     [22, 26],
            iconAnchor:   [11, 26],
            popupAnchor:  [4,-46]
        }),
        'hallenbad': L.icon({
            iconUrl: 'img/hallenbad.png',    
            iconSize:  [35, 21],
            iconAnchor: [11, 26],
            popupAnchor: [4,-46]
        }),
        'fernsehturm': L.icon({
            iconUrl: 'img/fernsehturm.png',    
            iconSize: [27, 125],
            iconAnchor: [8,111]    
        }),
        'funkturm': L.icon({
            iconUrl: 'img/funkturm.png',    
            iconSize: [36, 110],
            iconAnchor: [16,108]
        })
    };
         
    var marker = {
        'fernsehturm': L.marker([52.520841,13.409405],{icon: icons.fernsehturm}).addTo(map),
        'funkturm': L.marker([52.5050681,13.278211400000032],{icon: icons.funkturm}).addTo(map)
    };

    var base = {
        'Hintergrund': new L.TileLayer(baseUrl + 'hintergrund/{z}/{x}/{y}.png', {
            minZoom: min,
            maxZoom: max,
            attribution: osmCopyright, 
            errorTileUrl: errorTile, 
            zIndex: 0,
            reuseTiles: reuse
        }).addTo(map),
        'Grau': new L.TileLayer(baseUrl + 'grau/{z}/{x}/{y}.png', { 
            minZoom: min,
            maxZoom: max,
            attribution: osmCopyright, 
            errorTileUrl: errorTile, 
            zIndex: 1,
            reuseTiles: reuse
        }).addTo(map),
    };

    var overlay = {
        'Natur': new L.TileLayer(baseUrl + 'natur/{z}/{x}/{y}.png', { 
            minZoom: min,
            maxZoom: max,
            attribution: osmCopyright, 
            errorTileUrl: errorTile, 
            zIndex: 1,
            reuseTiles: reuse
        }),
        'BVG Haltestellen': new L.TileLayer(baseUrl + 'bvg/{z}/{x}/{y}.png', { 
            minZoom: min,
            maxZoom: max,
            attribution: osmCopyright, 
            errorTileUrl: errorTile, 
            zIndex: 4,
            reuseTiles: reuse
        }),
        'Badestellen': new L.layerGroup().addTo(map),
        'Freibäder': new L.layerGroup(),
        'FKK-Baden': new L.layerGroup(),
        'Hallenbäder': new L.layerGroup(),
        'Hundebadestellen': new L.TileLayer(baseUrl + 'hunde/{z}/{x}/{y}.png', { 
            minZoom: min,
            maxZoom: max,
            attribution: osmCopyright, 
            errorTileUrl: errorTile, 
            zIndex: 6,
            reuseTiles: reuse
        }),
    };

    L.control.layers({}, overlay, {collapsed: false}).addTo(map);

    // Badestellen
    $(_badestellen).find("Placemark").each(function(){           
        var description = $(this).find("description").text();  
        var name = $(this).find("name").text();
        var farbe;
        var sicht = "";
        var overall;
        var date;
        var url; 
        
        for (var i = 0; i<_quality.index.length; i++) {
            if (_quality.index[i].rss_name == name) {
                farbe = _quality.index[i].farbe;
                sicht = (_quality.index[i].sicht);
                var s = _quality.index[i].dat.split('-');
                date = s[2] + '.' + s[1] + '.' + s[0]; 
                url = unescape(_quality.index[i].badestellelink.replace("[","").replace("]",""));
        url = url.split("|")[0];
                url = url.substr(1, url.length);
                url = 'http://www.berlin.de/' + url;
            }
        }
                                        
        var koordinaten = $(this).find("coordinates").text();
        var k = koordinaten.split(",");
        var lon = parseFloat(k[0]);
        var lat = parseFloat(k[1]);
        var icon;

        if (farbe === 'gruen.jpg') {
            icon = icons['blau'];
            overall = 'gut';  
        } else if(farbe === 'gruen_a_40_40.jpg') {
            icon = icons['blau'];
            overall = 'gut, erhöhtes Algenauftreten';
        } else if(farbe === 'gelb.jpg') {
            icon = icons['gelb'];
            overall = 'vom Baden wird abgeraten';
        } else {                        
            icon = icons['rot'];
            overall = 'Baden verboten';
        }

        var marker = L.marker([lat,lon],{icon: icon});
        marker.bindPopup('<b>'+ name + '</b><br>Sichttiefe: ' + sicht + ' cm<br> Messdatum: ' + date + '<br> Wasserqualität: ' + overall + '<br>'+ '<a href="' + url + '" target="_blank">Link</a>');
        marker.on('click', function(e){
            marker.openPopup();
        });
        overlay['Badestellen'].addLayer(marker);         
    });

    // Freibad        
    $(_freibaeder).find("Placemark").each(function(){  
        var description = $(this).find("description").text();    
        var name = $(this).find("name").text();
        var koordinaten = $(this).find("coordinates").text();
        var k = koordinaten.split(",");
        var lon = parseFloat(k[0]);
        var lat = parseFloat(k[1]);
        var marker = L.marker([lat,lon],{icon: icons['freibad']});
        marker.bindPopup('<b>'+ name + '</b><br>' + '<a href=' + description + 'target="_blank">Link</a>');
        marker.on('click', function(e){
            marker.openPopup();
        });
        overlay['Freibäder'].addLayer(marker);
    });

    // FKK
    $(_fkk).find("Placemark").each(function(){ 
        //var description = $b.find("description").text();  
        var name = $(this).find("name").text();
        var koordinaten = $(this).find("coordinates").text();
        var k = koordinaten.split(",");
        var lon = parseFloat(k[0]);
        var lat = parseFloat(k[1]);
        var marker = L.marker([lat,lon],{icon: icons['fkk']});
        marker.bindPopup(name);
        marker.on('click', function(e){
           marker.openPopup();
        });
        overlay['FKK-Baden'].addLayer(marker);
    });

    // Hallenbaeder
    $(_hallenbaeder).find("Placemark").each(function(){
        var description = $(this).find("description").text();    
        var name = $(this).find("name").text();
        var koordinaten = $(this).find("coordinates").text();
        var k = koordinaten.split(",");
        var lon = parseFloat(k[0]);
        var lat = parseFloat(k[1]);
        var marker = L.marker([lat,lon],{icon: icons['hallenbad']});
        marker.bindPopup('<b>'+ name + '</b><br>' + '<a href=' + description + 'target="_blank">Link</a>');
        marker.on('click', function(e){
            marker.openPopup();
        });
        overlay['Hallenbäder'].addLayer(marker);
    });
}
