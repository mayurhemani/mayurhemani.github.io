function createTemplateCopy() {
	var e = $("#template").clone();
	e.attr("id", (new Date()).getTime().toString());
	$("#hbody").append(e);
	return e;
}

function getHandler(header, url) {
	return function() {
		$("#modalTitle").html(header);
		$("#modalURL").attr("src", url);
		$("#modalDialog").modal();
	};
}

function loadData(e, header, text, image, url) {
	if (header) {
		e.children(".rowFluid").children(".rowText").children(".entryHeader").html(header);
	}
	if (text) {
		e.children(".rowFluid").children(".rowText").children(".entryBody").html(text);
	}
	if (image) {
		e.children(".rowFluid").children(".rowImage").children(".entryImage").attr("src", image);
	} 
	if (url) {
		e.children(".rowFluid").children(".rowText").children(".entryBtn").click(getHandler(header, url));
	} else {
		e.children(".rowFluid").children(".rowText").children(".entryBtn").hide();
	}
}



function loadEntries() {
	var elem = $("")
	$(".entry").each(function(index, elem) {
		var head = $(elem).children(".header").html();
		var text = $(elem).children(".text").html();
		var img = $(elem).children(".image").text();
		var url = $(elem).children(".url").text();
		loadData(createTemplateCopy(), head, text, img, url);
	});
}

function specialEffects() {
	var img = $("[src='images/pi5.png']").attr("id", "pi_image");
	var evt = new Event(),
    	m = new Magnifier(evt);
    m.attach({
	    thumb: '#pi_image',
	    large: 'images/pi5.png',
	    mode: 'inside',
	    zoom: 3,
	    zoomable: true
	});
}


$(document).ready(function() {
	loadEntries();
	hljs.initHighlightingOnLoad();
	$("#template").hide();
	specialEffects();
});