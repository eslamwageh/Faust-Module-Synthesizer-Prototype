# Modular Synthesis Prototype

This is a small prototype designed to practice **FaustNode** connections, **Web Audio API** integration, and **widget modulation** for modular synthesizers in Faust. The prototype includes a basic **oscillator**, **VCO**, and **filter** module, which can be connected and disconnected in a simple interface.

## Features
- **Oscillator** and **VCO** modules with basic waveforms.
- **Filter** module for audio processing.
- Basic connection and disconnection between nodes.

## Instructions
1. **Download the repository**.
2. To run the prototype, open a terminal and use the following command to launch Chrome with disabled security (this resolves CORS issues on Linux):
   ```bash
   google-chrome --user-data-dir="~/chrome-dev-disabled-security" --disable-web-security --disable-site-isolation-trials
   ```
   
## Notes
- The **UI** is basic and not polished. Its main purpose is to test the functionality of node connections and to practice using Faust, the Web Audio API, and widget modulation in modular synthesizers.
- Some parts of the connection logic are **hard-coded** (e.g., if conditions).
- This is intended purely for practice and exploration.

Check out the **demo video**: [🔗 Video Demo](https://drive.google.com/file/d/1cXmoazf1tweEd-iXd1A6b6icdnGuS5Ef/view?usp=drive_link)

