# Smart RC Car Controller

Static GitHub Pages controller UI for the Arduino robot car.

## Current Arduino command protocol

- `F` Forward
- `B` Backward
- `L` Left
- `R` Right
- `S` Stop
- `A` Auto mode
- `M` Manual mode
- `1` Servo left
- `2` Servo center
- `3` Servo right
- `D` Distance
- `H` Horn

## Important Bluetooth limitation

The robot currently uses an **HC-05**, which is classic Bluetooth SPP. Normal browser Web Bluetooth is for Bluetooth Low Energy (BLE/GATT), so this static site cannot directly connect to the current HC-05.

The UI is therefore ready in **Demo Mode**, and the Bluetooth layer is isolated in `app.js` so it can be connected to a BLE module later without redesigning the controller.

## GitHub Pages

Put `index.html`, `style.css`, and `app.js` in the repository root and enable GitHub Pages from the repository settings.

GitHub Pages publishes static HTML/CSS/JavaScript files from a repository.
