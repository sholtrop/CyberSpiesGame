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

## Game

### NFC Tags

This is an overview of the NFC tags that are used in the game. To have an NFC tag play a certain role, it must contain the associated tag contents in string format.

| Role           | Tag contents      | Amount                | Description                                                                                  |
| -------------- | ----------------- | --------------------- | -------------------------------------------------------------------------------------------- |
| Player Blue    | `"player:blue"`   | 2 (one per shoulder)  |                                                                                              |
| Player Red     | `"player:red"`    | 2 (one per shoulder)  |                                                                                              |
| Player Pink   | `"player:pink"`  | 2 (one per shoulder)  |                                                                                              |
| Player Green   | `"player:green"`  | 2 (one per shoulder)  |                                                                                              |
| Player Yellow  | `"player:yellow"` | 2 (one per shoulder)  |                                                                                              |
| Task `n`       | `"task:n"`        | 7 (one for each task) | Where `n` is the number of task, ranging from 0 to 6.                                        |
| Meeting button | `"meeting:button"` | 1                     | Players must scan this to confirm attendance at a meeting, and to start an emergency meeting |
| Firewall fix | `"firewall:{0,1}"` | 1                     | Players must scan both of these to fix a firewall breach emergency |
| Wiretap| `"wiretap:{0,1,2}"` | 1                     | For the place wiretap task, players must scan all these tags|

