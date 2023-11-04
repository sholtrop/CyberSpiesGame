<script lang="ts">
  import { goto } from "$app/navigation";
  import { browser } from '$app/environment';

  function gotoDead() {
    setTimeout(() => {
      if (browser) {
          goto("/dead", {replaceState: true});
      }
    }, 5000);
  }

  gotoDead();
</script>

<div>
  <p>You got killed.</p>
</div>