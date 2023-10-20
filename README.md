## Developing

First, install dependencies with `npm install` (or `pnpm install` or `yarn`). Then start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open

# start the server and make it accessible from LAN (good for mobile development)
npm run dev -- --host
```

#### Ngrok

To access your website on mobile via https (which is required for the NFC API) you can use [Ngrok](https://ngrok.com/). Once installed, run

```bash
ngrok http 5173
```

This will publish port 5173 to a link that Ngrok manages. You can access this link on a mobile device to test out the app.

## Building

N.B. We only need to do this once at the end of the project.

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
