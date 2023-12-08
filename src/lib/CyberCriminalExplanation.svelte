<script>
  import { VIRUS_SCAN_TIME } from "./consts";
</script>

<h1 class="font-bold text-lg">Cyber Criminals</h1>
<ul class="list-disc w-full px-6 space-y-6 leading-tight mt-6">
  <li>
    Must complete tasks. Start a task by going to its location and scanning its
    NFC tag. You must then complete a minigame.
  </li>
  <li>
    After the minigame is done, scan the task's NFC tag again to complete it.
    Try to not move from the room until you've finished the minigame.
  </li>
  <li>
    If a <b>Firewall Breach</b> is triggered, you or allies must go to two locations
    to fix it within the time limit or lose the game.
  </li>
  <li>
    If a <b>Virus Scan</b> is triggered, you will get a notification.
    Afterwards, you must stand still for {VIRUS_SCAN_TIME} seconds or be locked out
    of tasks.
  </li>
  <li>
    Dead players must still go to the meeting point when a meeting is called,
    but they cannot talk. Afterwards, they can stay there.
  </li>
</ul>
