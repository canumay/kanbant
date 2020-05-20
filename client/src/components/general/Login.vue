<template>
  <b-container class="h-100">
    <b-row class="h-100">
      <b-col class="d-flex justify-content-center align-items-center">
        <b-col class="col-12 col-lg-4" style="padding:0;">
          <b-card class="w-100" style="height:55vh;">
            <div class="logo p-3 text-center">
              <img src="~@/assets/images/logo.png" style="height: 100px; border-radius: 10px;" />
            </div>
            <b-form @submit="onSubmit" @reset="onReset" v-if="show">
              <b-form-group class="has-icon" label="Email address:">
                <span class="fa fa-envelope form-control-feedback"></span>
                <b-form-input v-model="form.email" type="email" required placeholder="Enter email"></b-form-input>
              </b-form-group>
              <b-form-group class="has-icon" label="Password:">
                <span class="fa fa-key form-control-feedback"></span>
                <b-form-input
                  v-model="form.password"
                  type="password"
                  required
                  placeholder="Enter password"
                ></b-form-input>
              </b-form-group>
              <b-form-group>
                <b-button type="submit" variant="success" class="login-buttons">Login</b-button>
                <b-button type="submit" variant="primary" class="login-buttons">Register</b-button>
              </b-form-group>
            </b-form>
          </b-card>
        </b-col>
        <b-col class="d-none d-lg-block col-lg-8" style="padding:0;">
          <b-card class="w-100" style="height:55vh;background-color: #17a2b869;">
            <img src="~@/assets/svg/login.svg" class="todo-img" />
          </b-card>
        </b-col>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
export default {
  data() {
    return {
      form: {
        email: "",
        password: ""
      },
      show: true
    };
  },
  methods: {
    onSubmit(evt) {
      evt.preventDefault();
      alert(JSON.stringify(this.form));
    },
    onReset(evt) {
      evt.preventDefault();
      // Reset our form values
      this.form.email = "";
      this.form.name = "";
      this.form.food = null;
      this.form.checked = [];
      // Trick to reset/clear native browser form validation state
      this.show = false;
      this.$nextTick(() => {
        this.show = true;
      });
    }
  }
};
</script>
<style scoped>
.todo-img {
  height: 100%;
}
.login-buttons {
  width: 100%;
  margin-top: 5%;
}
.has-icon .form-control {
  padding-left: 2.375rem;
}
.has-icon .form-control-feedback {
  position: absolute;
  z-index: 2;
  display: block;
  width: 2.375rem;
  height: 2.375rem;
  line-height: 2.375rem;
  text-align: center;
  pointer-events: none;
  color: #aaa;
}
</style>