////////////// INITALISE MAIN PROGRAM ///////////////////



window.addEventListener('resize', function () {
    console.log("RESIZED!");


    // adjust the canvas to be scaled the same as 
    // the video and positioned appropriately
    var ratioVideo = window.video.width / window.video.height;
    var ratioDisplay = window.video.clientWidth / window.video.clientHeight;
    var actualWidth = window.video.clientHeight * ratioVideo;
    var actualHeight = window.video.clientWidth / ratioVideo;

    if (ratioDisplay <= ratioVideo) {
        //update canvas to match video size
        window.canvas.style.setProperty("width", window.video.clientWidth + "px", "");
        window.canvas.style.setProperty("height", window.video.clientHeight + "px", "");
        window.canvas.style.setProperty("top", "0px", "important");
        window.canvas.width = actualWidth;
        window.canvas.height = window.video.clientHeight;

    } else {
        //update canvas to match video size
        var diff = (actualHeight - window.video.clientHeight) / 2;
        window.canvas.style.setProperty("width", window.video.clientWidth + "px", "important");
        window.canvas.style.setProperty("height", actualHeight + "px", "important");
        window.canvas.style.setProperty("top", "-" + diff + "px", "important");
        window.canvas.width = window.video.clientWidth;
        window.canvas.height = actualHeight;
    }

    window.canvas.aspectRatio = "auto " + window.canvas.width + "/" + window.canvas.height;
})


