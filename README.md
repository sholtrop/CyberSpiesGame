## Installing and running

You need NodeJS v16.14.2. The easiest way to install NodeJS versions is through [Node Version Manager](https://github.com/nvm-sh/nvm) (`nvm`). Install `nvm` through its official install script:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

Then use `nvm` to install the right NodeJS:

```bash
nvm install 16.14
nvm use 16.14
```

Now you can install the project's dependencies (both frontend and backend):

```bash
npm install
cd server && npm install
```

First, build the frontend:

```bash
npm run build
```

Now, run the backend, which will also serve the frontend:

```bash
# Backend
cd server && npm run dev
```

You now have two options:

1. Run it in the browser
2. Run it on an actual mobile device

Running it in the browser is the easiest. We recommend using the browser's devtools (F12) to simulate a mobile screen. You can open an incognito window to simulate a second player. When testing this way, you cannot scan NFC tags. To undertake game actions, press `CTRl .` to open the dev panel. This will allow you to do things you would normally need to scan an NFC tag for, such as calling a meeting.

The next section explains how to run this on your mobile device.

### Running on a mobile device -- Ngrok

The mobile device must be Android and it must use Google Chrome.
The website will need to be served over HTTPS, and be publicly accessible. [Ngrok](https://ngrok.com/) can take care of both. You will need a (free) Ngrok account and install the `ngrok` CLI.

Once you have installed `ngrok`, while the server from the previous section is running, in a separate terminal:

```bash
ngrok http 3000
```

This will publish port 3000 to a link that Ngrok manages. Ngrok serves this link over HTTPS. You can access this link on a mobile device to test out the app. You can also mix and match mobile-device-players and browser-tab-players this way.

IMPORTANT: If you mix mobile and desktop, you cannot use the join-link of one to join the other. I.e., scanning the desktop browser's lobby QR code with your phone will _not_ work. You must instead enter the lobby's join code into the URL manually.

If you happen to have NFC tags and would like to use them, the next section explains what data you should put on your NFC tags.

### NFC Tags

This is an overview of the NFC tags that are used in the game. To have an NFC tag play a certain role, it must contain the associated tag contents in string format.

| Role           | Tag contents        | Amount                | Description                                                                                  |
| -------------- | ------------------- | --------------------- | -------------------------------------------------------------------------------------------- |
| Player Blue    | `"player:blue"`     | 2 (one per shoulder)  |                                                                                              |
| Player Red     | `"player:red"`      | 2 (one per shoulder)  |                                                                                              |
| Player Pink    | `"player:pink"`     | 2 (one per shoulder)  |                                                                                              |
| Player Green   | `"player:green"`    | 2 (one per shoulder)  |                                                                                              |
| Player Yellow  | `"player:yellow"`   | 2 (one per shoulder)  |                                                                                              |
| Task `n`       | `"task:n"`          | 7 (one for each task) | Where `n` is the number of task, ranging from 0 to 6.                                        |
| Meeting button | `"meeting:button"`  | 1                     | Players must scan this to confirm attendance at a meeting, and to start an emergency meeting |
| Firewall fix   | `"firewall:{0,1}"`  | 2                     | Players must scan both of these to fix a firewall breach emergency                           |
| Wiretap        | `"wiretap:{0,1,2}"` | 3                     | For the place wiretap task, players must scan all these tags                                 |
