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
  <p>You got killed.</p>
</div>
