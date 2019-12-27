window.onload = function() {
	var btn = document.getElementById("btnLaunchLE");
	btn.onclick = () => {
		let cvc = document.getElementById("eleCVContainer");
		cvc.innerHTML = "";
		var cv = cvc.appendChild(document.createElement("canvas"));
		cv.width="320";
		cv.height="240";
		cv.setAttribute("data-processing-sources", "res/b1.js");
		cv.setAttribute("datasrc", "res/b1.js");
		document.body.appendChild(document.createElement("script")).src="js/processing.min.js";
	};
};