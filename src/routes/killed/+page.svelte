<script lang="ts">
  import { goto } from "$app/navigation";
  import { browser } from '$app/environment';
    import { lobbyStore } from "$lib/stores";

  function gotoDead() {
    setTimeout(() => {
      if (browser) {
          if ($lobbyStore?.status.state != "meetingCalled") goto("/dead", {replaceState: true});
      }
    }, 5000);
  }

  gotoDead();
</script>

<div>
  <p>You got killed.</p>
</div>