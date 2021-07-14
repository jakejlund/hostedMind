////////////// INITALISE MAIN PROGRAM ///////////////////

const queryString = window.location.search;
const experienceType = new URLSearchParams(queryString).get("type");

//redirect back to index if no selection was made
if (!experienceType || experienceType == null || (experienceType.trim() != "map" && experienceType.trim() != "cube")) {
    window.location.href = "index.html";
}

window.treasureMapMode = (experienceType == "map");
console.log("[v001] We're using this with a ", experienceType, window.treasureMapMode);


var park_env_texture = new THREE.CubeTextureLoader().load([
    "./models/env/park/posx.jpg",
    "./models/env/park/negx.jpg",
    "./models/env/park/posy.jpg",
    "./models/env/park/negy.jpg",
    "./models/env/park/posz.jpg",
    "./models/env/park/negz.jpg"
]);
park_env_texture.format = THREE.RGBFormat;


window.addEventListener('arReady', function () {
    getCameraAndCanvas();
    //switch placeholder footer for one with usable buttons
    document.getElementById('title_image_placeholder').style.display = "none";
    document.getElementById('title_image').style.display = "";
    document.getElementById('lumilogo').src = "assets/lumination_logo_only.svg";
    document.getElementById('edulogo').src="assets/education_logo_only.svg";

});


function disableCameraFlipButton() {
    document.getElementById('camera_black').setAttribute('style', 'fill:#00000020;stroke-width:0.0408328"');
    document.getElementById('camera_link').removeAttribute('xlink:href');
    document.getElementById('camera_link').setAttribute('class', '');
}

var successfulStream = null;
var swappingCameras = false; //flag to stop this happening more than once at a time
function capture() {
    if(swappingCameras){
        return;
    }
    swappingCameras = true;
    const videoConstraints = {
        audio: false,
        video: { facingMode: shouldFaceUser ? 'user' : 'environment' }
    };

    // defaultsOpts.video = { facingMode: shouldFaceUser ? 'user' : 'environment' }
    navigator.mediaDevices.getUserMedia(videoConstraints)
        .then(function (_stream) {
            // console.log("Stream?! ", _stream);
            if(_stream){
                stream = _stream;
                if (window.video) {
                    window.video.srcObject = stream;
                    successfulStream = stream;
                    window.video.play();
                    swappingCameras = false;
                }
            }
        })
        .catch(function (err) {
            window.video.srcObject = successfulStream;
            console.log("Error in getUserMedia", err);
        });
}

var popup_visible = false;
let shouldFaceUser = false; //default is enviroment camera
let stream = null;

function toggleHelp() {
    if (popup_visible) {
        //hide help, show scanning
        document.getElementById('help_popup').setAttribute('style', 'display: none;');
        var scanningUI = document.getElementsByClassName("mindar-ui-scanning");
        if (scanningUI) {
            scanningUI[0].classList.remove("hidden");
        }
    } else {
        //show help, hide scanning
        document.getElementById('help_popup').setAttribute('style', '');
        var scanningUI = document.getElementsByClassName("mindar-ui-scanning");
        if (scanningUI && scanningUI.length > 0) {
            scanningUI[0].classList.add("hidden");
        }
    }
    popup_visible = !popup_visible;
}

window.addEventListener('load', function () {
    document.getElementById('help_link').addEventListener('click', function () {
        toggleHelp();
    });

    document.getElementById('exit_help').addEventListener('click', function () {
        toggleHelp();
    });

    getCameraAndCanvas();
});

var availableCameras = 0;
function getCameraAndCanvas() {
    
    if (!window.video || !window.canvas) {
        availableCameras = 0; //reset counter
        let videos = document.getElementsByTagName('video');
        let canvases = document.getElementsByClassName('a-canvas');
        if (videos && videos.length > 0 && canvases && canvases.length > 0) {
            window.canvas = canvases[0];
            for (var i = 0; i < videos.length; i++) {
                if (!videos[i].id) {
                    window.video = videos[i];

                    const constraints = {
                        audio: false,
                        video: true
                    };

                    navigator.mediaDevices.enumerateDevices().then(function (devices) {
                        for (var i = 0; i < devices.length; i++) {
                            var device = devices[i];
                            if (device.kind === 'videoinput') {
                                availableCameras++;
                            }
                        };
                        if (availableCameras < 2) {
                            disableCameraFlipButton();
                            return false;

                        } else {

                            let supports = navigator.mediaDevices.getSupportedConstraints();
                            if (supports['facingMode'] != true) {
                                disableCameraFlipButton();
                                return false;
                            }

                            document.getElementById('camera_link').addEventListener('click', function () {
                                if (stream == null || swappingCameras) return
                                // we need to flip, stop everything
                                stream.getTracks().forEach(t => { t.stop(); });
                                // toggle / flip
                                shouldFaceUser = !shouldFaceUser;
                                capture();
                            })

                            capture();
                        }
                    });

                    break;
                }
            }

        }
        if (!window.video || !window.canvas) {
            console.log("ERROR: Couldn't get video and canvas. May still be loading.");
            return false;
        }

        // alert("DID THE CAMERA THING!");
        return true;
    }
}

window.addEventListener('resize', function () {
    // console.log("RESIZED!");
    var gotCam = getCameraAndCanvas();
    if (!gotCam) {
        return;
    }

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



////////////// REGISTER AFRAME COMPONENTS ///////////////////

AFRAME.registerComponent("position-for-cube", {
    init: function () {
        // console.log("POSITION IT!", window.treasureMapMode, this);
        if (!window.treasureMapMode) {
            /* position the marker plane in front of the cube */
            this.el.setAttribute("rotation", "-90 0 0 ");
            this.el.setAttribute("position", "0 -0.5 0.5");
            // console.log(this.el.id);
            if(this.el.id=="target-6-parent"){
                // this.el.setAttribute("position", "0.08 -0.08 0");
            }
        }

    }
});

AFRAME.registerComponent("set-speech-opacity", {
    init: function () {
        this.el.addEventListener("model-loaded", e => {
            let mesh = this.el.getObject3D("mesh");
            if (!mesh) { return; }
            mesh.traverse(node => {
                if (!node.material) return;
                node.material.opacity = 0.8;
                node.material.transparent = true;
            });
        })
    }
})

AFRAME.registerComponent("set-earth-textures", {
    init: function () {
        this.el.addEventListener("model-loaded", e => {
            let mesh = this.el.getObject3D("mesh");
            if (!mesh) { return; }
            mesh.traverse(node => {
                if (!node.material) return;
                if (node.material.name == 'Shine') {
                    node.material.envMap = park_env_texture;
                    node.material.needsUpdate = true;
                }
            })
        })
    }
})

AFRAME.registerComponent("set-trophy-textures", {
    init: function () {
        this.el.addEventListener("model-loaded", e => {
            let mesh = this.el.getObject3D("mesh");
            if (!mesh) { return; }
            mesh.traverse(node => {
                if (!node.material) return;
                // console.log(node.material);
                if (node.material.name == 'Wood') {
                    node.material.metalness = 0.2;
                    node.material.roughness = 0.5;
                } else if (node.material.name == "TrophyMetal") {
                    node.material.metalness = 0.8;
                    node.material.roughness = 0;
                }
                else if (node.material.name == "Plaque") {
                    node.material.metalness = 0.8;
                    node.material.roughness = 0;
                }
                node.material.envMap = park_env_texture;
                node.material.needsUpdate = true;

            })
        })
    }
})

AFRAME.registerComponent("set-metalness-roughness", {
    init: function () {
        this.el.addEventListener("model-loaded", e => {
            //remove addEventListener for primitives
            let mesh = this.el.getObject3D("mesh");
            mesh.traverse(node => {
                if (!node.material) return;
                // console.log(node.material.name);
                node.material.metalness = 1;
                node.material.roughness = 0;
                node.material.envMap = park_env_texture;
                node.material.needsUpdate = true;
            })
        })
    }
})

// SIDE 2&3: side-specific behaviours
AFRAME.registerComponent('load-video-side', {
    init: function () {

        // const markerTarget = document.querySelector('#target-2');
        var el = this.el;
        let earth = el.querySelector("#earth");
        let parent = el.querySelector("#parent");
        // console.log("Setting up anim", markerTarget, earthModel, el);

        // earth animation finished
        earth.addEventListener("animation-finished", event => {
            // console.log("earth animation finished");

            const projector = el.querySelector('#projector_scene');
            projector.setAttribute("visible", "true");

            const tv = parent.querySelector('#tv_scene');
            tv.setAttribute("visible", "true");

            const video = parent.querySelector('#video_scene');
            video.setAttribute("visible", "true");

            var video2 = document.querySelector('#video_2');
            video2.play();
            video2.pause();

            var video3 = document.querySelector('#video_3');
            video3.play();
            video3.pause();

            const cone = parent.querySelector('#cone_scene');
            cone.setAttribute("visible", "true");

            const full = parent.querySelector('#fullscreen_scene');
            full.setAttribute("visible", "true");

            const play = parent.querySelector('#play_scene');
            // play.setAttribute("visible","true");

            const pause = parent.querySelector('#pause_scene');
            if (!video2.paused) {
                pause.setAttribute("visible", "true");
                pause.setAttribute("class", "clickable");
                play.setAttribute("visible", "false");
                play.setAttribute("class", "");
            } else {
                play.setAttribute("visible", "true");
                play.setAttribute("class", "clickable");
                pause.setAttribute("visible", "false");
                pause.setAttribute("class", "");
            }
            if (!video3.paused) {
                pause.setAttribute("visible", "true");
                pause.setAttribute("class", "clickable");
                play.setAttribute("visible", "false");
                play.setAttribute("class", "");
            } else {
                play.setAttribute("visible", "true");
                play.setAttribute("class", "clickable");
                pause.setAttribute("visible", "false");
                pause.setAttribute("class", "");
            }
        });


        // marker is lost
        el.addEventListener("targetLost", even => {
            // console.log("target lost");
            const video2 = document.querySelector('#video_2');
            const video3 = document.querySelector('#video_3');
            const play = parent.querySelector('#play_scene');
            const pause = parent.querySelector('#pause_scene');
            video2.pause();
            video3.pause();
            play.setAttribute("visible", "false");
            play.setAttribute("class", "");
            pause.setAttribute("visible", "false");
            pause.setAttribute("class", "");

            const projector = parent.querySelector('#projector_scene');
            projector.setAttribute("visible", "false");

            const tv = parent.querySelector('#tv_scene');
            tv.setAttribute("visible", "false");

            const video = parent.querySelector('#video_scene');
            video.setAttribute("visible", "false");

            const cone = parent.querySelector('#cone_scene');
            cone.setAttribute("visible", "false");

            const full = parent.querySelector('#fullscreen_scene');
            full.setAttribute("visible", "false");
        });
    }
});



AFRAME.registerComponent('load-earth', {
    init: function () {
        const markerTarget = this.el;
        const earth = markerTarget.querySelector('#earth');
        const grass = markerTarget.querySelector('#grass');

        // marker is found
        markerTarget.addEventListener("targetFound", event => {
            // play earth animation
            // console.log("[shared] attempting to play earth anim");
            earth.setAttribute('animation-mixer', { clip: "EarthAnim", loop: "once", clampWhenFinished: "true" });
        });

        markerTarget.addEventListener("animation-finished", event => {
            // console.log("[shared] earth animation finished");
            grass.emit('zoomIn'); //make grass appear              
            grass.setAttribute("visible", "true");
        });

        // marker is lost
        markerTarget.addEventListener("targetLost", event => {
            // console.log("[shared] target lost");
            earth.removeAttribute('animation-mixer');
            grass.setAttribute("scale", "0 0 0");
            grass.setAttribute("visible", "false");
        });
    }
});


//Side 5: side-specific animations
AFRAME.registerComponent('load-side-5', {
    init: function () {

        // const markerTarget = document.querySelector('#target-2');
        var el = this.el;
        let earth = el.querySelector("#earth");
        let parent = el.querySelector("#target-5-parent");
        var model = parent.querySelector("#model")

        // console.log("Setting up anim", markerTarget, earthModel, el);
        // earth animation finished
        earth.addEventListener("animation-finished", event => {
            model.setAttribute("visible","true");
            model.setAttribute("animation-mixer","clip:Start; loop:once;");
            model.addEventListener("animation-finished", event =>{
                model.setAttribute("animation-mixer","clip:Idle; loop:repeat;");
            });
        });


        // marker is lost
        el.addEventListener("targetLost", even => {
            model.setAttribute("visible","false");
        });
    }
});

// SIDE 6: side-specific models animations
AFRAME.registerComponent('load-icons-6', {
    init: function () {
        var clickTimestamp = null;

        const markerTarget = document.querySelector('#target-6');
        let earth = markerTarget.querySelector("#earth");
        var el = this.el;

        el.addEventListener("click", event => {
            window.open("https://www.education.sa.gov.au/world-class", "_blank");
        });

        // earth animation finished
        earth.addEventListener("animation-finished", event => {
            // console.log("earth animation finished");
            // play loading animations and make models visible 
            // console.log("attempting to play load anims");
            el.setAttribute("animation-mixer", { clip: "Start", loop: "once", clampWhenFinished: "true" });

            //avoids small flicker at start of animation
            setTimeout(function () { el.setAttribute("visible", "true"); }, 50);

        });

        // play idle anims once load anims are finished
        el.addEventListener("animation-finished", event => {
            // console.log("attempting to play idle anims");
            el.setAttribute("animation-mixer", { clip: "Idle", loop: "repeat" });
        });

        // marker is lost
        markerTarget.addEventListener("targetLost", even => {
            el.removeAttribute("animation-mixer");
            el.setAttribute("visible", "false");
        });
    }
});


var bubbleCounter = 1;
var phoneCounter = 0;
var bubbleNodes = [];
var modelNodes = [];

AFRAME.registerComponent('animate-side1', {
    init: function () {
        const markerTarget = this.el;

        // phone.addEventListener("model-loaded", e => {
        //     let mesh = phone.getObject3D("mesh");
        //     if (!mesh) { return; }
        //     mesh.traverse(node => {
        //         console.log(node);
        //         if (node.name == "Cube_1") { //TODO update this with names of the screens
        //             modelNodes.push(node);
        //             node.visible = false;
        //         }
        //     });
        // });

        for(var i = 1; i <= 6; i++){
            bubbleNodes.push(markerTarget.querySelector('#bubble' + i));
        }
        // console.log(bubbleNodes);


        // marker is found
        markerTarget.addEventListener("targetFound", event => {
            bubbleCounter = -1;
            phoneCounter = -1;
            runDriftAdjuster = true;
            f();
        });

        markerTarget.addEventListener("targetLost", event => {
            bubbleCounter = -2;
            runDriftAdjuster = false;
        });
    }
});

function displayNextBubble(){
        if (bubbleCounter == -2) {
            return;
        }
        
        //hide previous
        if(bubbleNodes[bubbleCounter]){ bubbleNodes[bubbleCounter].setAttribute("visible", "false"); }
        if(modelNodes[phoneCounter]){ modelNodes[phoneCounter].visible = false; }
    
        //increment for next 
        bubbleCounter++;  if(bubbleCounter >= bubbleNodes.length){ bubbleCounter = 0; }
        phoneCounter++;  if(phoneCounter >= modelNodes.length){ phoneCounter = 0; }

        //retrieve and show next text and phone
        if(modelNodes[phoneCounter]){ modelNodes[phoneCounter].visible = true; }
        if(bubbleNodes[bubbleCounter]){ bubbleNodes[bubbleCounter].setAttribute("visible", "true"); }         
}


var start;
var nextAt;
var runDriftAdjuster = false;
var interval = 6000;
var f = function() {
    if(!runDriftAdjuster) return;

    if (!start) {
        start = new Date().getTime();
        nextAt = start;
    }
    nextAt += interval;

    var drift = (new Date().getTime() - start) % interval;    
    // console.log(drift + "ms");
    displayNextBubble();

    setTimeout(f, nextAt - new Date().getTime());
};

var setScale = function(counter ,model5){
    switch(counter){
        case 0:
            model5.setAttribute("rotation","90 0 0");
            model5.setAttribute("position","0 0 0.75");
            model5.setAttribute("scale","0.02 0.02 0.02");
            break;
        case 1:
            model5.setAttribute("rotation","90 0 0");
            model5.setAttribute("position","0 0 0.7");
            model5.setAttribute("scale","0.015 0.015 0.015");
            break;
        case 2:
            model5.setAttribute("rotation","90 0 0");
            model5.setAttribute("position","0 0.10 0.63");
            model5.setAttribute("scale","0.05 0.05 0.05");
            break;
        case 3:
            model5.setAttribute("rotation","0 -90 -90");
            model5.setAttribute("position","0 0 0.75");
            model5.setAttribute("scale","0.05 0.05 0.05");
            break;
        case 4:
            model5.setAttribute("rotation","90 0 0");
            model5.setAttribute("position","0 0.01 0.75");
            model5.setAttribute("scale","0.1 0.1 0.1");
            break;
        case 5:
            model5.setAttribute("rotation","90 0 0");
            model5.setAttribute("position","0 0.01 0.75");
            model5.setAttribute("scale","0.3 0.3 0.3");
            break;
        case 6:
            model5.setAttribute("rotation","90 0 0");
            model5.setAttribute("position","0 0.01 0.95");
            model5.setAttribute("scale","0.03 0.03 0.03");
            break;
        case 7:
            model5.setAttribute("rotation","90 0 0");
            model5.setAttribute("position","0 0 0.77");
            model5.setAttribute("scale","0.05 0.05 0.05");
            break;
    }
}
document.addEventListener("DOMContentLoaded", function () {

    //Scene 2
    let parent2 = document.querySelector('#target-2');
    const video2 = document.querySelector('#video_2');
    const play2 = parent2.querySelector('#play_scene');
    const pause2 = parent2.querySelector('#pause_scene');
    play2.addEventListener("click", event => {
        console.log("play click");
        video2.play();
        play2.setAttribute("visible", "false");
        play2.setAttribute("class", "");
        pause2.setAttribute("visible", "true");
        pause2.setAttribute("class", "clickable");
    });
    pause2.addEventListener("click", event => {
        console.log("pause click");
        video2.pause();
        play2.setAttribute("visible", "true");
        play2.setAttribute("class", "clickable");
        pause2.setAttribute("visible", "false");
        pause2.setAttribute("class", "");
    });

    //Scene 3
    let parent3 = document.querySelector('#target-3');
    const video3 = document.querySelector('#video_3');
    const play3 = parent3.querySelector('#play_scene');
    const pause3 = parent3.querySelector('#pause_scene');
    play3.addEventListener("click", event => {
        console.log("play click");
        video3.play();
        play3.setAttribute("visible", "false");
        play3.setAttribute("class", "");
        pause3.setAttribute("visible", "true");
        pause3.setAttribute("class", "clickable");
    });
    pause3.addEventListener("click", event => {
        console.log("pause click");
        video3.pause();
        play3.setAttribute("visible", "true");
        play3.setAttribute("class", "clickable");
        pause3.setAttribute("visible", "false");
        pause3.setAttribute("class", "");
    });
    var parent5 = document.querySelector('#target-5');
    var arrowRight5 = parent5.querySelector('#arrow_right');
    var arrowLeft5 = parent5.querySelector('#arrow_left');
    var model5 = parent5.querySelector('#model')
    var counter=0;
    var array = ["./models/Side_5/YearT7oHighSchoolCompression.gltf",
                 "./models/Side_5/NewSchoolIconCompressed.gltf",
                 "./models/Side_5/DFECoinAnimationCompressed.gltf",
                 "./models/Side_5/BuilderBlockExport.gltf",
                 "./models/Side_5/RecruitmentCompressed.gltf",
                 "./models/Side_5/StudentSupportCompressed.gltf",
                 "./models/Side_5/AboriginalWorkforce.gltf",
                 "./models/Side_5/LaptopAnimationCompressed.gltf"]

//1: rotation="90 0 0" position="0 0 0.75" scale="0.02 0.02 0.02"
//2: rotation="90 0 0" position="0 0 0.7" scale="0.015 0.015 0.015"
//3: rotation="90 0 0" position="0 0.10 0.63" scale="0.05 0.05 0.05"
//4: rotation="0 -90 -90" position="0 0 0.75" scale="0.05 0.05 0.05"
//5: rotation="90 0 0" position="0 0.01 0.75" scale="0.1 0.1 0.1"
//6: rotation="90 0 0" position="0 0.01 0.75" scale="0.3 0.3 0.3"
//7: rotation="90 0 0" position="0 0.01 0.95" scale="0.03 0.03 0.03"
//8: rotation="90 0 0" position="0 0.00 0.77" scale="0.05 0.05 0.05"

    arrowRight5.addEventListener('click', event => {
        console.log("right");
        counter++;
        counter = counter%8;
        setScale(counter,model5);
        model5.setAttribute("gltf-model",array[counter])
        model5.removeAttribute("animation-mixer");
        model5.setAttribute("animation-mixer","clip:Start; loop:once;");
        model5.addEventListener("animation-finished", event =>{
                model5.setAttribute("animation-mixer","clip:Idle;loop:repeat;");
            });

    });
    arrowLeft5.addEventListener('click', event => {
        console.log("left");
        counter+=7;
        counter = counter%8;
        setScale(counter,model5);
        model5.setAttribute("gltf-model",array[counter])
        model5.removeAttribute("animation-mixer");
        model5.setAttribute("animation-mixer","clip:Start; loop:once;");
        model5.addEventListener("animation-finished", event =>{
            model5.setAttribute("animation-mixer","clip:Idle; loop:repeat;");
        });
    });
});



AFRAME.registerComponent('show-scanning-ui-on-lost', {
    init: function () {
        const markerTarget = this.el;
        markerTarget.addEventListener("targetLost", event => {
            var scanningUI = document.getElementsByClassName("mindar-ui-scanning");
            if (scanningUI && scanningUI.length > 0) {
                scanningUI[0].classList.remove("hidden");
            }
        });
    }
});

/**
 * TextGeometry component for A-Frame.
 */
var debug = AFRAME.utils.debug;
var error = debug('aframe-text-component:error');
var fontLoader = new THREE.FontLoader();

AFRAME.registerComponent('text-geometry', {
    schema: {
        bevelEnabled: { default: false },
        bevelSize: { default: 8, min: 0 },
        bevelThickness: { default: 12, min: 0 },
        curveSegments: { default: 12, min: 0 },
        font: { type: 'asset', default: './fonts/Museo_Sans_500_Regular.json' },
        height: { default: 0.05, min: 0 },
        size: { default: 0.5, min: 0 },
        style: { default: 'normal', oneOf: ['normal', 'italics'] },
        weight: { default: 'normal', oneOf: ['normal', 'bold'] },
        value: { default: '' }
    },

    /**
     * Called when component is attached and when component data changes.
     * Generally modifies the entity based on the data.
     */
    update: function (oldData) {
        var data = this.data;
        var el = this.el;

        var mesh = el.getOrCreateObject3D('mesh', THREE.Mesh);
        if (data.font.constructor === String) {
            // Load typeface.json font.
            fontLoader.load(data.font, function (response) {
                var textData = AFRAME.utils.clone(data);
                textData.font = response;
                mesh.geometry = new THREE.TextGeometry(data.value, textData);
            });
        } else if (data.font.constructor === Object) {
            // Set font if already have a typeface.json through setAttribute.
            mesh.geometry = new THREE.TextGeometry(data.value, data);
        } else {
            error('Must provide `font` (typeface.json) or `fontPath` (string) to text component.');
        }
    }
});