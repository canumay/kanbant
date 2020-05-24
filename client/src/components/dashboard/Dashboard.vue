<template>
  <div class="h-100" :style="getBackgroundCustomization">
    <!-- Navbar -->
    <Navbar />
    <!-- End Of Navbar -->

    <!-- Customization Sidebar -->
    <Sidebar :customization="customization" />
    <!-- End Of Customization Sidebar -->

    <!-- Project Selection -->
    <ProjectSelection :projects="projects" />
    <!-- End Of Project Selection -->

    <!-- Columns -->
    <transition name="fade">
      <PerfectScrollbar class="scroll-area" v-if="loaded">
        <b-container style="max-width: none !important;">
          <b-row>
            <b-col class="d-flex">
              <b-col
                class="col kanban-widget"
                v-for="(column, index) in project_details.columns"
                :key="index"
              >
                <!-- Column -->
                <Column :customization="customization" :column="column" />
                <!-- End of Column -->
              </b-col>
            </b-col>
          </b-row>
        </b-container>
      </PerfectScrollbar>
    </transition>
    <!-- End Of Columns -->

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
          name: "Edit",
          slug: "edit"
        },
        {
          name: "Delete",
          slug: "delete"
        }
      ],
      customization: {
        theme: {
          selected: "Dark",
          options: ["Dark", "Light"]
        },
        background: {
          selected: "Random",
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
        }
      }
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
          .delete("/user/tasks", { params: { task_id: event.item._id } })
          .then(res => {
            console.log(res.data);
            this.loadProject(this.projects.selected._id); // load project again.
          })
          .catch(err => {
            if (err.response.status === 401) {
              this.$router.push("/login");
            }
            console.log(err.response);
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
            console.log(res.data);
            this.loadProject(this.projects.selected._id); // load project again.
          })
          .catch(err => {
            if (err.response.status === 401) {
              this.$router.push("/login");
            }
            console.log(err.response);
          });
      }
    },
    columnOptionSelected(event) {
      if (event.option.slug === "delete") {
        this.$http
          .delete("/user/columns", { params: { column_id: event.item._id } })
          .then(res => {
            console.log(res.data);
            this.loadProject(this.projects.selected._id); // load project again.
          })
          .catch(err => {
            if (err.response.status === 401) {
              this.$router.push("/login");
            }
            console.log(err.response);
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
            console.log(res.data);
            this.loadProject(this.projects.selected._id); // load project again.
          })
          .catch(err => {
            if (err.response.status === 401) {
              this.$router.push("/login");
            }
            console.log(err.response);
          });
      }
    },
    getProjects() {
      this.$http.get("/user/projects").then(res => {
        if (res.data.status && res.data.status === true) {
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
          } if(err.response.status === 404){
            this.getProjects();
          }
          console.log(err.response);
        });
    }
  },
  created() {
    this.checkLocalStorage();
    this.getProjects();

    eventBus.$on("task-option-handled", data => {
      this.$refs.vueTaskContextMenu.showMenu(data.event, data.item);
    });
    eventBus.$on("column-option-handled", data => {
      this.$refs.vueColumnContextMenu.showMenu(data.event, data.item);
    });
    eventBus.$on("load-project", () => {
      this.loadProject(this.projects.selected._id); // load project again.
    });
    eventBus.$on("load-project-with-id", id => {
      this.loadProject(id); // load project with id
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
  max-height: 150px;
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
.slide-fade-enter-active {
  transition: all 0.3s ease;
}
.slide-fade-leave-active {
  transition: all 0.1s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateX(10px);
  opacity: 0;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>