<template>
  <div class="background-template h-100">
    <b-container class="h-100">
      <b-row class="h-100">
        <b-col class="d-flex justify-content-center align-items-center">
          <b-col class="col-12 col-lg-6 col-xl-4" style="padding:0;">
            <b-card style="height: 500px;">
              <div class="logo p-3 text-center" style="overflow-y: hidden;">
                <img src="~@/assets/images/kanbant_logo.svg" style="height: 100px;" />
              </div>
              <b-form>
                <b-form-group class="has-icon" label="Email address:">
                  <span class="fa fa-envelope form-control-feedback"></span>
                  <b-form-input
                    v-model="form.email"
                    type="email"
                    required
                    placeholder="Enter email"
                  ></b-form-input>
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
                <b-alert
                  variant="danger"
                  v-show="isError"
                  show
                  fade
                  style="font-size:15px; padding: 10px;"
                >{{error_message}}</b-alert>
                <b-form-group>
                  <b-button
                    type="submit"
                    variant="success"
                    class="login-buttons"
                    @click.prevent="login"
                  >Login</b-button>
                  <b-button
                    type="submit"
                    variant="primary"
                    class="login-buttons"
                    @click.prevent="register"
                  >Register</b-button>
                </b-form-group>
              </b-form>
            </b-card>
          </b-col>
          <b-col class="d-none d-xl-block col-xl-8" style="padding:0;">
            <b-card style="background-color: #17a2b869; height: 500px;">
              <img src="~@/assets/svg/login.svg" class="todo-img" />
            </b-card>
          </b-col>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        email: "",
        password: ""
      },
      isError: false,
      error_message: ""
    };
  },
  methods: {
    login() {
      this.$http
        .post("/auth/local", this.form)
        .then(res => {
          this.isError = false;
          this.error_message = "";
          if (res.data.status === true) {
            this.$router.push({ path: "/dashboard" });
            this.$swal({
              position: "bottom-end",
              icon: "success",
              toast: true,
              title: "You successfully logged in",
              showConfirmButton: false,
              timer: 1500
            });
          }
        })
        .catch(err => {
          this.isError = true;
          this.error_message = err.response.data.message;
        });
    },
    register() {
      this.$http
        .post("/auth/register", this.form)
        .then(res => {
          if (res.data.status === true) {
            this.$swal({
              position: "bottom-end",
              icon: "success",
              toast: true,
              title: "Project successfully created",
              showConfirmButton: false,
              timer: 1500
            });
            this.login();
          } else {
            this.$swal({
              position: "bottom-end",
              icon: "error",
              toast: true,
              title: "Error occurred creating the project",
              showConfirmButton: false,
              timer: 1500
            });
            this.isError = true;
            this.error_message = res.data.message;
          }
        })
        .catch(err => {
          this.isError = true;
          this.error_message = err.response.data.message;
        });
    }
  }
};
</script>
<style scoped>
.todo-img {
  height: 100%;
  width: 100%;
  object-fit: contain;
}
.login-buttons {
  width: 100%;
  margin-top: 10px;
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

.background-template {
  background-image: url("~@/assets/images/background.jpg");
  background-size: cover !important;
}
</style>