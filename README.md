## Introduction

CyberSpies is an Among Us-style mobile game to be played in real-life with multiple people, mainly through NFC tag scanning. You will need to self-host this application, have a suitable location with isolated rooms, and have some physical material to play it. 

The game itself involves criminals (crew) and secret agents (impostors). 
Criminals scan physical QR codes with their phones which will give them a task to complete. Tasks are minigames and completing enough of them will win criminals the game. 

Secret agents try to eliminate all of the criminals. One way of doing so is by scanning the NFC tag on the players shoulder, which will kill them. Other than this, secret agents have special powers which they can access by swiping up on their mobile phone, which will reveal their secret screen. For example, a secret agent can sabotage a firewall, which the criminals need to spend time fixing lest they lose the game.

This video shows the app in basic action:
![video](https://github.com/user-attachments/assets/0f3115a1-9475-4833-9a47-51877e552c0e)


The rules for playing are currently not set in stone. The way we have found it most effective is:
- Players are not allowed to run.
- If a player wants to scan your shoulder's NFC tag, you should let them.

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

## Physical material
You will need 23 NFC tags, of which:
- 10 are for the max. 5 players (one on each shoulder)
- 7 are for the tasks
- 1 is for the meeting button
- 2 are for the special firewall fix scenario
- 3 are for the wiretap tasks

To attach NFC tags to clothing, we made custom badges like this:

![tag](https://github.com/user-attachments/assets/68668b85-a294-48d8-94e1-ca05a01653a3)

The other NFC tags need to be placed in locations that are easily described (such as a room with a number) and isolated from each other. 

### NFC Tags overview 
NFC tags play a role in the game based on their string-format contents:

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
