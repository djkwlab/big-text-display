# Big Text Display

Big Text Display turns a phone, tablet, or computer into a large, high-contrast text sign. It is designed for situations where a message needs to be seen from a distance: asking for help, communicating in a noisy environment, showing directions, or displaying a short announcement.

The app is a lightweight Progressive Web App (PWA) that works offline after installation.

## Features

- Write any message and display it in large, automatically sized text.
- Use quick-message chips for `SOS`, `Help`, `Thank you!`, and `Sorry`.
- Save personal quick messages locally with **Save message**. Saved messages remain available on the same device and browser.
- Choose from white, neon green, yellow, red, or a custom text colour.
- Create a custom colour with red, green, and blue sliders.
- Invert the display, using the selected colour as the background with dark text.
- Enter a distraction-free display mode; tap the display to return to editing.
- Share a message using a link. Recipients see a message preview and can choose **Display message** or **Write message** to edit it.
- Install the app on supported devices for a more app-like, offline experience.

## Using the app

1. Type a message, choose a quick-message chip, or save one for later.
2. Choose a text colour and optionally enable **Invert display**.
3. Select **Display message** to show the message at its largest possible size.
4. Tap the displayed message to return to the editor.

## Sharing messages

Select **Share message** to create a link containing the current message. The recipient opens the link to see a preview, then taps **Display message** to show it.

For sharing to work between people, the app must be deployed to a public HTTPS URL. A local `file:///` URL can only be opened on the computer that owns that file.

## Run locally

Open `index.html` in a modern browser for local development. To test sharing properly, serve the files from a local web server or deploy the app to a public HTTPS host.

## Project files

- `index.html`: app structure and controls
- `styles.css`: responsive visual design
- `app.js`: message display, saved settings, quick messages, and sharing logic
- `manifest.webmanifest`: PWA metadata
- `service-worker.js`: offline caching
