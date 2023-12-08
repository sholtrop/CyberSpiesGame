<script lang="ts">
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { lobbyStore } from "$lib/stores";
  import { gotoReplace } from "$lib/util";

  function gotoDead() {
    setTimeout(() => {
      if (browser) {
        if ($lobbyStore?.status.state != "meetingCalled") gotoReplace("/dead");
      }
    }, 5000);
  }

  gotoDead();
</script>

<div>
  <p class="text-xl">You got killed.</p>
  <p>Sit or lie on the floor until a meeting is called</p>
  <p>You do not need to do tasks anymore</p>
  <p>You must stay quiet</p>
</div>
