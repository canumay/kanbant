<template>
  <div>
    <b-navbar toggleable="lg" type="dark" style="background-color: rgba(0, 0, 0, 0.32) !important;">
      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-brand style="width: 100%;">
          <b-img src="../../assets/images/kanbant_logo_nav.svg" height="35"></b-img>
        </b-navbar-brand>
        <b-navbar-nav></b-navbar-nav>

        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <b-nav-item-dropdown right>
            <!-- Using 'button-content' slot -->
            <template v-slot:button-content>
              <em>{{user_email}}</em>
            </template>
            <b-dropdown-item @click="logout()">Sign Out</b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script>
export default {
  props: ["user_email"],
  methods: {
    logout() {
      this.$http
        .get("/auth/logout")
        .then(() => {
          this.$router.push("/login");
        })
        .catch(err => {
          if (err.response.status === 500) {
            this.$router.push("/login");
          }
        });
    }
  }
};
</script>

<style>
</style>