
	$('#btn-1').click(function() {

		$.ajax({
			url: "libs/php/getChildrenInfo.php",
			type: 'POST',
			dataType: 'json',
			data: {
				geonameId: $('#selId').val()
			},
			success: function(result) {

				console.log(JSON.stringify(result['data'][0]));

				if (result.status.name == "ok") {
				
					//console.log(result['data']);
					$('#results').html(result['data'][0]['name']);
				

				}
			
			},
			error: function(jqXHR, textStatus, errorThrown) {
				// your error code
			}
		}); 
	
	});
	$('#btn-2').click(function() {

		$.ajax({
			url: "libs/php/getHierarchyInfo.php",
			type: 'POST',
			dataType: 'json',
			data: {
				geonameId: $('#selgeoId').val()
			},
			success: function(result) {

				console.log(JSON.stringify(result));

				if (result.status.name == "ok") {
				
					//console.log(result['data']);
					for(i in result['data'])
					{$('#results').html(result['data'][i]['name']);}
				

				}
			
			},
			error: function(jqXHR, textStatus, errorThrown) {
				// your error code
			}
		}); 
	
	});

	$('#btn-3').click(function() {

		$.ajax({
			url: "libs/php/getSiblingsInfo.php",
			type: 'POST',
			dataType: 'json',
			data: {
				geonameId: $('#selSibgeoId').val()
			},
			success: function(result) {

				console.log(JSON.stringify(result));

				if (result.status.name == "ok") {
				
					//console.log(result['data']);
					$('#results').html(result['data'][0]['name']);
				

				}
			
			},
			error: function(jqXHR, textStatus, errorThrown) {
				// your error code
			}
		}); 
	
	});
	
	


	





	

	





	
