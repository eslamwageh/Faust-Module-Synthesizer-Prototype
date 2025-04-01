// Set to > 0 if the DSP is polyphonic
const FAUST_DSP_VOICES = 0;

/**
 * @typedef {import("./faustwasm").FaustAudioWorkletNode} FaustAudioWorkletNode
 * @typedef {import("./faustwasm").FaustDspMeta} FaustDspMeta
 * @typedef {import("./faustwasm").FaustUIDescriptor} FaustUIDescriptor
 * @typedef {import("./faustwasm").FaustUIGroup} FaustUIGroup
 * @typedef {import("./faustwasm").FaustUIItem} FaustUIItem
 */

/**
 * Registers the service worker.
 */

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js")
            .then(reg => console.log("Service Worker registered", reg))
            .catch(err => console.log("Service Worker registration failed", err));
    });
}

const svgCanvas = document.getElementById('svgCanvas');
let isDragging = false;
let splitteroutput;
let mergerinput;
let curnode;
const connections = [];

document.querySelectorAll('.node').forEach(node => {
  node.addEventListener('mousedown', (e) => {
    isDragging = true;
    curnode = node;
    // Create a new line
    line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', e.target.offsetLeft + e.target.offsetWidth / 2);
    line.setAttribute('y1', e.target.offsetTop + e.target.offsetHeight / 2);
    line.setAttribute('x2', e.target.offsetLeft + e.target.offsetWidth / 2);
    line.setAttribute('y2', e.target.offsetTop + e.target.offsetHeight / 2);
    // line.setAttribute()
    // line.setAttribute('stroke', 'black'); 
    // line.setAttribute('stroke-width', '20'); 
    svgCanvas.appendChild(line);

    // Update line position on mouse move
    document.addEventListener('mousemove', onMouseMove);
  });

// Inside the mouseup event listener where the line is finalized
node.addEventListener('mouseup', (e) => {
    if (isDragging && line) {
        // Finalize the line position
        line.setAttribute('x2', e.target.offsetLeft + e.target.offsetWidth / 2);
        line.setAttribute('y2', e.target.offsetTop + e.target.offsetHeight / 2);

        const targetNode = e.target;
        if (targetNode && curnode !== targetNode) {
            const newLine = line;
            connections.push({
                source: curnode.id,
                target: targetNode.id,
                line: newLine
            });
                    if (curnode.id === "node0-0output" && targetNode.id === "node1-0input") {
            faustNode0.connect(mergerinput,0,0);
        }
        if (curnode.id === "node0-0output" && targetNode.id === "node1-1input") {
            faustNode0.connect(mergerinput,0,1);
        }
        if (curnode.id === "node0-0output" && targetNode.id === "node2-0input") {
            faustNode0.connect(faustNode2);
        }
        if (curnode.id === "node1-0output" && targetNode.id === "node2-0input") {
            splitteroutput.connect(faustNode2, 0, 0);
        }
        if (curnode.id === "node1-1output" && targetNode.id === "node2-0input") {
            splitteroutput.connect(faustNode2, 1, 0);
        }
        if (curnode.id === "node1-2output" && targetNode.id === "node2-0input") {
            splitteroutput.connect(faustNode2, 2, 0);
        }
        if (curnode.id === "node1-3output" && targetNode.id === "node2-0input") {
            splitteroutput.connect(faustNode2, 3, 0);
        }

            newLine.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent unwanted event bubbling
                console.log("Line clicked for removal:", newLine);
                removeConnection(newLine);
            });

            console.log('Connection added:', connections);
        } else {
            svgCanvas.removeChild(line);
        }

        line = null;

        // Remove mousemove listener
        document.removeEventListener('mousemove', onMouseMove);
        isDragging = false;
    }
});
});

// Handle mouseup outside of nodes
document.addEventListener('mouseup', (e) => {
  if (isDragging && line) {
    // Remove the line if dropped outside a valid target
    svgCanvas.removeChild(line);
    line = null;
    isDragging = false;

    // Remove mousemove listener
    document.removeEventListener('mousemove', onMouseMove);
  }
});

function onMouseMove(e) {
  if (isDragging && line) {
    // Update the end of the line to follow the cursor
    line.setAttribute('x2', e.pageX);
    line.setAttribute('y2', e.pageY);
  }
}

function removeConnection(lineElement) {
    console.log("removing");
  // Find the connection in the data structure
  const index = connections.findIndex(conn => conn.line === lineElement);
  if (index !== -1) {
    const { source, target } = connections[index];

    if (source === "node0-0output" && target === "node1-0input") {
        faustNode0.disconnect(mergerinput,0,0);
    }
    if (source === "node0-0output" && target === "node1-1input") {
        faustNode0.disconnect(mergerinput,0,1);
    }
    if (source === "node0-0output" && target === "node2-0input") {
        faustNode0.disconnect(faustNode2);
    }
    if (source === "node1-0output" && target === "node2-0input") {
        console.log("disconnecting");
        splitteroutput.disconnect(faustNode2, 0, 0);
    }
    if (source === "node1-1output" && target === "node2-0input") {
        splitteroutput.disconnect(faustNode2, 1, 0);
    }
    if (source === "node1-2output" && target === "node2-0input") {
        splitteroutput.disconnect(faustNode2, 2, 0);
    }
    if (source === "node1-3output" && target === "node2-0input") {
        splitteroutput.disconnect(faustNode2, 3, 0);
    }

    // Remove the line from the SVG canvas
    svgCanvas.removeChild(lineElement);
    
    // Remove the connection from the data structure
    connections.splice(index, 1);

    console.log('Connection removed:', connections);
  }
}


/////////////////////

/** @type {HTMLDivElement} */
const $divFaustUI0 = document.getElementById("div-faust-ui0");
const $divFaustUI = document.getElementById("div-faust-ui");
const $divFaustUI2 = document.getElementById("div-faust-ui2");


/** @type {typeof AudioContext} */
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioCtx({ latencyHint: 0.00001 });
audioContext.destination.channelInterpretation = "discrete";
audioContext.suspend();

// Declare faustNode as a global variable
let faustNode;
let faustNode0;
// Called at load time
(async () => {

    // Import the create-node module
    const { createFaustNode, createFaustUI } = await import("./create-node.js");

    // To test the ScriptProcessorNode mode
    // const result = await createFaustNode(audioContext, "osc", FAUST_DSP_VOICES, true, 512);
    const result = await createFaustNode(audioContext, "osc", FAUST_DSP_VOICES);
    faustNode = result.faustNode;  // Assign to the global variable
    const result2 = await createFaustNode(audioContext, "filter", FAUST_DSP_VOICES, 2);
    faustNode2 = result2.faustNode;  // Assign to the global variable
    if (!faustNode) throw new Error("Faust DSP not compiled");
    const result0 = await createFaustNode(audioContext, "osc0", FAUST_DSP_VOICES, 0);
    faustNode0 = result0.faustNode;  // Assign to the global variable

    // Create the Faust UI
    await createFaustUI($divFaustUI0, faustNode0);
    await createFaustUI($divFaustUI, faustNode);
    await createFaustUI($divFaustUI2, faustNode2);
    let isDirectConnection = true; // Track state


    splitteroutput = audioContext.createChannelSplitter(4);
    mergerinput = audioContext.createChannelMerger(2);

    mergerinput.connect(faustNode);
    faustNode.connect(splitteroutput);

    faustNode2.connect(audioContext.destination);
})();

// Synchronous function to resume AudioContext, to be called first in the synchronous event listener
function resumeAudioContext() {
    if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
            console.log('AudioContext resumed successfully');
        }).catch(error => {
            console.error('Error when resuming AudioContext:', error);
        });
    }
}

// Function to start MIDI
function startMIDI() {
    // Check if the browser supports the Web MIDI API
    if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess().then(
            midiAccess => {
                console.log("MIDI Access obtained.");
                for (let input of midiAccess.inputs.values()) {
                    input.onmidimessage = (event) => faustNode.midiMessage(event.data);
                    console.log(`Connected to input: ${input.name}`);
                }
            },
            () => console.error("Failed to access MIDI devices.")
        );
    } else {
        console.log("Web MIDI API is not supported in this browser.");
    }
}

// Function to stop MIDI
function stopMIDI() {
    // Check if the browser supports the Web MIDI API
    if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess().then(
            midiAccess => {
                console.log("MIDI Access obtained.");
                for (let input of midiAccess.inputs.values()) {
                    input.onmidimessage = null;
                    console.log(`Disconnected from input: ${input.name}`);
                }
            },
            () => console.error("Failed to access MIDI devices.")
        );
    } else {
        console.log("Web MIDI API is not supported in this browser.");
    }
}

let sensorHandlersBound = false;
let midiHandlersBound = false;

// Function to activate MIDI and Sensors on user interaction
async function activateMIDISensors() {

    // Import the create-node module
    const { connectToAudioInput, requestPermissions } = await import("./create-node.js");

    // Request permission for sensors
    await requestPermissions();

    // Activate sensor listeners
    if (!sensorHandlersBound) {
        await faustNode.startSensors();
        sensorHandlersBound = true;
    }

    // Initialize the MIDI setup
    if (!midiHandlersBound) {
        startMIDI();
        midiHandlersBound = true;
    }

    // Resume the AudioContext
    if (audioContext.state === 'suspended') {
        await audioContext.resume();
    }
}

// Function to suspend AudioContext, deactivate MIDI and Sensors on user interaction
async function deactivateAudioMIDISensors() {

    // Suspend the AudioContext
    if (audioContext.state === 'running') {
        await audioContext.suspend();
    }

    // Deactivate sensor listeners
    if (sensorHandlersBound) {
        faustNode.stopSensors();
        sensorHandlersBound = false;
    }

    // Deactivate the MIDI setup
    if (midiHandlersBound && FAUST_DSP_VOICES > 0) {
        stopMIDI();
        midiHandlersBound = false;
    }
}

// Event listener to handle user interaction
function handleUserInteraction() {

    // Resume AudioContext synchronously
    resumeAudioContext();

    // Launch the activation of MIDI and Sensors
    activateMIDISensors().catch(error => {
        console.error('Error when activating audio, MIDI and sensors:', error);
    });
}

// Activate AudioContext, MIDI and Sensors on user interaction
window.addEventListener('click', handleUserInteraction);
window.addEventListener('touchstart', handleUserInteraction);

// Deactivate AudioContext, MIDI and Sensors on user interaction
window.addEventListener('visibilitychange', function () {
    if (window.visibilityState === 'hidden') {
        deactivateAudioMIDISensors();
    }
});

const toggleButton = document.getElementById('toggleButton');
const connectionLine = document.getElementById('connectionLine');
let isConnected = false;

toggleButton.addEventListener('click', () => {
    isConnected = !isConnected;
    if (isConnected) {
        connectModules();
    } else {
        disconnectModules();
    }
});

function connectModules() {
    const module1 = document.getElementById('div-faust-ui');
    const module2 = document.getElementById('div-faust-ui2');

    const rect1 = module1.getBoundingClientRect();
    const rect2 = module2.getBoundingClientRect();

    const x1 = rect1.right;
    const y1 = rect1.top + rect1.height / 2;
    const x2 = rect2.left;
    const y2 = rect2.top + rect2.height / 2;

    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

    connectionLine.style.width = `${length}px`;
    connectionLine.style.transform = `rotate(${angle}deg)`;
    connectionLine.style.left = `${x1}px`;
    connectionLine.style.top = `${y1}px`;
    connectionLine.style.display = 'block';
}

function disconnectModules() {
    connectionLine.style.display = 'none';
}
