var ref = new Firebase("https://ack.firebaseio.com");
var geofire = new GeoFire(ref.child("geofire"));
var authData = ref.getAuth();
var meetings = ref.child("meetings");

var tools = (function() {
    var statesArray = [];
    var meetingsArray = [];
    
    return {
        statesArray: statesArray,
        meetingsArray: meetingsArray,
        toast: function(msg,obj,timeout){
            var snackbarContainer = document.querySelector('#toast'); //toast div
            if(!obj){obj = ''}
            if(!timeout){timeout = 2750}
            var data = {
                message: msg + obj,
                timeout: timeout
            };
            snackbarContainer.MaterialSnackbar.showSnackbar(data);
        },
        isDup: function (state, street, hour, min, day, timeframe){
            var result = false;
            meetingsArray.forEach(function(data) {
                result = false;
                if (state === data.val().state){
                    if (street === data.val().street) {
                        if (hour == data.val().hour){
                            if (min === data.val().min) {
                                if (day === data.val().day) {
                                    if (timeframe === data.val().timeframe){
                                        result = true;
                                        //tools.toast ('Duplicate found in ' + state + ' on ' + street + ' at ' + hour + min + data.val().timeframe + ' on ' + day + 's.  DB key is: ' + data.val().key);   
                                    }
                                }
                            }    
                        }   
                    }
                }
            });
            return result;
        },
        isDuplicate: function (state, street, hour, min, day, timeframe){
            if($.inArray(state, statesArray) == -1){
                ref.child("meetings").orderByChild("state").equalTo(state).once('value').then(function(snap) {
                    statesArray.push(state);
                    snap.forEach(function(data) {
                        meetingsArray.push(data);
                    });
                    
                    // call this inside the then since all data
                    if(tools.isDup(state, street, hour, min, day, timeframe)){
                        //return true;
                        tools.toast('Error: Duplicate Found');
                    } else {
                        //return false;
                        handleSubmit(state);
                    }
                }, function(error) {
                    console.error(error);
                });
            } else {
                if(tools.isDup(state, street, hour, min, day, timeframe)){
                    //return true;
                    tools.toast('Error: Duplicate Found');
                } else {
                    //return false;
                    handleSubmit(state);
                }                
            }
        },
        removeMeeting: function (){
            var mName = document.querySelector("#meetingName");
            var mKey = mName.dataset.key;
            var mCity = document.querySelector("#meetingCity").value;
            var mState = document.querySelector("#meetingState").value;
            
            ref.child("geofire").child(mKey).remove();
            ref.child("meetings").child(mKey).remove();
            ref.child("states").child(mState).child(mCity).child(mKey).remove(onDeleted);
        },
        removeByKey: function (key,city, state){
            ref.child("geofire").child(key).remove();
            ref.child("meetings").child(key).remove();
            ref.child("states").child(state).child(city).child(key).remove(onDeleted);
        },    
                //be56c0da-5b60-4c16-a824-35a3c3c97430
                //remove stale AlexandriaLA
                //but before handle case where meeting won't load with a tools.toast or something.
        
        
    };
})(); 

var onDeleted = function(error) {
  if (error) {
    tools.toast('ERROR: Delete failed ' + error);
  } else {
    tools.toast('Meeting Deleted');
    //window.location.href = '../admin';
    
  }
};

function setNode(key){
    if (key){
        var thisRef = ref.child('testLocation');
        var obj = {};
        obj[key] = true;
        thisRef.update(obj, onComplete);
    }
}

var onComplete = function(error) {
    if (error) {
        tools.toast('ERROR: Synchronization failed ' + error);
    } else {
        tools.toast('SUCCESS: Synchronization succeeded');
    }
};

var clock = {
    now:Date.now(),
    add:function (qty, units) {
            switch(units.toLowerCase()) {
                case 'weeks'   :  val = qty * 1000 * 60 * 60 * 24 * 7;  break;
                case 'days'    :  val = qty * 1000 * 60 * 60 * 24;  break;
                case 'hours'   :  val = qty * 1000 * 60 * 60;  break;
                case 'minutes' :  val = qty * 1000 * 60;  break;
                case 'seconds' :  val = qty * 1000;  break;
                default       :  val = undefined;  break;
                }
            return val;
            },   
    format:function (timestamp){
            var date = new Date(timestamp);
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var day = date.getDate();
            var hours = date.getHours();
            var minutes = "0" + date.getMinutes();
            var seconds = "0" + date.getSeconds();
            // Will display time in xx/xx/xxxx 00:00:00 format
            return formattedTime = month + '/' + 
                                day + '/' + 
                                year + ' ' + 
                                hours + ':' + 
                                minutes.substr(-2) + 
                                ':' + seconds.substr(-2);
            }
};


var states = [];
function initStates () {
states.push(['al','alabama']);
states.push(['ak','alaska']);
states.push(['az','arizona']);
states.push(['ar','arkansas']);
states.push(['ca','california']);
states.push(['co','colorado']);
states.push(['ct','connecticut']);
states.push(['de','delaware']);
states.push(['fl','florida']);
states.push(['ga','georgia']);
states.push(['hi','hawaii']);
states.push(['id','idaho']);
states.push(['il','illinois']);
states.push(['in','indiana']);
states.push(['ia','iowa']);
states.push(['ks','kansas']);
states.push(['ky','kentucky']);
states.push(['la','louisiana']);
states.push(['me','maine']);
states.push(['md','maryland']);
states.push(['ma','massachusetts']);
states.push(['mi','michigan']);
states.push(['mn','minnesota']);
states.push(['ms','mississippi']);
states.push(['mo','missouri']);
states.push(['mt','montana']);
states.push(['ne','nebraska']);
states.push(['nv','nevada']);
states.push(['nh','new hampshire']);
states.push(['nj','new jersey']);
states.push(['nm','new mexico']);
states.push(['ny','new york']);
states.push(['nc','north carolina']);
states.push(['nd','north dakota']);
states.push(['oh','ohio']);
states.push(['ok','oklahoma']);
states.push(['or','oregon']);
states.push(['pa','pennsylvania']);
states.push(['ri','rhode island']);
states.push(['sc','south carolina']);
states.push(['sd','south dakota']);
states.push(['tn','tennessee']);
states.push(['tx','texas']);
states.push(['ut','utah']);
states.push(['vt','vermont']);
states.push(['va','virginia']);
states.push(['wa','washington']);
states.push(['wv','west virginia']);
states.push(['wi','wisconsin']);
states.push(['wy','wyoming']);
states.push(['as','american samoa']);
states.push(['dc','district of columbia']);
states.push(['fm','federated states of micronesia']);
states.push(['gu','guam']);
states.push(['mh','marshall islands']);
states.push(['mp','northern mariana islands']);
states.push(['pw','palau']);
states.push(['pr','puerto rico']);
states.push(['vi','virgin islands']);
}

var days = [];
function initDays () {
days.push(['all days']);
days.push(['sunday']);
days.push(['monday']);
days.push(['tuesday']);
days.push(['wednesday']);
days.push(['thursday']);
days.push(['friday']);
days.push(['saturday']);
}

var tod = [];
function initTod () {
tod.push(['anytime']);
tod.push(['morning']);
tod.push(['noon']);
tod.push(['afternoon']);
tod.push(['evening']);
tod.push(['midnight']);
}

var checkBoxIds = [];
function initCheckBoxIds () {
checkBoxIds.push(['childcare','#lblChildcare']);
checkBoxIds.push(['onlyMen','#lblMensOnly']);
checkBoxIds.push(['onlyWomen','#lblWomensOnly']);
checkBoxIds.push(['meditation','#lblMeditation']);
checkBoxIds.push(['speaker','#lblSpeaker']);
checkBoxIds.push(['step','#lblStep']);
checkBoxIds.push(['spanish','#lblSpanish']);
checkBoxIds.push(['bigBook','#lblBigBook']);
checkBoxIds.push(['discussion','#lblDiscussion']);
checkBoxIds.push(['tradition','#lblTradition']);
checkBoxIds.push(['beginner','#lblBeginner']);
}

var controller = {   
    onReady: function() {
        if (authData) {
            loadMemberPage();
        } else {
             loadDiv('login'); 
            $('#user').hide();
        }
    },
    onLoggedIn: function() {
        authData = ref.getAuth();
        //location.reload();
        loadMemberPage();
    },
    onLoggedOut: function() {
        var marquee = document.querySelector("#marquee");
        authData = {};
        loadDiv('login');
        $('#chip').hide('slow');
        marquee.innerHTML = '';
        tools.toast('Logged Out');
    },    
};

function loadMemberPage(){
    loadImage(authData);
    ref.child('users').child(authData.uid).once('value').then(function(snap) {
        if(snap.val()){
            if(snap.val().isAdmin == true) {
                loadDiv('admin');
            } else {
                loadDiv('verify');
            }
        }
    }, function(error) {
        // The Promise was rejected.
        tools.toast('Error: ',error);
    });    
}

$(document).ready(controller.onReady);

function loadDiv(div,id){
    $('.msg').html('Loading HTML...');
    new Firebase('https://ack.firebaseio.com/markup/' + div).once('value').then(function(snap) {
        // The Promise was "fulfilled" (it succeeded).
        switch (div) {
            case 'addMeeting':
                $('#' + div).html(snap.val());
                $('#dock').on('blur', '#meetingZip', function() {watchInputs();});
                $('#dock').on('click', '#submit', (handleSubmit));
                break;
            case 'meetings':
                $('#' + div).html(snap.val());
                //$('#marquee').html('Manage Meetings');
                loadDdState();
                $("#newMeeting").click(function(){
                    loadDiv('meetingTemplate');
                });
                //$('#ddState').on('change', function() {
                //    $('#ddState').css("color", "#424242");
                //});
                //aMeeting
                
                break;
            case 'meetingTemplate':
                $('#meetings').html(snap.val());
                if(id){
                    fillMeetingTemplate(id);
                }
                $('.ddsd').on('change', function() {
                    $('.ddsd').css({'color':'#757575','font-weight':'300'});
                });                
                $('.ddst').on('change', function() {
                    $('.ddst').css({'color':'#757575','font-weight':'300'});
                });                
                $('#dock').on('blur', '#meetingZip', function() {watchInputs();});
                
                $("#delete").show().click(function(){
                    tools.removeMeeting();
                }); 
                $("#cancel").click(function(){
                    loadDiv('meetings');
                });
                $("#submit").click(function(){
                    verifySubmit();
                });                 
                break;
            case 'login':
                $('#dock').html(snap.val());
                $('#dock').on('click', '#facebook,#google,#twitter', (authenticate));
                //add close listener
                $("#loginCancel").click(function(event){
                    window.location.href = '../';
                });
                break;
            case 'admin':
                $('#dock').html(snap.val());
                $(".mdl-tabs__tab").click(function(event){
                    var href = $(this).attr('href');
                    tabListener(href);
                });
                $('#marquee').html('Administration Portal');
                break;
            case 'administrator':
                $('#' + div).html(snap.val());
                break;
            case 'import':
                $('#' + div).html(snap.val());
                var dropzone = document.getElementById('dropzone');
                var input = document.getElementById('files');
                
                dropzone.addEventListener("dragenter", dragenter, false);
                dropzone.addEventListener("dragover", dragover, false);
                dropzone.addEventListener("drop", drop, false);

                document.getElementById('files').addEventListener('change', handleFileSelect, false);
                break;
            case 'verify':
                $('#dock').html(snap.val());
                $("#exitVerify").click(function(event){
                    //delete this user from Firebase
                    var name = getName(authData);
                    $('#chip').hide('slow');
                    ref.child("users").child(authData.uid).remove();
                    tools.toast(name + ' deleted from Administrator Database');
                    ref.unauth();
                    authData = {};
                    loadDiv('login');
                });
                $("#agree").click(function(event){
                    var btnContinue = document.querySelector("#continue");
                    if(this.checked){
                        btnContinue.disabled = false;
                    } else {
                        btnContinue.disabled = true;
                    }                  
                });
                $("#continue").click(function(event){
                    ref.child("users").child(authData.uid).update({ isAdmin: true});
                    loadDiv('admin');
                });
                break;
        }
        if(!(typeof(componentHandler) == 'undefined')){
            componentHandler.upgradeAllRegistered();
        }
    }, function(error) {
        // The Promise was rejected.
        tools.toast('Permission Denied.',error);
    });
}

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function adminInit(){
    loadDiv('administrator'); 
}

function tabListener(href){
        // We use class ajaxed to determine whether to load HTML, target.attr('href') fires on menu click
        var targetHtml = $(href).html();
        if (targetHtml.search('.ajaxed') == -1){
            loadDiv(href.substr(1));
        }
        switch (href) {
            case '#administrator':
                $('#marquee').html('Administration Portal');
                break;
            case '#meetings':
                $('#marquee').html('Meetings');
                break;
            case '#users':
                $('#marquee').html('Users');
                break;
        }
}

function loadDdState(){
    ref.child('states').once('value').then(function(snapshot) {
        // The callback function will get called twice, once for "fred" and once for "barney"
        snapshot.forEach(function(childSnapshot) {
            $('#ddState')
                .append($("<option></option>")
                .attr("value",childSnapshot.key())
                .text(childSnapshot.key())
            );
        });
        $('#ddState').removeAttr('disabled').css({'color':'#424242'}).on('change', function() {
            loadDdCity(this.value);
        });
    }, function(error) {
        // The Promise was rejected.
        console.error(error);
    });
}

function loadDdCity(state){
    $('#ddCity').empty();
    ref.child('states').child(state).once('value').then(function(snapshot) {
        if(snapshot){
            $('#ddCity,#ddDay,#ddTimeOfDay').css("color", "#424242");
            
            snapshot.forEach(function(childSnapshot) {
                $('#ddCity')
                    .append($("<option></option>")
                    .attr("value",childSnapshot.key())
                    .text(childSnapshot.key())
                );
            });
            if($.isEmptyObject(days)){
                initDays();
            }
                $.each(days, function( index, value ) {
                    $('#ddDay')
                        .append($("<option></option>")
                        .attr("value",value)
                        .text(value)
                    );
                });                
            
            if($.isEmptyObject(tod)){
                initTod();
            }
                $.each(tod, function( index, value ) {
                    $('#ddTimeOfDay')
                        .append($("<option></option>")
                        .attr("value",value)
                        .text(value)
                    );
                });                
            $('#ddCity,#ddDay,#ddTimeOfDay').removeAttr('disabled'); 
            $('#play').removeAttr('disabled').on('click', function() {
                $('.listing').html('<div class="loader"><div class="mdl-spinner mdl-js-spinner is-active"></div></div>'); /////////////////////////
            
            
                var item = $( "#ddCity" ).val();
                loadMeetings(item,state);
            });            
        }
    }, function(error) {
        // The Promise was rejected.
        console.error(error);
    });
}

function loadMeetings(city,state) {

    var filterDay = $('#ddDay').val().toLowerCase();  //////////////////////
    var filterTime = $('#ddTimeOfDay').val().toLowerCase();  /////////////////////
    var recordTime = '';
    
    return ref.child('states').child(state).child(city).once('value').then(function(snapshot) {
    var reads = [];
    snapshot.forEach(function(childSnapshot) {
        var id = childSnapshot.key();
        var promise = ref.child('meetings').child(id).once('value').then(function(snap) {
            return snap.val();
        }, function(error) {
            // The Promise was rejected.
            console.error(error);
        });
        reads.push(promise);
    });
    return Promise.all(reads);
    }, function(error) {
        // The Promise was rejected.
        tools.toast('ERROR: ' + error);
        //console.error(error);
    }).then(function(values) {
        //for each snap add list item
        //$('#manageMeeting').append('<div class="list-group meetingsList"></div>');
        var html = '<ul class="meetings-list mdl-list">';
        $.each( values, function( index, value ){
           if (value.timeframe == 'am'){
                recordTime = 'morning';
           } else if (value.timeframe == 'noon'){
               recordTime = 'noon';
           } else if (value.timeframe == 'midnight'){
               recordTime = 'midnight';
           } else if (value.timeframe == 'pm'){
                if (value.hour >= 12 && value.hour <= 4){
                recordTime = 'afternoon';
                }
                if (value.hour >= 5 && value.hour <= 11){
                recordTime = 'evening';
                }
            }            

            //if(filterDay === value.day || filterDay === 'all days' & filterTime === recordTime || filterTime === 'anytime'){
            if(filterDay === value.day || filterDay === 'all days'){
                if(filterTime === recordTime || filterTime === 'anytime'){
                    html += '<li class="mdl-list__item mdl-list__item--two-line">';
                    html += '<span class="mdl-list__item-secondary-action">';
                    //html += '<label class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect" for="' + value.key + '">';
                    //html += '<input type="checkbox" id="' + value.key + '" class="mdl-checkbox__input"/>';
                    //html += '</label>';
                    html += '</span>';
                    html += '<span class="mdl-list__item-primary-content">';
                    html += '<span><button id = "' + value.key + '" class="mdl-button mdl-js-button mdl-button--primary aMeeting">' + value.name + '</button></span>';
                    html += '<span class="mdl-list__item-sub-title">' + value.street + ' ' + value.day + '<span class="lowercase">s at </span>' + value.hour + value.timeframe + '</span>';
                    html += '</span>';
                    html += '<span class="mdl-list__item-secondary-content">';
                    html += '<a class="mdl-list__item-secondary-action" href="#">';
                    if(value.meetingOpen) {
                            html += '<i class="material-icons" id="openMeeting' + value.key + '">radio_button_unchecked</i><div class="mdl-tooltip" for="openMeeting' + value.key + '">Open Meeting</div>';
                        } else {
                            html += '<i class="material-icons" id="closedMeeting' + value.key + '">change_history</i><div class="mdl-tooltip" for="closedMeeting' + value.key + '">Closed Meeting</div>';
                        }
                    if(value.onlyMen){html += '<i class="material-icons" id="mensOnly' + value.key + '">star</i><div class="mdl-tooltip" for="mensOnly' + value.key + '">Mens Only</div>';}
                    if(value.onlyWomen) {html += '<i class="material-icons" id="womensOnly' + value.key + '">star_border</i><div class="mdl-tooltip" for="womensOnly' + value.key + '">Womens Only</div>';}
                    if(value.beginner) {html += '<i class="material-icons" id="beginner' + value.key + '">format_bold</i><div class="mdl-tooltip" for="beginner' + value.key + '">Beginner</div>';}
                    if(value.bigBook) {html += '<i class="material-icons" id="bigBook' + value.key + '">local_library</i><div class="mdl-tooltip" for="bigBook' + value.key + '">Big Book</div>';}
                    if(value.childcare) {html += '<i class="material-icons" id="childcare' + value.key + '">child_care</i><div class="mdl-tooltip" for="childcare' + value.key + '">Childcare</div>';}
                    if(value.discussion) {html += '<i class="material-icons" id="discussion' + value.key + '">question_answer</i><div class="mdl-tooltip" for="discussion' + value.key + '">Discussion</div>';}
                    if(value.meditation) {html += '<i class="material-icons" id="meditation' + value.key + '">event_seat</i><div class="mdl-tooltip" for="meditation' + value.key + '">Meditation</div>';}
                    if(value.spanish) {html += '<i class="material-icons" id="espanol' + value.key + '">language</i><div class="mdl-tooltip" for="espanol' + value.key + '">Spanish</div>';}
                    if(value.speaker) {html += '<i class="material-icons" id="speaker' + value.key + '">mic</i><div class="mdl-tooltip" for="speaker' + value.key + '">Speaker</div>';}
                    if(value.tradition) {html += '<i class="material-icons" id="tradition' + value.key + '">flip</i><div class="mdl-tooltip" for="tradition' + value.key + '">Tradition</div>';}
                    if(value.step) {html += '<i class="material-icons" id="step' + value.key + '">format_list_numbered</i><div class="mdl-tooltip" for="step' + value.key + '">Step</div>';}
                    html += '</a>';
                    html += '</span>';
                    html += '</li><hr>';
                }
            }
        });
        html += '</ul>';
        $('.listing').html( html );
        $('#meetingsArea').on('click', '.aMeeting', (loadMeetingTemplate));
        if(!(typeof(componentHandler) == 'undefined')){
            componentHandler.upgradeAllRegistered();
        }
    });
}

function loadMeetingTemplate(id){
    loadDiv('meetingTemplate',this.id);
}
function fillMeetingTemplate(id){
    ref.child('meetings').child(id).once('value').then(function(snapshot) {
    initCheckBoxIds();

    var mName = document.querySelector("#meetingName");
    var mSiteNotes = document.querySelector("#meetingSiteNotes");
    mName.dataset.latitude = Number(snapshot.val().latitude);
    mName.dataset.longitude = Number(snapshot.val().longitude);
    mName.dataset.key = snapshot.val().key;
    
    var mStreet = document.querySelector("#meetingStreet");
    var mCity = document.querySelector("#meetingCity");
    var mState = document.querySelector("#meetingState");
    var mZip = document.querySelector("#meetingZip");
    var mLat = document.querySelector("#latitude");
    var mLon = document.querySelector("#longitude");
    
    var mDay = document.querySelector("#weekday");
    var mHour = document.querySelector("#hour");
    var mMin = document.querySelector("#minute");
    var mTimeframe = document.querySelector("#timeframe");
    //var mOpen = document.querySelector("#openMeeting");

    mName.parentElement.MaterialTextfield.change(snapshot.val().name);
    mSiteNotes.parentElement.MaterialTextfield.change(snapshot.val().siteNotes);
    mStreet.parentElement.MaterialTextfield.change(snapshot.val().street);
    mCity.parentElement.MaterialTextfield.change(snapshot.val().city);
    mState.parentElement.MaterialTextfield.change(snapshot.val().state);
    mZip.parentElement.MaterialTextfield.change(snapshot.val().zip);
    
    if(snapshot.val().meetingOpen == true){
        document.querySelector("#openMeeting").parentNode.MaterialRadio.check();
        document.querySelector("#closedMeeting").parentNode.MaterialRadio.uncheck();
    }
    
    mDay.value = snapshot.val().day;
    mHour.value = snapshot.val().hour;
    mMin.value = snapshot.val().min;
    mTimeframe.value = snapshot.val().timeframe;
    $('.ddsd').css({'color':'#757575','font-weight':'300'});
    $('.ddst').css({'color':'#757575','font-weight':'300'});

    for (i = 0; i < checkBoxIds.length; i++) {
        var switchId=checkBoxIds[i][1];
        var switchKey=checkBoxIds[i][0];
        if(snapshot.val()[switchKey] == true){
            document.querySelector(switchId).MaterialCheckbox.check();
        }
    }
    }, function(error) {
        // The Promise was rejected.
        tools.toast('Error: Load Meeting Failed, ' + error);
    });
}

function authenticate(e) {
    e.preventDefault();
    // prefer pop-ups, so we don't navigate away from the page
    ref.authWithOAuthPopup(this.id, function(error, authData) {
        if (error) {
            if (error.code === "TRANSPORT_UNAVAILABLE") {
              // fall-back to browser redirects
              ref.authWithOAuthRedirect(this.id, function(error) { /* ... */ });
            }
        } else if (authData) {
            // logged in!
            ref.child("users").child(authData.uid).once('value').then(function(snap) {
                if(snap.val()){
                    controller.onLoggedIn();
                } else {
                    // save the user's profile into the database
                    ref.child("users").child(authData.uid).set({
                        provider: authData.provider,
                        name: getName(authData),
                        'roleValue': 5,
                        'isAdmin':false
                    });
                    controller.onLoggedIn();
                }
            }, function(error) {
                // The Promise was rejected.
                console.error(error);
            });
            
        } else {
            // logged out
        }
    },{
        //scope: "email"
    });
}

// find a suitable name based on the meta info given by each provider
function getName(authData) {
    if (authData){
        switch(authData.provider) {
            case 'google':
                return toTitleCase(authData.google.displayName);
            case 'twitter':
                return toTitleCase(authData.twitter.displayName);
            case 'facebook':
                return toTitleCase(authData.facebook.displayName);
        }
    }
}

function logout(){
    ref.unauth();
    controller.onLoggedOut ();
}

function getProfileImage(authData) {
    if(authData){
        switch(authData.provider) {
            case 'google':
                return authData.google.profileImageURL;
            case 'twitter':
                return authData.twitter.profileImageURL;
            case 'facebook':
                return authData.facebook.profileImageURL;
        }
    }
}
function loadImage(authData){
    $('#chip').show();
    $('#chip').html('<img class="round" height="36" src="' + getProfileImage(authData) + '" alt="' + getName(authData) + '"><span class=""> ' + getName(authData) + '</span><span id="close"> &times;&nbsp;&nbsp;</span>');
    $('#chip').click(logout);
}
function watchInputs(){
    var street = $('#meetingStreet').val();
    var city = $('#meetingCity').val();
    var state = $('#meetingState').val();
    var zip = $('#meetingZip').val();
    if((street.trim() !== '')||(city.trim() !=='')){
        //$('#latitude').val(' ').addClass('mdl-spinner mdl-js-spinner is-active');
        //$('#longitude').val(' ').addClass('mdl-spinner mdl-js-spinner is-active');
        geoCode(street,city,state,zip);
    }   
}
function geoCode(street,city,state,zip){
    var geocoder = new google.maps.Geocoder();
    var address = street + ' ' + city + ' ' + state + ' ' + zip;
    geocoder.geocode({'address': address}, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            var myResult = results[0].geometry.location; // reference LatLng value
            var myArray = myResult.toString().slice(1, -1).split(', ');
            //$('#latitude').val((parseFloat(myArray[0])));
            //$('#longitude').val((parseFloat(myArray[1])));
            
            var mName = document.querySelector("#meetingName");
            mName.dataset.latitude = parseFloat(myArray[0]);
            mName.dataset.longitude = parseFloat(myArray[1]);
            
        } else {
            tools.toast('Map location not found.  Please adjust address.  Error: ', status);
        }
    });
}

function verifySubmit(){
    //get value of state field
    //does it match state name in statesArray?
        //if so return true
        //if not return false
    var input = $('#meetingState').val().toLowerCase();
    var str = $('#meetingStreet').val().toLowerCase();
    var day = $("#weekday option:selected").text().toLowerCase();
    var hour = $("#hour option:selected").text();
    var min = $("#minute option:selected").text();
    var timeframe = $("#timeframe option:selected").text().toLowerCase();
    var mName = document.querySelector("#meetingName");
    var found = false;
    var state = "";
    initStates ();
    for (i = 0; i < states.length; i++) {
        var stateAbb=states[i][0];
        var stateFull=states[i][1];
        switch(input) {
            case stateAbb:
                state=stateFull;
                found = true;
                break;
            case stateFull:
                found = true;
                break;
        }
    }
    if(found){
        //state is valid;
        // comment out handleSubmit here and put in isDuplicate.
        //call handle submit from isDuplicate results
        //
        if (mName.dataset.key == ""){
            tools.isDuplicate(state,str,hour,min,day,timeframe);
        } else {
            handleSubmit(state);
        }
    } else {
        //state input is invalid show toast and focus on state box
        tools.toast('State not found!');
        $("#meetingState").focusin();
    }
}



function handleSubmit(state){
    //we want to verify the state text input matches initStates values
    //if so proceed
    //if not fire notification toast and stop
    var id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
    //if data-key !== ""
    var mName = document.querySelector("#meetingName");
    if (mName.dataset.key){
        id = mName.dataset.key;
    } else {
        mName.dataset.key = id;
    }

    var meetingName = $("#meetingName").val().toLowerCase().replace(/[.$#\[\]\/]/g, '');
    var meetingSiteNotes = $("#meetingSiteNotes").val().toLowerCase().replace(/[.$#\[\]\/]/g, '');
    var meetingStreet = $('#meetingStreet').val().toLowerCase().replace(/[.$#\[\]\/]/g, '');
    var city = $('#meetingCity').val().toLowerCase().replace(/[.$#\[\]\/]/g, '');
    if(!state){
        state = $('#meetingState option:selected').text().toLowerCase();
    }
 
    var meetingZip = $('#meetingZip').val().replace(/[.$#\[\]\/]/g, '');
    
    var lat = Number(mName.dataset.latitude);
    var lon = Number(mName.dataset.longitude);
    var day = $("#weekday option:selected").text().toLowerCase();
    var hour = $("#hour option:selected").text();
    var min = $("#minute option:selected").text();
    var timeframe = $("#timeframe option:selected").text().toLowerCase();
    var meetingOpen = false;
    var onlyMen = false;
    var onlyWomen = false;
    var childcare = false;
    var meditation = false;
    var speaker = false;
    var step = false;
    var spanish = false;
    var bigBook = false;
    var discussion = false;
    var tradition = false;
    var beginner = false;
    
    if($('#openMeeting').is(':checked')) {
        meetingOpen = true;
    }
    if($('#mensOnly').is(':checked')) {
        onlyMen = true;
    }    
    if($('#womensOnly').is(':checked')) {
        onlyWomen = true;
    }  
    if($('#childcare').is(':checked')) {
        childcare = true;
    }
    if($('#meditation').is(':checked')) {
        meditation = true;
    }
    if($('#speaker').is(':checked')) {
        speaker = true;
    }
    if($('#step').is(':checked')) {
        step = true;
    }
    if($('#spanish').is(':checked')) {
        spanish = true;
    }
    if($('#bigBook').is(':checked')) {
        bigBook = true;
    }
    if($('#discussion').is(':checked')) {
        discussion = true;
    }
    if($('#tradition').is(':checked')) {
        tradition = true;
    }
    if($('#beginner').is(':checked')) {
        beginner = true;
    }

    ref.child("meetings").child(id).set({
        name: meetingName,
        siteNotes: meetingSiteNotes,
        street: meetingStreet,
        city: city,
        state: state,
        zip: meetingZip,
        latitude: lat,
        longitude: lon,
        day: day,
        hour: hour,
        min: min,
        timeframe: timeframe,
        timestamp: clock.now,
        user: authData.uid,
        author: getName(authData),
        meetingOpen: meetingOpen,
        onlyMen: onlyMen,
        onlyWomen: onlyWomen,
        childcare: childcare,
        meditation: meditation,
        speaker: speaker,
        step: step,
        spanish: spanish,
        bigBook: bigBook,
        discussion: discussion,
        tradition: tradition,
        beginner: beginner,
        key: id,}, 
        setGeofire(id,lat,lon,meetingName)
    );
    setCity(city,state,id);
}

function setCity(city,state,key){
    if (city && state && key){
        var statesRef = ref.child('states');
        var stateRef = statesRef.child(state);
        var cityRef = stateRef.child(city);
        var obj = {};
        obj[key] = true;           
        cityRef.update(obj, onComplete);
    }
}

function setGeofire(id,lat,lon,meetingName){
    geofire.set(id, [lat,lon]).then(function(){
        
    }, function(error) {
        tools.toast(meetingName + ' geolocation data storage error: ', error);
    });
    
}

//fredRef.child('name').set({ first: 'Fred', last: 'Flintstone' });
function upload(name,data){
        var markupRef = ref.child('markup');
        var obj = {};
        obj[name] = data;           
        markupRef.update(obj);
}
function updateAdmin(uid,bool){
        var userRef = ref.child('users').child(uid);
        userRef.update({ isAdmin: bool });
}

function importJson(url){
  $.getJSON( url, function( data ) {
    var counter = 1;
    $.each( data, function( key, val ) {
      setTimeout( function () {

        // need to do isDuplicate and if not then geocoder

        var state = val.state.toLowerCase();
        var street = val.street.toLowerCase().replace(/[.$#\[\]\/]/g, '');
        var hour = val.hour;
        var min = val.min;
        var day = val.day.toLowerCase();
        var timeframe = val.timeframe.toLowerCase();
        
        if($.inArray(state, tools.statesArray) == -1){
            ref.child("meetings").orderByChild("state").equalTo(state).once('value').then(function(snap) {
                tools.statesArray.push(state);
                snap.forEach(function(data) {
                    tools.meetingsArray.push(data);
                });
                if(tools.isDup(state, street, hour, min, day, timeframe)){
                    //console.log('Error: Duplicate Found. Key is ' + val.key);
                    element.out.appendChild(document.createTextNode('Error: Duplicate Found. Key is ' + val.key + '<br>'));
                } else {
                    geoCoder(val);
                }
            }, function(error) {
                element.out.appendChild(document.createTextNode('Error: ' + error + '<br>'));
                //console.error(error);
            });
        } else {
            if(tools.isDup(state, street, hour, min, day, timeframe)){
                //console.log('Error: Duplicate Found. Key is ' + val.key);
                element.out.appendChild(document.createTextNode('Error: Duplicate Found. Key is ' + val.key + '<br>'));
            } else {
                geoCoder(val);
            }                
        }        
        // this and below was original
        //geoCoder(val);
      }, counter * 1200);
      counter ++;
    });
  }); 
}

function geoCoder(rec){
    var geocoder = new google.maps.Geocoder();
    var address = rec.street + ' ' + rec.city + ' ' + rec.state + ' ' + rec.zip;
    var x = document.createElement("p");
    var out = document.getElementById('out');
    geocoder.geocode({'address': address}, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            var myResult = results[0].geometry.location; // reference LatLng value
            var myArray = myResult.toString().slice(1, -1).split(', ');
            rec.latitude = myArray[0];
            rec.longitude = myArray[1];
            writeFirebase(rec);
        } else {
        //console.log('ERROR Geolocating ' + rec.key);

        var t = document.createTextNode('ERROR Geolocating ' + rec.key);
        x.className = "output";
        x.appendChild(t);
        out.appendChild(x);          
          
        }
    });
}

function writeFirebase(val){
    var id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
    var out = document.getElementById('out');
    ref.child("meetings").child(id).set({
        name: val.name.toLowerCase().replace(/[.$#\[\]\/]/g, ''),
        siteNotes: val.siteNotes.toLowerCase().replace(/[.$#\[\]\/]/g, ''),
        street: val.street.toLowerCase().replace(/[.$#\[\]\/]/g, ''),
        city: val.city.toLowerCase().replace(/[.$#\[\]\/]/g, ''),
        state: val.state.toLowerCase(),
        zip: val.zip,
        latitude: parseFloat(val.latitude),
        longitude: parseFloat(val.longitude),
        day: val.day.toLowerCase(),
        hour: val.hour,
        min: val.min,
        timeframe: val.timeframe.toLowerCase(),
        timestamp: clock.now,
        user: authData.uid,
        author: getName(authData),
        //var val = (string === "true");
        meetingOpen: String(val.meetingOpen).toLowerCase() === 'true',
        onlyMen: String(val.onlyMen).toLowerCase() === 'true',
        onlyWomen: String(val.onlyWomen).toLowerCase() === 'true',
        childcare: String(val.childcare).toLowerCase() === 'true',
        meditation: String(val.meditation).toLowerCase() === 'true',
        speaker: String(val.speaker).toLowerCase() === 'true',
        step: String(val.step).toLowerCase() === 'true',
        spanish: String(val.spanish).toLowerCase() === 'true',
        bigBook: String(val.bigBook).toLowerCase() === 'true',
        discussion: String(val.discussion).toLowerCase() === 'true',
        tradition: String(val.tradition).toLowerCase() === 'true',
        beginner: String(val.beginner).toLowerCase() === 'true',
        key: id,}, 
        setGeofire(id,parseFloat(val.latitude),parseFloat(val.longitude))
    );
    setCity(val.city.toLowerCase().replace(/[.$#\[\]\/]/g, ''),val.state.toLowerCase(),id);
    //console.log('key: ' + val.key + ' added.');
    
    var x = document.createElement("p");
    var t = document.createTextNode('key: ' + val.key + ' added.');
    x.className = "output";
    x.appendChild(t);
    out.appendChild(x);
}

//////////////////

function dragenter(e) {
  e.stopPropagation();
  e.preventDefault();
}

function dragover(e) {
  e.stopPropagation();
  e.preventDefault();
}
                
function drop(e) {
  e.stopPropagation();
  e.preventDefault();

  var dt = e.dataTransfer;
  var files = dt.files;

  handleFileDrop(files);
}

  // Setup the dnd listeners.

function handleFileDrop(files){               
    if (window.File && window.FileReader && window.FileList && window.Blob) {

    } else {
        alert('The File APIs are not fully supported in this browser.');
        return;
    }
   if (!files) {
      alert("This browser doesn't seem to support the `files` property of file inputs.");
   }
   else if (!files[0]) {
      alert("Please select a file before clicking 'Load'");               
   }
   else {
      file = files[0];
      fr = new FileReader();
      fr.onload = receivedText;
      fr.readAsText(file);
   }
}

function handleFileSelect(){               
    if (window.File && window.FileReader && window.FileList && window.Blob) {

    } else {
        alert('The File APIs are not fully supported in this browser.');
        return;
    }   

    //input = document.getElementById('files');
    //input = elem;
    console.log(event.target.id);
    var input = document.getElementById(event.target.id);
    console.log('input is ' + input);
    
    if (!input) {
      alert("Um, couldn't find the fileinput element.");
   }
   else if (!input.files) {
      alert("This browser doesn't seem to support the `files` property of file inputs.");
   }
   else if (!input.files[0]) {
      alert("Please select a file before clicking 'Load'");               
   }
   else {
      file = input.files[0];
      fr = new FileReader();
      fr.onload = receivedText;
      fr.readAsText(file);
   }
}

function receivedText() {
    result = fr.result;
    var out = document.getElementById('out');
    var data = JSON.parse(fr.result);
    var x = document.createElement("p");

    var counter = 1;
    $.each( data, function( key, val ) {
        setTimeout( function () {
            // need to do isDuplicate and if not then geocoder
            var state = val.state.toLowerCase();
            var street = val.street.toLowerCase().replace(/[.$#\[\]\/]/g, '');
            var hour = val.hour;
            var min = val.min;
            var day = val.day.toLowerCase();
            var timeframe = val.timeframe.toLowerCase();
            
            if($.inArray(state, tools.statesArray) == -1){
                ref.child("meetings").orderByChild("state").equalTo(state).once('value').then(function(snap) {
                    tools.statesArray.push(state);
                    snap.forEach(function(data) {
                        tools.meetingsArray.push(data);
                    });
                    if(tools.isDup(state, street, hour, min, day, timeframe)){
                        //console.log('Error: Duplicate Found. Key is ' + val.key);

                        
    var t = document.createTextNode('Error: Duplicate Found. Key is ' + val.key);
    x.className = "output";
    x.appendChild(t);
    out.appendChild(x);                        
                        
                    } else {
                        geoCoder(val);
                    }
                }, function(error) {
                    //console.error(error);

                    
    var t = document.createTextNode(error);
    x.className = "output";
    x.appendChild(t);
    out.appendChild(x);
    
                });
            } else {
                if(tools.isDup(state, street, hour, min, day, timeframe)){
                    //console.log('Error: Duplicate Found. Key is ' + val.key);

                    
    var t = document.createTextNode('Error: Duplicate Found. Key is ' + val.key);
    x.className = "output";
    x.appendChild(t);
    out.appendChild(x);
    
                } else {
                    geoCoder(val);
                }                
            }
        }, counter * 1200);
        counter ++;
    });
}