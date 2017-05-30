define( function( require ) {

    'use strict';
    
	var Postmonger = require( 'postmonger' );
	var $ = require( 'vendor/jquery.min' );

    var connection = new Postmonger.Session();
    var toJbPayload = {};
    var step = 1; 
	var tokens;
	var endpoints;
	
	alert("Paso 0");
	$(window).ready(onRender);
	alert("Paso 10");

    connection.on('initActivity', function(payload) {
        var priority;

		alert("Paso 1");
        if (payload) {
            toJbPayload = payload;
            console.log('payload',payload);
            
			//merge the array of objects.
			var aArgs = toJbPayload['arguments'].execute.inArguments;
			var oArgs = {};
			for (var i=0; i<aArgs.length; i++) {  
				for (var key in aArgs[i]) { 
					oArgs[key] = aArgs[i][key]; 
				}
			}
			//oArgs.priority will contain a value if this activity has already been configured:
			priority = oArgs.priority || toJbPayload['configurationArguments'].defaults.priority;            
        }
        
		$.get( "/version", function( data ) {
			$('#version').html('Version: ' + data.version);
			alert("Version: "+data.version);
		});                

        // If there is no priority selected, disable the next button
        if (!priority) {
            connection.trigger('updateButton', { button: 'next', enabled: false });
        }

		$('#selectPriority').find('option[value='+ priority +']').attr('selected', 'selected');		
		gotoStep(step);
		alert("Paso 11");
        
    });

    connection.on('requestedTokens', function(data) {
		alert("Paso 2");
		if( data.error ) {
			console.error( data.error );
		} else {
			tokens = data;
		}       
		alert("Paso 21");
    });

    connection.on('requestedEndpoints', function(data) {
		alert("Paso 3");
		if( data.error ) {
			console.error( data.error );
		} else {
			endpoints = data;
		}     
		alert("Paso 31");
    });

    connection.on('clickedNext', function() {
        alert("Paso 4");
		step++;
        gotoStep(step);
        connection.trigger('ready');
        alert("Paso 41");
    });

    connection.on('clickedBack', function() {
        alert("Paso 5");
		step--;
        gotoStep(step);
        connection.trigger('ready');
        alert("Paso 51");
    });

    function onRender() {
        alert("Paso 6");
		connection.trigger('ready');

        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');

        // Disable the next button if a value isn't selected
        $('#selectPriority').change(function() {
            var priority = getPriority();
            connection.trigger('updateButton', { button: 'next', enabled: Boolean(priority) });
        });
        alert("Paso 61");
    };

    function gotoStep(step) {
		alert("Paso 7");       
		$('.step').hide();
        switch(step) {
            case 1:
            	alert("Paso 7a");  
            	$('#step1').show();
                connection.trigger('updateButton', { button: 'next', text: 'next', enabled: Boolean(getPriority()) });
                connection.trigger('updateButton', { button: 'back', visible: false });
                break;
            case 2:
            	alert("Paso 7b");  
            	$('#step2').show();
                $('#showPriority').html(getPriority());
                connection.trigger('updateButton', { button: 'back', visible: true });
                connection.trigger('updateButton', { button: 'next', text: 'done', visible: true });
                break;
            case 3: // Only 2 steps, so the equivalent of 'done' - send off the payload
                save();
                break;
        }
        alert("Paso 71");   
    };

    function getPriority() {
        alert("Paso 8");
		return $('#selectPriority').find('option:selected').attr('value').trim();
		alert("Paso 81");
    };

    function save() {
		alert("Paso 9");
        var value = getPriority();

        // toJbPayload is initialized on populateFields above.  Journey Builder sends an initial payload with defaults
        // set by this activity's config.json file.  Any property may be overridden as desired.
        //toJbPayload.name = "my activity";

		//this will be sent into the custom activity body within the inArguments array.
        toJbPayload['arguments'].execute.inArguments.push({"priority": value});

		/*
        toJbPayload['metaData'].things = 'stuff';
        toJbPayload['metaData'].icon = 'path/to/icon/set/from/iframe/icon.png';
        toJbPayload['configurationArguments'].version = '1.1'; // optional - for 3rd party to track their customActivity.js version
        toJbPayload['configurationArguments'].partnerActivityId = '49198498';
        toJbPayload['configurationArguments'].myConfiguration = 'configuration coming from iframe';
		*/
		
		toJbPayload.metaData.isConfigured = true;  //this is required by JB to set the activity as Configured.
        connection.trigger('updateActivity', toJbPayload);
        alert("Paso 91");
    }; 
    	 
});
			
