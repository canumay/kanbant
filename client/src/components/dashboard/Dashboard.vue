<template>
  <div class="h-100" :style="getBackgroundCustomization">
    <!-- Navbar -->
    <Navbar :user_email="user_email" />
    <!-- End Of Navbar -->

    <!-- Customization Sidebar -->
    <Sidebar :customization="customization" />
    <!-- End Of Customization Sidebar -->

    <template v-if="projects.options.length > 0">
      <!-- Project Selection -->
      <transition :name="customization.animations.selected">
        <ProjectSelection :projects="projects" />
      </transition>
      <!-- End Of Project Selection -->

      <!-- Columns -->
      <transition :name="customization.animations.selected">
        <PerfectScrollbar class="scroll-area" v-if="loaded">
          <b-container style="max-width: none !important;">
            <b-row>
              <div class="d-flex">
                <b-col
                  class="col kanban-widget"
                  v-for="(column, index) in project_details.columns"
                  :key="index"
                >
                  <!-- Column -->
                  <Column :customization="customization" :column="column" />
                  <!-- End of Column -->
                </b-col>
              </div>
              <span
                class="badge badge-info ml-2"
                style="height: fit-content;font-size: 20px;margin-top: 10px; cursor:pointer;"
                @click="createNewColumn()"
              >
                <i class="fas fa-plus"></i>
              </span>
            </b-row>
          </b-container>
        </PerfectScrollbar>
      </transition>
      <!-- End Of Columns -->
    </template>
    <template v-else>
      <transition :name="customization.animations.selected">
        <div class="text-center" style="margin-top: 5%;">
          <b-img src="../../assets/svg/empty.svg" width="500" />
          <h3
            class="text-white"
            style="text-shadow: black 0px 0px 10px;"
          >Seems like you haven't got any projects</h3>
          <b-button class="mt-2" variant="success" @click="createProject">Create Now</b-button>
        </div>
      </transition>
    </template>

    <!-- Task Context Menu -->
    <vue-simple-context-menu
      :elementId="'taskMenu'"
      :options="options"
      :ref="'vueTaskContextMenu'"
      @option-clicked="taskOptionSelected"
    ></vue-simple-context-menu>
    <!-- End Of TaskContext Menu -->

    <!-- Column Context Menu -->
    <vue-simple-context-menu
      :elementId="'columnMenu'"
      :options="options"
      :ref="'vueColumnContextMenu'"
      @option-clicked="columnOptionSelected"
    ></vue-simple-context-menu>
    <!-- End Of Column Context Menu -->
  </div>
</template>

<script>
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import ProjectSelection from "./ProjectSelection";
import Column from "./Column";
import { PerfectScrollbar } from "vue2-perfect-scrollbar";
import eventBus from "../../eventBus";
// import VueContentLoading from "vue-content-loading"; // TODO: implement this
export default {
  components: {
    Navbar,
    Sidebar,
    ProjectSelection,
    Column,
    PerfectScrollbar
    // VueContentLoading
  },
  watch: {
    "customization.theme.selected": {
      handler: val => {
        localStorage.theme = val;
      },
      deep: true
    },
    "customization.background.selected": {
      handler: val => {
        localStorage.bg = val;
      },
      deep: true
    },
    "customization.icons.selected": {
      handler: val => {
        localStorage.icons = val;
      },
      deep: true
    },
    "customization.animations.selected": {
      handler: val => {
        localStorage.animations = val;
      },
      deep: true
    }
  },
  data() {
    return {
      projects: {
        selected: {},
        options: []
      },
      loaded: false,
      project_details: { title: "", description: "", columns: [] },
      options: [
        {
          name: "Clone",
          slug: "clone"
        },
        {
          name: "Delete",
          slug: "delete"
        }
      ],
      customization: {
        theme: {
          selected: "Light",
          options: ["Dark", "Light"]
        },
        background: {
          selected: "Mountain",
          options: [
            "Random",
            "Solid Dark",
            "Blueish",
            "Valley",
            "Mountain",
            "City",
            "Seaside",
            "Northen Lights"
          ]
        },
        icons: {
          selected: false,
          options: [
            { text: "Yes", value: true },
            { text: "No", value: false }
          ]
        },
        animations: {
          selected: "bounce",
          options: ["fade", "slide-fade", "bounce"]
        }
      },
      user_email: "",
      available_icons: [
        "todo",
        "inprogress",
        "done",
        "programming",
        "mobile-testing",
        "usability-testing",
        "mobile-messages",
        "review",
        "code-review",
        "survey",
        "report",
        "design-notes"
      ]
    };
  },
  computed: {
    getBackgroundCustomization() {
      switch (this.customization.background.selected) {
        case "Solid Dark":
          return `background: linear-gradient(140deg,#151a1f 4%,rgb(43, 41, 41) 13%,#102225 98%);`;
        case "Blueish":
          return `background: linear-gradient(180deg,rgb(50, 43, 167) 0%,rgb(69, 69, 175) 53%,rgba(0, 212, 255, 1) 100%);`;
        case "Valley":
          return "background-image: url('https://i.picsum.photos/id/1015/0/0.jpg');background-size: cover !important;";
        case "Mountain":
          return "background-image: url('https://i.picsum.photos/id/866/0/0.jpg');background-size: cover !important;";
        case "City":
          return "background-image: url('https://i.picsum.photos/id/122/4147/2756.jpg');background-size: cover !important;";
        case "Seaside":
          return "background-image: url('https://i.picsum.photos/id/1019/0/0.jpg');background-size: cover !important;";
        case "Northen Lights":
          return "background-image: url('https://i.picsum.photos/id/1022/0/0.jpg');background-size: cover !important;";
        default:
          return "background-image: url('https://picsum.photos/0/0');background-size: cover !important;";
      }
    }
  },
  methods: {
    checkLocalStorage() {
      if (localStorage.theme) {
        if (this.customization.theme.options.includes(localStorage.theme)) {
          this.customization.theme.selected = localStorage.theme;
        }
      }
      if (localStorage.bg) {
        if (this.customization.background.options.includes(localStorage.bg)) {
          this.customization.background.selected = localStorage.bg;
        }
      }
      if (localStorage.animations) {
        if (
          this.customization.animations.options.includes(
            localStorage.animations
          )
        ) {
          this.customization.animations.selected = localStorage.animations;
        }
      }
      if (localStorage.icons) {
        if (localStorage.icons === "true") {
          this.customization.icons.selected = true;
        } else {
          this.customization.icons.selected = false;
        }
      }
    },
    taskOptionSelected(event) {
      if (event.option.slug === "delete") {
        this.$http
          .delete("/user/tasks", {
            params: { task_id: event.item._id, column_id: event.item.column_id }
          })
          .then(res => {
            if (res.data.status === true) {
              this.$swal({
                position: "bottom-end",
                icon: "success",
                toast: true,
                title: "Task successfully deleted",
                showConfirmButton: false,
                timer: 1500
              });
            } else {
              this.$swal({
                position: "bottom-end",
                icon: "error",
                toast: true,
                title: "Error occurred deleting the task",
                showConfirmButton: false,
                timer: 1500
              });
            }
            this.loadProject(this.projects.selected._id); // load project again.
          })
          .catch(err => {
            if (err.response.status === 401) {
              this.$router.push("/login");
            }
          });
      } else if (event.option.slug === "clone") {
        let { title, expireAt, label, labelType, column_id } = event.item;
        this.$http
          .post("/user/tasks", {
            title,
            expireAt,
            label,
            labelType,
            column_id
          })
          .then(res => {
            if (res.data.status === true) {
              this.$swal({
                position: "bottom-end",
                icon: "success",
                toast: true,
                title: "Task successfully cloned",
                showConfirmButton: false,
                timer: 1500
              });
            } else {
              this.$swal({
                position: "bottom-end",
                icon: "error",
                toast: true,
                title: "Error occurred cloning the task",
                showConfirmButton: false,
                timer: 1500
              });
            }
            this.loadProject(this.projects.selected._id); // load project again.
          })
          .catch(err => {
            if (err.response.status === 401) {
              this.$router.push("/login");
            } else if (err.response.status === 429) {
              this.$swal({
                position: "bottom-end",
                icon: "error",
                toast: true,
                title: `${err.response.data.message}`,
                showConfirmButton: false,
                timer: 2000
              });
            }
          });
      }
    },
    getRandomInt(max) {
      return Math.floor(Math.random() * Math.floor(max));
    },
    createNewColumn() {
      this.$http
        .post("/user/columns", {
          project_id: this.projects.selected._id,
          icon: this.available_icons[
            this.getRandomInt(this.available_icons.length)
          ],
          title:
            "Column " +
            Math.random()
              .toString()
              .slice(2, 5)
        })
        .then(res => {
          if (res.data.status === true) {
            this.$swal({
              position: "bottom-end",
              icon: "success",
              toast: true,
              title: "Column successfully created",
              showConfirmButton: false,
              timer: 1500
            });
          } else {
            this.$swal({
              position: "bottom-end",
              icon: "error",
              toast: true,
              title: "Error occurred creating the column",
              showConfirmButton: false,
              timer: 1500
            });
          }
          this.loadProject(this.projects.selected._id);
        })
        .catch(err => {
          if (err.response.status === 401) {
            this.$router.push("/login");
          } else if (err.response.status === 429) {
            this.$swal({
              position: "bottom-end",
              icon: "error",
              toast: true,
              title: `${err.response.data.message}`,
              showConfirmButton: false,
              timer: 2000
            });
          } else {
            this.$swal({
              position: "bottom-end",
              icon: "error",
              toast: true,
              title: "Error occurred creating the column",
              showConfirmButton: false,
              timer: 500
            });
          }
        });
    },
    columnOptionSelected(event) {
      if (event.option.slug === "delete") {
        console.log(event.item);
        this.$http
          .delete("/user/columns", {
            params: {
              column_id: event.item._id,
              project_id: this.projects.selected._id
            }
          })
          .then(res => {
            if (res.data.status === true) {
              this.$swal({
                position: "bottom-end",
                icon: "success",
                toast: true,
                title: "Column successfully deleted",
                showConfirmButton: false,
                timer: 1500
              });
            } else {
              this.$swal({
                position: "bottom-end",
                icon: "error",
                toast: true,
                title: "Error occurred deleting the column",
                showConfirmButton: false,
                timer: 1500
              });
            }
            this.loadProject(this.projects.selected._id); // load project again.
          })
          .catch(err => {
            if (err.response.status === 401) {
              this.$router.push("/login");
            }
          });
      } else if (event.option.slug === "clone") {
        let { title, icon } = event.item;
        this.$http
          .post("/user/columns", {
            title,
            icon,
            project_id: this.projects.selected._id
          })
          .then(res => {
            if (res.data.status === true) {
              this.$swal({
                position: "bottom-end",
                icon: "success",
                toast: true,
                title: "Column successfully cloned",
                showConfirmButton: false,
                timer: 1500
              });
            } else {
              this.$swal({
                position: "bottom-end",
                icon: "error",
                toast: true,
                title: "Error occurred cloning the column",
                showConfirmButton: false,
                timer: 1500
              });
            }
            this.loadProject(this.projects.selected._id); // load project again.
          })
          .catch(err => {
            if (err.response.status === 401) {
              this.$router.push("/login");
            } else if (err.response.status === 429) {
              this.$swal({
                position: "bottom-end",
                icon: "error",
                toast: true,
                title: `${err.response.data.message}`,
                showConfirmButton: false,
                timer: 2000
              });
            }
          });
      }
    },
    createProject() {
      this.$swal({
        title: "Are you sure?",
        text: "Do you really want to create a new project?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, create it!"
      }).then(result => {
        if (result.value) {
          this.$http
            .post("/user/projects", {
              title:
                "Project " +
                Math.random()
                  .toString()
                  .slice(2, 7)
            })
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
              } else {
                this.$swal({
                  position: "bottom-end",
                  icon: "error",
                  toast: true,
                  title: "Error occurred creating the project",
                  showConfirmButton: false,
                  timer: 1500
                });
              }
              this.getProjects();
            })
            .catch(err => {
              if (err.response.status === 401) {
                this.$router.push("/login");
              } else if (err.response.status === 429) {
                this.$swal({
                  position: "bottom-end",
                  icon: "error",
                  toast: true,
                  title: `${err.response.data.message}`,
                  showConfirmButton: false,
                  timer: 2000
                });
              } else {
                this.$swal({
                  position: "bottom-end",
                  icon: "error",
                  toast: true,
                  title: "Error occurred creating the project",
                  showConfirmButton: false,
                  timer: 2000
                });
              }
            });
        }
      });
    },
    getProjects() {
      this.$http.get("/user/projects").then(res => {
        if (res.data.status && res.data.status === true) {
          this.projects.selected = {};
          this.projects.options = res.data.results;
          if (this.projects.options.length > 0) {
            this.projects.selected = res.data.results[0];
            this.loadProject(res.data.results[0]._id);
          }
        } else {
          console.log("error occurred fetching projects.");
        }
      });
    },
    loadProject(project_id) {
      // this.loaded = false; TODO: Deprecated for now.
      this.$http
        .get("/user/projects", {
          params: { project_id }
        })
        .then(response => {
          this.project_details = response.data.result;
          this.loaded = true;
        })
        .catch(err => {
          if (err.response.status === 401) {
            this.$router.push("/login");
          }
          if (err.response.status === 404) {
            this.getProjects();
          }
        });
    },
    loadUserInformations() {
      this.$http
        .get("/auth/status")
        .then(res => {
          if (res.data.status === true) {
            this.user_email = res.data.user;
          }
        })
        .catch(err => {
          if (err.response.status === 401) {
            this.$router.push("/login");
          }
          if (err.response.status === 404) {
            this.getProjects();
          }
        });
    }
  },
  created() {
    this.checkLocalStorage();
    this.loadUserInformations();
    this.getProjects();

    eventBus.$on("task-option-handled", data => {
      try {
        this.$refs.vueTaskContextMenu.showMenu(data.event, data.item);
      } catch (e) {
        console.log("Task context menu not initialized yet");
      }
    });
    eventBus.$on("column-option-handled", data => {
      try {
        this.$refs.vueColumnContextMenu.showMenu(data.event, data.item);
      } catch (e) {
        console.log("Column context menu not initialized yet");
      }
    });
    eventBus.$on("project-deleted", () => {
      this.getProjects();
    });
    eventBus.$on("load-project", () => {
      this.loadProject(this.projects.selected._id); // load project again.
    });
    eventBus.$on("load-project-with-id", id => {
      this.loadProject(id); // load project with id
    });
    eventBus.$on("create-project", () => {
      this.createProject();
    });
  }
};
</script>
<style src="vue2-perfect-scrollbar/dist/vue2-perfect-scrollbar.css"/>
<style src="vue-multiselect/dist/vue-multiselect.min.css"/>
<style>
.kanban-widget {
  padding: 0;
  margin: 5px;
  min-width: 40vh;
  max-width: 40vh;
  min-height: 50vh;
}
.widget-img img {
  width: 100%;
  max-height: 135px;
  object-fit: contain;
}
.task {
  display: flex;
  border-radius: 8px;
}
.task h4 {
  --text-opacity: 1;
  /* color: #4a5568;
  color: rgba(74, 85, 104, var(--text-opacity)); */
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.025em;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}
.task p {
  --text-opacity: 1;
  color: #718096;
  color: rgba(113, 128, 150, var(--text-opacity));
  font-size: 0.775rem;
  position: absolute;
  bottom: -5px;
  left: 20px;
}
.task span {
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 0.775rem;
  border-radius: 9999px !important;
  padding: 0.5em 0.5em !important;
}
.scroll-area {
  max-height: 80vh;
}
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
.multiselect__tags {
  background-color: #00ff0000 !important;
  border: none !important;
}
.multiselect__input,
.multiselect__single {
  text-shadow: black 0px 0px 10px;
  color: white;
  font-size: 25px;
  background-color: #00ff0000 !important;
}
.multiselect__content-wrapper {
  border: none;
}
.multiselect__option--highlight {
  background: #2a2d2a;
}
.multiselect__option--highlight:after {
  background: #2a2d2a;
  border-radius: 2px;
}
.multiselect__option--selected.multiselect__option--highlight {
  background: black;
  color: #fff;
}
.multiselect__option--selected.multiselect__option--highlight:after {
  background: black;
  color: #fff;
}
.slide-fade-enter-active {
  transition: all 0.5s ease;
}
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateX(10px);
  opacity: 0;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
.bounce-enter-active {
  animation: bounce-in 0.5s;
}
.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.25);
  }
  100% {
    transform: scale(1);
  }
}
body.swal2-height-auto {
  height: 100% !important;
}
</style>