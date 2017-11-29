/*
https://getaa.org v0.1 - Find Today's AA Meetings
Created by Ron Royston, https://rack.pub
https://github.com/rhroyston/getaa.org
License: MIT
*/

//Revealing Module Pattern (Public & Private) w getAA namespace
var getAA = (function() { 
    
    // FIREBASE CONFIG
    var config = {
        apiKey: "AIzaSyD2bqWZLX95w93ylQLaGjpg9kcMAuCOcn0",
        authDomain: "getaa-ff968.firebaseapp.com",
        databaseURL: "https://getaa-ff968.firebaseio.com",
        storageBucket: "getaa-ff968.appspot.com",
    };
    var firebase = window.firebase;
    
    //INITIALIZE FIREBASE WEB APP
    firebase.initializeApp(config);
    var auth = firebase.auth();   
  
    var pub = {};
    var ref = firebase.database().ref();

    var firebaseRef = firebase.database().ref('geofire');
    
    // Create a new GeoFire instance at the random Firebase location
    var GeoFire = window.GeoFire;
    var geofire = new GeoFire(firebaseRef);
    
    
    var meetings = ref.child("meetings");
    var markers = [];
    var sites = [];
    var map;
    var infoWindow;
    var doc = document;
    var timer = 10; //in milliseconds
    var radius = 96; //in kilometers

    var menuDiv = doc.getElementById('menu');
    var menuButton = doc.querySelector ('.actionButtonTop');
    var menuIcon = doc.querySelector ('.menuIcon');
    var sunday = doc.querySelector('#sunday');
    var monday = doc.querySelector ('#monday');
    var tuesday = doc.querySelector ('#tuesday');
    var wednesday = doc.querySelector ('#wednesday');
    var thursday = doc.querySelector ('#thursday');
    var friday = doc.querySelector ('#friday');
    var saturday = doc.querySelector ('#saturday');
    var weekdays = [sunday,monday,tuesday,wednesday,thursday,friday,saturday];
    
    var changeLocation = doc.getElementById('change-location');
    var landingCard = doc.getElementById('landing-card');
    var closeLandingCard = doc.getElementById('close-landing-card');

    var btnMenu = doc.getElementById('btnMenu');
    var mapElement = doc.getElementById('map');

    menuButton.addEventListener("click", function(){
        menuDiv.classList.toggle("menuHidden");
        menuDiv.classList.toggle("menuShown");
        menuIcon.classList.toggle("flip");
        menuIcon.classList.toggle("menuIconDown");
        menuIcon.classList.toggle("menuIconUp");
    });
    
    //Public method
    pub.initMap = function () {
        
        map = new google.maps.Map(doc.getElementById('map'), {
            //center: {lat: 29.938659, lng: -90.118807},
            zoom: 11,
            minZoom: 10,
            mapTypeControl: false,
        });
        
        var logoControlDiv = document.createElement('DIV');
        var logoControl = new MyLogoControl(logoControlDiv);
        logoControlDiv.index = 0; // used for ordering
        map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(logoControlDiv);
        
        var mgrControlDiv = document.createElement('DIV');
        var mgrControl = new MeetingManagerControl(mgrControlDiv);
        mgrControlDiv.index = 1; // used for ordering
        map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(mgrControlDiv);
        
        
        var errControlDiv = document.createElement('DIV');
        var errControl = new ReportErrorControl(errControlDiv);
        errControlDiv.index = 0; // used for ordering
        map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(errControlDiv);    
     
        infoWindow = new google.maps.InfoWindow({});
        if (navigator.geolocation) {
        // Try HTML5 geolocation
            navigator.geolocation.getCurrentPosition(function(position) {
                lat = position.coords.latitude;
                lng = position.coords.longitude;
                loadMap(lat,lng);
            }, function() {
                
                handleLocationError(true, infoWindow, map.getCenter());
            });
        } else {
            // Browser doesn't support Geolocation
            handleLocationError(false, infoWindow, map.getCenter());
        }
    };
    pub.initMenu = function (weekday) {
        unselectDays (weekdays);
// ********************************
        resetBadges ();
        switch(weekday) {
            case 'sunday':
                sunday.classList.toggle("day-unselected");
                sunday.classList.toggle("day-selected");
                break;
            case 'monday':
                monday.classList.toggle("day-unselected");
                monday.classList.toggle("day-selected");
                break;
            case 'tuesday':
                tuesday.classList.toggle("day-unselected");
                tuesday.classList.toggle("day-selected");
                break;
            case 'wednesday':
                wednesday.classList.toggle("day-unselected");
                wednesday.classList.toggle("day-selected");
                break;
            case 'thursday':
                thursday.classList.toggle("day-unselected");
                thursday.classList.toggle("day-selected");
                break;
            case 'friday':
                friday.classList.toggle("day-unselected");
                friday.classList.toggle("day-selected");
                break;
            case 'saturday':
                saturday.classList.toggle("day-unselected");
                saturday.classList.toggle("day-selected");
                break;
        }
        addDayListener(weekdays);
        menuIcon.className += " menuIconDown";
//****************mnubtn list went here
    };
    
    function loadMap(lat,lng){
                var pos = {
                    lat: lat,
                    lng: lng
                };
                var today = getDayOfWeek();
                infoWindow.setPosition(pos);
                infoWindow.setContent('You are here.');
                map.setCenter(pos);
                landingCard.style.display = 'none';
                btnMenu.style.display = 'inline';
                mapElement.style.height = "100%";
                changeLocation.style.display = 'inline';
                google.maps.event.trigger(map, 'resize');
                getAA.initMenu(today);
                loadQuery(lat,lng,today);
    }
    function unselectDays (arr){
        for (var i = 0, len = arr.length; i < len; i++) {
                arr[i].classList.remove("day-selected");
                arr[i].classList.add("day-unselected");
        }
    }
    function addDayListener(arr){
        for (var i = 0, len = arr.length; i < len; i++) {
            arr[i].addEventListener("click", function(){
                //if click is on day without day-selected class, then clear markers
                //and trigger a filter for chosen day followed by drop
                var d = this.id;
                if(this.classList.contains('day-unselected')){
                    toastUp('Fetching Meetings...');
                    resetBadges();
                    var daysMeetings = dayFilter(d);
                    drop(daysMeetings);
                }
                unselectDays(arr);
                this.classList.remove("day-unselected");
                this.classList.add("day-selected");
            });
        }
    }
    function toast (msg,obj,timeout){
        var snackbarContainer = doc.querySelector('#toast'); //toast div
        if(!obj){obj = ''}
        if(!timeout){timeout = 2750}
        var data = {
            message: msg + obj,
            timeout: timeout
        };
        snackbarContainer.MaterialSnackbar.showSnackbar(data);
    }
    function toastUp(msg){
        var toast = doc.querySelector('#toast');
        var snackbarText = doc.querySelector('.mdl-snackbar__text');
        snackbarText.innerHTML = msg;
        toast.classList.add("mdl-snackbar--active");
    }
    function toastDown(count) {
        setTimeout(function () {
            var toast = doc.getElementById("toast");
            toast.classList.remove("mdl-snackbar--active");
            toast.setAttribute('aria-hidden', 'true');
        }, timer * count);
    }
    function clearMarkers(del) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
        if(del == true){
            markers = [];
        }
    }
    function getDayOfWeek (){
        var d = new Date();
        var weekday = new Array(7);
        weekday[0]=  "sunday";
        weekday[1] = "monday";
        weekday[2] = "tuesday";
        weekday[3] = "wednesday";
        weekday[4] = "thursday";
        weekday[5] = "friday";
        weekday[6] = "saturday";
        var thisDay = weekday[d.getDay()];
        return thisDay;
    }
    function dayFilter (day){
        var filteredResults = [];
        for (var i = 0; i < sites.length; i++) {
            if(sites[i].val().day == day){
                filteredResults.push(sites[i]);
            }
        }
        return filteredResults;
    }
    function addMarkerWithTimeout (site, timeout){
        var dropTimer = window.setTimeout(function() {
            meetingBadgesUp(site);
            var p = new google.maps.LatLng(site.val().latitude, site.val().longitude);
            var boolAm = false;
            var boolNoon = false;
            var boolPm = false;
            var infoContent = '<span class="bold caps">' + site.val().name + 
                    '<br>' + site.val().hour + site.val().min + ' ' + site.val().timeframe + '</span><br><span class="cap">' +
                    '<a href="http://maps.google.com/?q=' + site.val().street + ' ' + site.val().city + ' ' + site.val().state + 
                    ' ' + site.val().zip + '">' + site.val().street + '<br>' + site.val().city + ', ' + site.val().state + 
                    '  ' + site.val().zip + '</a><br>' + site.val().siteNotes + '</span>';
            switch(site.val().timeframe) {
                case 'am':
                    boolAm = true;
                    break;
                case 'noon':
                    boolNoon = true;
                    break;
                case 'pm':
                    boolPm = true;
                    break;
            }
            var marker = new google.maps.Marker({
                position: p,
                map: map,
                day: site.val().day,
                meetingOpen: site.val().meetingOpen,
                meetingClosed: !site.val().meetingOpen,
                onlyMen: site.val().onlyMen,
                onlyWomen: site.val().onlyWomen,
                childcare: site.val().childcare,
                meditation: site.val().meditation,
                speaker: site.val().speaker,
                step: site.val().step,
                spanish: site.val().spanish,
                bigBook: site.val().bigBook,
                discussion: site.val().discussion,
                tradition: site.val().tradition,
                beginner: site.val().beginner,
                am: boolAm,
                noon: boolNoon,
                pm: boolPm,
                animation: google.maps.Animation.DROP,
            });
            markers.push(marker);
            //add infowindow with closure
            google.maps.event.addListener(marker, 'click', (function(marker, site) {
                return function() {
                    infoWindow.setContent(infoContent);
                    infoWindow.open(map, marker);
                };
            })(marker, site));
        }, timeout)
    }

    var lblOpenMeeting = doc.getElementById("lblOpenMeeting");
    var lblClosedMeeting = doc.getElementById("lblClosedMeeting");
    var lblMensOnly = doc.getElementById("lblMensOnly");
    var lblWomensOnly = doc.getElementById("lblWomensOnly");
    var lblChildcare = doc.getElementById("lblChildcare");
    var lblMeditation = doc.getElementById("lblMeditation");
    var lblSpeaker = doc.getElementById("lblSpeaker");
    var lblStep = doc.getElementById("lblStep");
    var lblSpanish = doc.getElementById("lblSpanish");
    var lblBigBook = doc.getElementById("lblBigBook");
    var lblDiscussion = doc.getElementById("lblDiscussion");
    var lblTradition = doc.getElementById("lblTradition");
    var lblBeginner = doc.getElementById("lblBeginner");
    var lblAm = doc.getElementById("lblAm");
    var lblNoon = doc.getElementById("lblNoon");
    var lblPm = doc.getElementById("lblPm");
    var lblEvery = doc.getElementById("lblEvery");
    var badges = [
        lblOpenMeeting,
        lblClosedMeeting,
        lblMensOnly,
        lblWomensOnly,
        lblChildcare,
        lblMeditation,
        lblSpeaker,
        lblStep,
        lblSpanish,
        lblBigBook,
        lblDiscussion,
        lblTradition,
        lblBeginner,
        lblAm,
        lblNoon,
        lblPm,
        lblEvery
        ];
    var meetingOpen = doc.querySelector ('#openMeeting');
    var meetingClosed = doc.querySelector ('#closedMeeting');
    var onlyMen = doc.querySelector ('#mensOnly');
    var onlyWomen = doc.querySelector ('#womensOnly');
    var childcare = doc.querySelector ('#childcare');
    var meditation = doc.querySelector ('#meditation');
    var speaker = doc.querySelector ('#speaker');
    var step = doc.querySelector ('#step');
    var spanish = doc.querySelector ('#spanish');
    var bigBook = doc.querySelector ('#bigBook');
    var discussion = doc.querySelector ('#discussion');
    var tradition = doc.querySelector ('#tradition');
    var beginner = doc.querySelector ('#beginner');
    var am = doc.querySelector ('#am');
    var noon = doc.querySelector ('#noon');
    var pm = doc.querySelector ('#pm');
    var every = doc.querySelector ('#every');        
    var options = [
        meetingOpen,
        meetingClosed,
        onlyMen,
        onlyWomen,
        childcare,
        meditation,
        speaker,
        step,
        spanish,
        bigBook,
        discussion,
        tradition,
        beginner,
        am,
        noon,
        pm,
        every,
    ];
    var locateSubmit = doc.getElementById("locate-submit");
    var loc = doc.querySelector('#manual-location');

    function meetingBadgesUp (meeting){
        if(meeting.val().meetingOpen){lblOpenMeeting.dataset.badge = Number(lblOpenMeeting.dataset.badge) + 1;}
        if(!meeting.val().meetingOpen){lblClosedMeeting.dataset.badge = Number(lblClosedMeeting.dataset.badge) + 1;}
        if(meeting.val().onlyMen){lblMensOnly.dataset.badge = Number(lblMensOnly.dataset.badge) + 1;}
        if(meeting.val().onlyWomen){lblWomensOnly.dataset.badge = Number(lblWomensOnly.dataset.badge) + 1;}
        if(meeting.val().childcare){lblChildcare.dataset.badge = Number(lblChildcare.dataset.badge) + 1;}
        if(meeting.val().meditation){lblMeditation.dataset.badge = Number(lblMeditation.dataset.badge) + 1;}
        if(meeting.val().speaker){lblSpeaker.dataset.badge = Number(lblSpeaker.dataset.badge) + 1;}
        if(meeting.val().step){lblStep.dataset.badge = Number(lblStep.dataset.badge) + 1;}
        if(meeting.val().spanish){lblSpanish.dataset.badge = Number(lblSpanish.dataset.badge) + 1;}
        if(meeting.val().bigBook){lblBigBook.dataset.badge = Number(lblBigBook.dataset.badge) + 1;}
        if(meeting.val().discussion){lblDiscussion.dataset.badge = Number(lblDiscussion.dataset.badge) + 1;}
        if(meeting.val().tradition){lblTradition.dataset.badge = Number(lblTradition.dataset.badge) + 1;}
        if(meeting.val().beginner){lblBeginner.dataset.badge = Number(lblBeginner.dataset.badge) + 1;}
        if(meeting.val().timeframe === 'am'){lblAm.dataset.badge = Number(lblAm.dataset.badge) + 1;}
        if(meeting.val().timeframe === 'noon'){lblNoon.dataset.badge = Number(lblNoon.dataset.badge) + 1;}
        if(meeting.val().timeframe === 'pm'){lblPm.dataset.badge = Number(lblPm.dataset.badge) + 1;}
        if(meeting.val().name){lblEvery.dataset.badge = Number(lblEvery.dataset.badge) + 1;}
    }
    function resetBadges (){
        for (var i = 0, len = badges.length; i < len; i++) {
            badges[i].dataset.badge = '0';
        }
    }
    function checkAll(){
        for (var i = 0, len = badges.length; i < len; i++) {
            badges[i].MaterialCheckbox.check();
        }
        // get selected day of week then filter for those and setmap
        var day = doc.querySelector('.day-selected').id;
        for (var i = 0, l = markers.length; i < l; i++) {
            if (markers[i].day === day){
                markers[i].setMap(map);
            }
        }
    }
    function uncheckAll (){
        for (var i = 0, len = badges.length; i < len; i++) {
            badges[i].MaterialCheckbox.uncheck();
        }
        clearMarkers();
    }

    doc.addEventListener("DOMContentLoaded", function(event) {
        window.snackbarContainer = doc.querySelector('#toast');
        window.componentHandler.upgradeAllRegistered();
        addOptionsListeners(options);
        addLocateListener();
        
        changeLocation.addEventListener("click", function(){
            doc.getElementById('map').style.height = "0";
            landingCard.style.display = 'inline';
        });
        closeLandingCard.addEventListener("click", function(){
            landingCard.style.display = 'none';
            doc.getElementById('map').style.height = "100%";
            google.maps.event.trigger(map, 'resize');
        });
    });
    
    function addLocateListener(){
        //var locateSubmit = doc.getElementById("locate-submit");
        //var loc = doc.querySelector('#manual-location');
        locateSubmit.addEventListener("click", function(){
            //first geocode
            if(isValidAddress(loc.value)){
                geoCode(loc.value);
                //var myResult = geoCode(loc.value);
            } else{
                toast('Address contains invalid characters');
            }
        });
        
        loc.onkeypress = function(e) {
            var event = e || window.event;
            var charCode = event.which || event.keyCode;
        
            if ( charCode == '13' ) {
              locateSubmit.click();
            }
        };
    }
    function isValidAddress(add){
        return /[A-Za-z0-9'\.\-\s\,]/.test(add); //
    }

    function geoCode(add){
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({'address': add}, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                myResult = results[0].geometry.location; // reference LatLng value
                var myArray = myResult.toString().slice(1, -1).split(', ');
                var lat = parseFloat(myArray[0]);
                var lng = parseFloat(myArray[1]);
                loadMap(lat,lng);
                // **************************************************************************************
            } else {
                toast('Location not found.  Please adjust address.  Error: ', status);
            }
        });
    }    
    
    function addOptionsListeners(arr){
        for (var i = 0, len = arr.length; i < len; i++) {
            arr[i].addEventListener("click", function(){
                if (this.id === 'every'){
                    if (this.checked){
                        checkAll();
                    }
                    if (!this.checked){
                        uncheckAll();
                    }                
                } else {
                    if (this.checked){
                        toggleMarkers('add',this.id.toString());
                    }
                    if (!this.checked){
                        toggleMarkers('remove',this.id.toString());
                    }                
                }
            });
        }
    }
    
    // a function to remove individual markers
    function toggleMarkers(action,attr){
        //the following need to be renamed to match recordset key
        switch(attr) {
            case 'openMeeting':
                attr = 'meetingOpen';
                break;
            case 'closedMeeting':
                attr = 'meetingClosed';
                break;
            case 'mensOnly':
                attr = 'onlyMen';
                break;
            case 'womensOnly':
                attr = 'onlyWomen';
                break;
        }
        // if the atribute is true then that marker/meeting has that attribute and we want to remove it
        for (var i = 0, len = markers.length; i < len; i++) {
            if (markers[i][attr]){
                switch(action) {
                    case 'add':
                        markers[i].setMap(map);
                        break;
                    case 'remove':
                        markers[i].setMap(null);
                        break;
                }
            }
        }
    }

    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
    }
    
    function loadQuery(lat,lng,today){
        //console.log('loadQuery function fired with ' + lat,lng,today);
        var geoKeys = [];
        var records=[];
        
        
        var geoQuery = geofire.query({
            center: [lat,lng],
            radius: radius
        });
        
        var onKeyEnteredRegistration = geoQuery.on("key_entered", function(key, location, distance) {
            geoKeys.push(key);
            //console.log('geoQuery event KEY ENTERED with key: ' + key);
        });
    
        // GeoKeys now in array
        var onReadyRegistration = geoQuery.on("ready", function() {
            
            //console.log('geoQuery event READY');
            
            if(geoKeys.length > 0){
                toastUp('Fetching Meetings...');
                // Get recordset for each key into sites array
                readFirebaseNodes(geoKeys).then(function(value) {
                    //filter for today
                    var todaysMeetings = dayFilter(today);
                    drop(todaysMeetings);
                }, function(err) {
                  //console.log(err); // Error!
                });
            } else {
                toastUp('No area meetings found.  You are encouraged to volunteer to add them.  Click <a href="/admin">Meetings Manager</a> to become a site administrator.');
                toastDown(2000);
            }
        });
    }
    
    function readFirebaseNodes(keys) {
        //then we can fetch the meeting detail for each one
        return Promise.all(keys.map(readFirebase));
    }
    
    function readFirebase(key){
        var record = meetings.child(key);
        // Get record
        return record.once('value').then(function(snapshot) {
            sites.push (snapshot);
            }, function(error) {
            // The Promise was rejected.
            toast('Error Fethcing Meetings: ' + error);
        });
    }
    
    function drop(filteredMeetings) {
        clearMarkers(true);
        for (var i = 0; i < filteredMeetings.length; i++) {
            //drop toast once markers all dropped
            if(i === filteredMeetings.length - 1) {
                toastDown(i);
            } 
            addMarkerWithTimeout(filteredMeetings[i], i * timer);
        }
    }
    
    function MyLogoControl(controlDiv) {
        controlDiv.style.padding = '5px';
        var logo = document.createElement('IMG');
        logo.src = '../images/rack.pub.png';
        logo.style.cursor = 'pointer';
        logo.style.height = "16px";
        //controlDiv.appendChild(logo);
    
        //google.maps.event.addDomListener(logo, 'click', function() {
        //    window.location = 'http://www.rack.pub'; 
        //});
    }

    function MeetingManagerControl(controlDiv) {
        controlDiv.style.padding = '5px';
        var data = document.createElement('DIV');
        var t = document.createTextNode("Meetings Manager");     // Create a text node
        data.appendChild(t);
        data.style.cursor = 'pointer';
        data.style.height = "16px";
        data.style.backgroundColor = "rgb(255, 255, 255)";
        data.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
        data.style.fontSize = "10px";
        data.style.fontFamily = '"Roboto", sans-serif';
        controlDiv.appendChild(data);
    
        google.maps.event.addDomListener(data, 'click', function() {
            window.location = '/admin'; 
        });
    }
    
    function ReportErrorControl(controlDiv) {
        controlDiv.style.padding = '5px';
        var data = document.createElement('DIV');
        var t = document.createTextNode("Report a Meeting Error");     // Create a text node
        data.appendChild(t);
        data.style.cursor = 'pointer';
        data.style.height = "16px";
        data.style.backgroundColor = "rgb(255, 255, 255)";
        data.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
        data.style.fontSize = "10px";
        data.style.fontFamily = '"Roboto", sans-serif';
        controlDiv.appendChild(data);
        
        google.maps.event.addDomListener(data, 'click', function() {
            window.location.href = "//github.com/rhroyston/getaa.org/issues";
        });
    }    
    
  //Return just the public parts
  return pub;
}());
