

var mediaSource = new MediaSource();

mediaSource.addEventListener('sourceopen', handleSourceOpen, false);

var mediaRecorder;
var recordedBlobs;
var sourceBuffer;


var gumVideo = document.querySelector('video#gum');
var recordedVideo = document.querySelector('video#recorded');

var recordButton = document.querySelector('button#record');
var playButton = document.querySelector('button#play');
var downloadButton = document.querySelector('button#download');

recordButton.onclick = toggleRecording;
playButton.onclick = play;
downloadButton.onclick = download;

var isSecureOrigin = location.protocol === 'https:' || location.hostname === 'localhost';
if(!isSecureOrigin) {
	alert('getUserMedia() must be run from a secure origin: HTTPS or localhost' + '\n\n Changing protocol to HTTPS');
	location.protocol = 'HTTPS';
}

function supportsRecording() {
	return (typeof MediaRecorder !== "undefined" && navigator.getUserMedia );
}

if (!supportsRecording()) {
	alert('Does not support Recording.');
}

var constraints = {
	audio: true,
	video: true
};

function handleSuccess(stream) {
	recordButton.disabled = false;
	console.log('getUserMedia() got stream: ', stream);
	window.stream = stream;

	if(window.URL.createObjectURL) {
		gumVideo.src = window.URL.createObjectURL(stream);
	} else{
		gumVideo.srcObject = stream;
	}
}

function handleError(error) {
	console.log('navigator.getUserMedia error: ', error);
}

navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);

function handleSourceOpen(event) {
	console.log('MediaSource opened');
	sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="h264"');
	console.log('Source buffer: ', sourceBuffer);
}

recordedVideo.addEventListener('error', function(ev) {
	console.log('MediaRecording.recordMedia.error()');
	alert('Your browser cannot play\n\n' + recordedVideo.src + 
		'\n\n media clip. event: ' + JSON.stringify(ev));
}, true);


function handleDataAvailable(event) {
	if (event.data && event.data.size > 0) {
		recordedBlobs.push(event.data);
	}
}

function handleStop(event) {
	console.log('Recorder stopped: ', event);
}

function toggleRecording() {
	if (recordButton.textContent == 'Start Recording') {
		startRecording();
		recordButton.classList.add('button-active');
	} else {
		stopRecording();
		recordButton.textContent = 'Start Recording';
		playButton.disabled = false;
		downloadButton.disabled = false;
		recordButton.classList.remove('button-active');
	}
}


function startRecording() {
	recordedBlobs = [];
	var options = {mimeType: 'video/mp4;codecs=h264'};
  		console.log('STREAM :::: ', window.stream.getVideoTracks());

	if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    	console.log(options.mimeType + ' is not Supported');
    	options = {mimeType: 'video/webm;codecs="vp9"'};
    	
    	if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      		console.log(options.mimeType + ' is not Supported');
      		options = {mimeType: 'video/webm;codecs="vp8"'};
      		
      		if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      		console.log(options.mimeType + ' is not Supported');
      		options = {mimeType: 'video/webm'};

	      		if (!MediaRecorder.isTypeSupported(options.mimeType)) {
	        		console.log(options.mimeType + ' is not Supported');
	        		options = {mimeType: ''};
	      		}
      		}
    	}
  	}

  	try {
  		mediaRecorder = new MediaRecorder(window.stream, options);
  	} catch(e) {
  		console.error('Exception while creating MediaRecorder: ' + e);
  		alert('Exception while creating MediaRecorder: ' + e + '.mimeType: ' + options.mimeType);
  		return ;
  	}

  	console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
  	recordButton.textContent = 'Stop Recording';
  	playButton.disabled = true;
  	downloadButton.disabled = true;

  	mediaRecorder.onstop = handleStop;
  	mediaRecorder.ondataavailable = handleDataAvailable;
  	mediaRecorder.start(10); // collect 10ms of data
  	
  	console.log('MediaRecorder started', mediaRecorder);
}


function stopRecording() {
	mediaRecorder.stop();
	console.log('Recorded Blobs: ', recordedBlobs);
	recordedVideo.controls = true;
}


function play() {
	var superBuffer = new Blob(recordedBlobs, {type: 'video/mp4'});
	if (window.URL.createObjectURL) {
		recordedVideo.src = window.URL.createObjectURL(superBuffer);
	} else {
		recordedVideo.srcObject = superBuffer;
	}
}

function download() {
	var blob = new Blob(recordedBlobs, {type: 'video/mp4'});
	
	var url;

	if(window.URL.createObjectURL) {
		url = window.URL.createObjectURL(blob);
	}

	var a = document.createElement('a');

	a.style.display = 'none';
	a.href = url;
	a.download = 'test.mp4';
	document.body.appendChild(a);
	a.click();

	setTimeout(function() {
		document.body.removeChild(a);
		if (window.URL.revokeObjectURL) {	
			window.URL.revokeObjectURL(url);
		}
	}, 100);
}






